import { CommunityGeoservice, FeatureTypeIds } from "@/constants/communities/types";
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
            };
        });
    }
    return [];
}
