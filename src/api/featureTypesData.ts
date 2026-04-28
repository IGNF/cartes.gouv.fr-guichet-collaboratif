import { CommunityGeoservice, FeatureTypeColumn, FeatureTypeIds, FeatureTypeStyleItemData, GeoserviceFeatureTypeProp } from "@/constants/communities/types";
import { DATABASE_API_URL } from "@/constants/urls";
import { getAxiosApi } from ".";
import { featureDefaultStyle } from "@/constants/styles";
import { transformExtent } from "ol/proj";
import { QueryClient } from "@tanstack/react-query";
import { Extent } from "ol/extent";
import { appendLogoSize, resolveLogoUri } from "./featureTypeLogo";

const ensureStylesList = (resData: { styles?: FeatureTypeStyleItemData[]; style?: FeatureTypeStyleItemData }) => {
    const styles = resData.styles || [];
    if (resData.style && !styles.some((s) => s.name === resData.style?.name)) {
        styles.unshift(resData.style);
    }
    return styles;
};

const inferGeometryType = (geometryColumn: FeatureTypeColumn): GeoserviceFeatureTypeProp => {
    let geomType: GeoserviceFeatureTypeProp = GeoserviceFeatureTypeProp.POINT;

    if (geometryColumn.type.includes("Polygon")) {
        geomType = GeoserviceFeatureTypeProp.POLYGON;
    } else if (geometryColumn.type.includes("Line")) {
        geomType = GeoserviceFeatureTypeProp.LINE;
    }

    return geomType;
};

const mapColumns = (columns: FeatureTypeColumn[]) =>
    columns.map((col) => {
        return {
            name: col.name,
            type: col.type,
            enum: col.enum,
            title: col.title,
            nullable: col.nullable,
            description: col.description,
            crs: col.crs,
            default_value: col.default_value,
            required: col.required,
            read_only: col.read_only,
            min_length: col.min_length,
            max_length: col.max_length,
            pattern: col.pattern,
            min_value: col.min_value,
            max_value: col.max_value,
            is3d: col.is3d,
            queryable: col.queryable,
            automatic: col.automatic,
        };
    });

const mapStyleChildren = async (style: FeatureTypeStyleItemData) => {
    return Promise.all(
        (style?.children || []).map(async (type: FeatureTypeStyleItemData) => {
            const resolvedChildLogo = await resolveLogoUri(appendLogoSize(type?.uri));
            const title = type.name ?? type.label ?? "Sans titre";
            return {
                title,
                type: type.graphicName,
                featureType: style.type as GeoserviceFeatureTypeProp | undefined,
                pointRadius: type.pointRadius,
                fillColor: type.fillColor,
                fillOpacity: type.fillOpacity,
                strokeColor: type.strokeColor,
                strokeWidth: type.strokeWidth,
                strokeDashstyle: type.strokeDashstyle,
                strokeLinecap: type.strokeLinecap,
                strokeOpacity: type.strokeOpacity,
                condition: JSON.parse(type.condition),
                logo: resolvedChildLogo,
                label: type.label,
                fontSize: type.fontSize,
                fontWeight: type.fontWeight,
                fontColor: type.fontColor,
                fontFamily: type.fontFamily,
                labelXOffset: type.labelXOffset,
                labelYOffset: type.labelYOffset,
                labelMinZoom: type.labelMinZoom,
            };
        })
    );
};

const mapStyleItem = async (style: FeatureTypeStyleItemData) => {
    const resolvedLogo = await resolveLogoUri(appendLogoSize(style?.uri));
    const directionField = style.directionField ? JSON.parse(style.directionField) : undefined;
    const children = await mapStyleChildren(style);

    return {
        name: style.name,
        label: style.label,
        types: [
            {
                title: "Par défaut",
                type: style.graphicName,
                featureType: style.type as GeoserviceFeatureTypeProp | undefined,
                pointRadius: style.pointRadius,
                fillColor: style.fillColor,
                fillOpacity: style.fillOpacity,
                strokeColor: style.strokeColor,
                strokeWidth: style.strokeWidth,
                strokeDashstyle: style.strokeDashstyle,
                strokeLinecap: style.strokeLinecap,
                strokeOpacity: style.strokeOpacity,
                logo: resolvedLogo,
                label: style.label,
                fontSize: style.fontSize,
                fontWeight: style.fontWeight,
                fontColor: style.fontColor,
                fontFamily: style.fontFamily,
                labelXOffset: style.labelXOffset,
                labelYOffset: style.labelYOffset,
                labelMinZoom: style.labelMinZoom,
                directionField: directionField,
            },
            ...children,
        ],
    };
};

const mapStyles = async (styles: FeatureTypeStyleItemData[], geomType: GeoserviceFeatureTypeProp) => {
    if (!styles.length) {
        return [featureDefaultStyle(geomType)];
    }

    return Promise.all(styles.map((style) => mapStyleItem(style)));
};

const buildWfsBaseUrl = (geoservice: CommunityGeoservice, maxNumber: number, geoProjCode: string, urlsFilters: string) =>
    `${geoservice.url}` +
    `${geoservice.url.includes("?") ? "" : "?"}SERVICE=WFS` +
    (geoservice.version ? `&VERSION=${geoservice.version || "1.1.0"}` : "") +
    `&REQUEST=GetFeature` +
    `&typename=${geoservice.layer}` +
    `&outputFormat=${"application/json"}` +
    `&SRSNAME=${geoProjCode}` +
    `&offset=${0}` +
    `&maxFeatures=${maxNumber}` +
    urlsFilters;

const buildWfsQueryKey = (geoservice: CommunityGeoservice) => `SEARCH_WFS_GET_FEATURES_${geoservice.url}_${geoservice.version}_${geoservice.layer}`;

