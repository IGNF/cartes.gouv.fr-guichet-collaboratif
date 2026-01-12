import { CommunityGeoservice, GeoserviceFeatureTypeProp } from "@/constants/communities/types";
import { GEOSERVICES_API_URL } from "@/constants/urls";
import { axiosApi } from ".";

export function getGeoserviceById(geoserviceId: number) {
    return axiosApi.get(`${GEOSERVICES_API_URL}/get/${geoserviceId}`);
}

export async function getGeoserviceAll(geoserviceIds: number[]): Promise<CommunityGeoservice[]> {
    const resAll = await Promise.all(geoserviceIds.map((geoId) => getGeoserviceById(geoId)));

    if (resAll) {
        return resAll.map((res) => {
            return {
                id: res.data.id,
                description: res.data.description,
                title: res.data.title,
                type: res.data.type,
                version: res.data.version,
                url: res.data.url,
                layer: res.data.layers,
                format: res.data.format,
                extent: res.data.map_extent,
                minZoom: res.data.min_zoom,
                maxZoom: res.data.max_zoom,
                tileZoom: res.data.min_zoom,
                boxSrid: res.data.box_srid,
                columns: res.data.columns || [],
                featureType: inferFeatureType(res.data),
            };
        });
    }
    return [];
}

function inferFeatureType(resData: { layers?: string; title?: string }): GeoserviceFeatureTypeProp | undefined {
    const layers = (resData.layers || "").toLowerCase();
    const title = (resData.title || "").toLowerCase();
    if (layers.includes("point")) return GeoserviceFeatureTypeProp.POINT;
    if (layers.includes("line") || title.includes("courbe")) return GeoserviceFeatureTypeProp.LINE;
    if (layers.includes("polygon") || layers.includes("poly")) return GeoserviceFeatureTypeProp.POLYGON;
    return undefined;
}
