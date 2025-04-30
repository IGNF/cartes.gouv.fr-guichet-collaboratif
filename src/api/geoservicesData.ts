import { GEOSERVICES_API_URL } from "@/constants/urls";
import { CommunityGeoservice } from "@/store/useCommunityStore";
import axios from "axios";

export function getGeoserviceById(geoserviceId: number) {
    return axios.get(`${GEOSERVICES_API_URL}/get/${geoserviceId}`, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
    });
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
                boxSrid: res.data.box_srid,
            };
        });
    }
    return [];
}
