import { CommunityGeoservice, FeatureTypeColumn, FeatureTypeIds, FeatureTypeStyleItemData, GeoserviceFeatureTypeProp } from "@/constants/communities/types";
import { API_URL, DATABASE_API_URL } from "@/constants/urls";
import { axiosApi } from ".";
import { featureDefaultStyle } from "@/constants/styles";
import { transformExtent } from "ol/proj";
import { QueryClient } from "@tanstack/react-query";
import { Extent } from "ol/extent";
import { FEATURE_TYPE_HOVER_COLUMN } from "@/constants";

export function getFeatureTypeById(featureTypesId: FeatureTypeIds) {
    return axiosApi.get(`${DATABASE_API_URL}/${featureTypesId.database}/tables/${featureTypesId.table}`);
}

export async function getFeatureTypesAll(featureTypesIds: FeatureTypeIds[]): Promise<CommunityGeoservice[]> {
    const resAll = await Promise.all(featureTypesIds.map((featureTypesId) => getFeatureTypeById(featureTypesId)));

    if (resAll) {
        return resAll.map((res) => {
            const styles = res.data.styles || [];
            if (res.data.style && !styles.some((s: FeatureTypeStyleItemData) => s.name === res.data.style.name)) {
                styles.unshift(res.data.style);
            }

            const geometryColumn = res.data.columns?.find((c: FeatureTypeColumn) => c.name === res.data.geometry_name);
            let geomType: GeoserviceFeatureTypeProp = GeoserviceFeatureTypeProp.POINT;

            if (geometryColumn.type.includes("Polygon")) {
                geomType = GeoserviceFeatureTypeProp.POLYGON;
            } else if (geometryColumn.type.includes("Line")) {
                geomType = GeoserviceFeatureTypeProp.LINE;
            }

            const hasHoverColumn = res.data.columns?.some((col: FeatureTypeColumn) => col.name === FEATURE_TYPE_HOVER_COLUMN);

            const data: CommunityGeoservice = {
                idName: res.data.id_name,
                id: res.data.id,
                description: res.data.description,
                title: res.data.title,
                type: "WFS",
                version: res.data.version || 0,
                url: res.data.wfs.replace("https://espacecollaboratif.ign.fr/gcms/api", `${API_URL}/espaceco`),
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
                hover: hasHoverColumn,
                table: res.data.id,
                database: res.data.database_id,
                columns: res.data.columns.map((col: FeatureTypeColumn) => {
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
                        max_length: col.min_length,
                        pattern: col.pattern,
                        min_value: col.min_value,
                        max_value: col.max_value,
                        is3d: col.is3d,
                        queryable: col.queryable,
                    };
                }),
            };

            if (styles.length) {
                data.styles = styles.map((style: FeatureTypeStyleItemData) => {
                    let logoURI = style?.uri ? style.uri?.replace("https://espacecollaboratif.ign.fr/gcms", `${API_URL}/espaceco`) : "";
                    if (logoURI) {
                        logoURI = logoURI + `${logoURI?.includes("?") ? "&" : "?"}width=50&height=50`;
                    }
                    const directionField = style.directionField ? JSON.parse(style.directionField) : undefined;
                    return {
                        name: style.name,
                        label: style.label,
                        types: [
                            {
                                title: "Par défaut",
                                type: style.graphicName,
                                featureType: style.type,
                                pointRadius: style.pointRadius,
                                fillColor: style.fillColor,
                                fillOpacity: style.fillOpacity,
                                strokeColor: style.strokeColor,
                                strokeWidth: style.strokeWidth,
                                strokeDashstyle: style.strokeDashstyle,
                                strokeLinecap: style.strokeLinecap,
                                strokeOpacity: style.strokeOpacity,
                                logo: logoURI,
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
                            ...(style?.children?.map((type: FeatureTypeStyleItemData) => {
                                let logoURItype = type?.uri ? type.uri?.replace("https://espacecollaboratif.ign.fr/gcms", `${API_URL}/espaceco`) : "";
                                if (logoURItype) {
                                    logoURItype = logoURItype + `${logoURItype?.includes("?") ? "&" : "?"}width=50&height=50`;
                                }
                                return {
                                    title: type.name,
                                    type: type.graphicName,
                                    featureType: style.type,
                                    pointRadius: type.pointRadius,
                                    fillColor: type.fillColor,
                                    fillOpacity: type.fillOpacity,
                                    strokeColor: type.strokeColor,
                                    strokeWidth: type.strokeWidth,
                                    strokeDashstyle: type.strokeDashstyle,
                                    strokeOpacity: type.strokeOpacity,
                                    condition: JSON.parse(type.condition),
                                    logo: logoURItype,
                                    label: type.label,
                                    fontSize: type.fontSize,
                                    fontWeight: type.fontWeight,
                                    fontColor: type.fontColor,
                                    fontFamily: type.fontFamily,
                                    labelXOffset: type.labelXOffset,
                                    labelYOffset: type.labelYOffset,
                                    labelMinZoom: type.labelMinZoom,
                                };
                            }) || []),
                        ],
                    };
                });
            } else {
                data.styles = [featureDefaultStyle(geomType)];
            }

            return data;
        });
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
    let wfsUrl =
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

    let queryKey = `SEARCH_WFS_GET_FEATURES_${geoservice.url}_${geoservice.version}_${geoservice.layer}`;

    if (isFinite(extent[0])) {
        const transformedExtent = transformExtent(extent, mapProjCode, geoProjCode);
        wfsUrl += `&bbox=${transformedExtent.join(",")},${geoProjCode}`;
        queryKey += `_${transformedExtent.join(",")}`;
    }
    const data = await queryClient.fetchQuery({
        queryKey: [queryKey],
        queryFn: async () => {
            return await fetch(wfsUrl, { headers: { "X-Requested-With": "XMLHttpRequest" } })
                .then((response) => response.json())

                .catch(() => {
                    throw Error;
                });
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

    const response = await fetch(featureInfoUrl, { headers: { "X-Requested-With": "XMLHttpRequest" } });
    return await response.text();
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

    const response = await fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } });
    return await response.text();
};