export async function getFeatureTypeById(featureTypesId: FeatureTypeIds) {
    const api = await getAxiosApi();
    return api.get(`${DATABASE_API_URL}/${featureTypesId.database}/tables/${featureTypesId.table}`);
}
export async function getFeatureTypesAll(featureTypesIds: FeatureTypeIds[]): Promise<CommunityGeoservice[]> {
    const resAll = await Promise.all(featureTypesIds.map((featureTypesId) => getFeatureTypeById(featureTypesId)));

    if (resAll) {
        const resolved = await Promise.all(
            resAll.map(async (res) => {
                const geometryColumn = res.data.columns?.find((c: FeatureTypeColumn) => c.name === res.data.geometry_name);
                const geomType = inferGeometryType(geometryColumn as FeatureTypeColumn);
                const styles = ensureStylesList(res.data);

                const data: CommunityGeoservice = {
                    idName: res.data.id_name,
                    id: res.data.id,
                    description: res.data.description,
                    title: res.data.title,
                    type: "WFS",
                    version: res.data.version || 0,
                    url: res.data.wfs,
                    layer: res.data.name,
                    format: "JSON",
                    extent: res.data.map_extent || "",
                    minZoom: res.data.min_zoom_level,
                    maxZoom: res.data.max_zoom_level,
                    tileZoom: res.data.tile_zoom_level,
                    boxSrid: res.data.box_srid || "",
                    geometryName: res.data.geometry_name,
                    featureType: geomType,
                    readOnly: res.data.read_only,
                    table: res.data.id,
                    database: res.data.database_id,
                    columns: mapColumns(res.data.columns),
                };

                data.styles = await mapStyles(styles, geomType);

                return data;
            })
        );

        return resolved;
    }
    return [];
}
export const searchFilteredObjects = async (
    queryClient: QueryClient,
    geoservice: CommunityGeoservice,
    maxNumber: number,
    extent: Extent,
    mapProjCode: string,
    geoProjCode: string,
    urlsFilters: string
) => {
    let wfsUrl = buildWfsBaseUrl(geoservice, maxNumber, geoProjCode, urlsFilters);
    let queryKey = buildWfsQueryKey(geoservice);

    if (isFinite(extent[0])) {
        const transformedExtent = transformExtent(extent, mapProjCode, geoProjCode);
        wfsUrl += `&bbox=${transformedExtent.join(",")},${geoProjCode}`;
        queryKey += `_${transformedExtent.join(",")}`;
    }
    const data = await queryClient.fetchQuery({
        queryKey: [queryKey],
        queryFn: async () => {
            const api = await getAxiosApi();
            const { data } = await api.get(wfsUrl);
            return data;
        },
        retry: 1,
    });

    if (!Array.isArray(data)) throw Error(data.message);

    return data;
};

export const getWMSFeatureInfo = async (
    geoservice: CommunityGeoservice,
    coordinate: [number, number],
    viewResolution: number,
    mapProjCode: string,
    viewSize: [number, number]
): Promise<string> => {
    const url =
        `${geoservice.url}` +
        `${geoservice.url.includes("?") ? "&" : "?"}SERVICE=WMS` +
        `&VERSION=${geoservice.version || "1.3.0"}` +
        `&REQUEST=GetFeatureInfo` +
        `&FORMAT=image/png` +
        `&TRANSPARENT=TRUE` +
        `&QUERY_LAYERS=${geoservice.layer}` +
        `&LAYERS=${geoservice.layer}` +
        `&INFO_FORMAT=text/html` +
        `&CRS=${mapProjCode}` +
        `&STYLES=` +
        `&WIDTH=${viewSize[0]}` +
        `&HEIGHT=${viewSize[1]}`;

    const halfWidth = (viewResolution * viewSize[0]) / 2;
    const halfHeight = (viewResolution * viewSize[1]) / 2;
    const bbox = [coordinate[0] - halfWidth, coordinate[1] - halfHeight, coordinate[0] + halfWidth, coordinate[1] + halfHeight];

    const version = String(geoservice.version || "1.3.0");
    const bboxParam = version === "1.3.0" ? `&BBOX=${bbox.join(",")}` : `&BBOX=${bbox.join(",")}`;
    const pixelParam =
        version === "1.3.0"
            ? `&I=${Math.floor(viewSize[0] / 2)}&J=${Math.floor(viewSize[1] / 2)}`
            : `&X=${Math.floor(viewSize[0] / 2)}&Y=${Math.floor(viewSize[1] / 2)}`;

    const featureInfoUrl = url + bboxParam + pixelParam;

    const api = await getAxiosApi();
    const response = await api.get(featureInfoUrl);
    return response.data;
};

export const getWMTSFeatureInfo = async (
    geoservice: CommunityGeoservice,
    tileCoord: [number, number, number],
    pixelCoord: [number, number],
    tileMatrixSet: string
): Promise<string> => {
    const url =
        `${geoservice.url}` +
        `${geoservice.url.includes("?") ? "&" : "?"}SERVICE=WMTS` +
        `&VERSION=1.0.0` +
        `&REQUEST=GetFeatureInfo` +
        `&LAYER=${geoservice.layer}` +
        `&TILECOL=${tileCoord[1]}` +
        `&TILEROW=${tileCoord[2]}` +
        `&TILEMATRIX=${tileCoord[0]}` +
        `&TILEMATRIXSET=${tileMatrixSet}` +
        `&FORMAT=${geoservice.format || "image/jpeg"}` +
        `&STYLE=normal` +
        `&INFOFORMAT=text/html` +
        `&I=${Math.floor(pixelCoord[0])}` +
        `&J=${Math.floor(pixelCoord[1])}`;

    const api = await getAxiosApi();
    const { data } = await api.get(url, { responseType: "text" });

    return data;
};
