import { CommunityGeoservice, FeatureTypeIds, FeatureTypeStyleItemData } from "@/constants/communities/types";
import { DATABASE_API_URL } from "@/constants/urls";
import { axiosApi } from ".";
import ParkingVeloImg from "../img/parking_velo.png";

export function getFeatureTypeById(featureTypesId: FeatureTypeIds) {
    return axiosApi.get(`${DATABASE_API_URL}/${featureTypesId.database}/tables/${featureTypesId.table}`);
}

export async function getFeatureTypesAll(featureTypesIds: FeatureTypeIds[]): Promise<CommunityGeoservice[]> {
    const resAll = await Promise.all(featureTypesIds.map((featureTypesId) => getFeatureTypeById(featureTypesId)));

    if (resAll) {
        return resAll.map((res) => {
            const styles = [res.data.style, ...res.data.styles];
            return {
                id: res.data.id,
                description: res.data.description,
                title: res.data.title,
                type: "WFS",
                version: res.data.version || 0,
                url: res.data.wfs.replace("https://espacecollaboratif.ign.fr/gcms/api", "http://localhost/cartes.gouv.fr/api/espaceco"),
                layer: res.data.name,
                format: "JSON",
                extent: res.data.map_extent || "",
                minZoom: res.data.min_zoom_level,
                maxZoom: res.data.max_zoom_level,
                boxSrid: res.data.box_srid || "",
                logo: ParkingVeloImg,
                styles: styles.map((style) => {
                    return {
                        name: style.name,
                        types: [
                            {
                                title: "Par défaut",
                                type: style.graphicName,
                                pointRadius: style.pointRadius,
                                fillColor: style.fillColor,
                                fillOpacity: style.fillOpacity,
                                strokeColor: style.strokeColor,
                                strokeWidth: style.strokeWidth,
                                strokeOpacity: style.strokeOpacity,
                            },
                            ...style.children.map((type: FeatureTypeStyleItemData) => {
                                return {
                                    title: type.name,
                                    type: type.graphicName,
                                    pointRadius: type.pointRadius,
                                    fillColor: type.fillColor,
                                    fillOpacity: type.fillOpacity,
                                    strokeColor: type.strokeColor,
                                    strokeWidth: type.strokeWidth,
                                    strokeOpacity: type.strokeOpacity,
                                    condition: JSON.parse(type.condition),
                                };
                            }),
                        ],
                    };
                }),
            };
        });
    }
    return [];
}
