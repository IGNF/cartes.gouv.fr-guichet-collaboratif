import { CommunityGeoservice, FeatureTypeColumn, FeatureTypeIds, FeatureTypeStyleItemData } from "@/constants/communities/types";
import { API_URL, DATABASE_API_URL } from "@/constants/urls";
import { axiosApi } from ".";
import { featureDefaultStyle } from "@/constants/styles";

export function getFeatureTypeById(featureTypesId: FeatureTypeIds) {
    return axiosApi.get(`${DATABASE_API_URL}/${featureTypesId.database}/tables/${featureTypesId.table}`);
}

export async function getFeatureTypesAll(featureTypesIds: FeatureTypeIds[]): Promise<CommunityGeoservice[]> {
    const resAll = await Promise.all(featureTypesIds.map((featureTypesId) => getFeatureTypeById(featureTypesId)));

    if (resAll) {
        return resAll.map((res) => {
            const styles = res.data.styles || [];
            if (res.data.style) styles.unshift(res.data.style);
            const geometryColumn = res.data.columns?.find((c: FeatureTypeColumn) => c.name === res.data.geometry_name);
            let geomType = geometryColumn.type as string;

            if (geomType.includes("Polygon")) {
                geomType = "polygon";
            } else if (geomType.includes("Line")) {
                geomType = "line";
            } else {
                geomType = "point";
            }
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
                        is3d: col.is3d,
                    };
                }),
            };

            if (styles.length) {
                data.styles = styles.map((style: FeatureTypeStyleItemData) => {
                    let logoURI = style?.uri ? style.uri?.replace("https://espacecollaboratif.ign.fr/gcms", `${API_URL}/espaceco`) : "";
                    if (logoURI) {
                        logoURI = logoURI + `${logoURI?.includes("?") ? "&" : "?"}width=50&height=50`;
                    }
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
