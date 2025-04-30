import axios from "axios";
import { Community, CommunityLayer, useCommunityStore } from "@/store/useCommunityStore";
import { COMMUNITIES_API_URL, LIST_COMMUNITIES_URL } from "@/constants/urls";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUserStore";
import { getGeoserviceAll } from "./geoservicesData";

type layerData = {
    id: number;
    type: string;
    geoservice: {
        id: number;
    };
    order: number;
    opacity: number;
    visibility: boolean;
    role: string;
};
export const isDigital = (value: string): boolean => {
    const regex = /^[1-9]\d*$/;
    return regex.test(value);
};

async function getCommunityLayers(communityId: number): Promise<CommunityLayer[] | null> {
    const res = await axios.get(`${COMMUNITIES_API_URL}/${communityId}/layer/get_all`, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
    });

    if (!res.data || res.status !== 200) return null;
    const layers = res.data;
    const geoservicesIds = layers.map((layer: layerData) => layer.geoservice.id);
    const geoRes = await getGeoserviceAll(geoservicesIds);

    return layers.map((layer: layerData) => {
        return {
            id: layer.id,
            type: layer.type,
            geoservice: geoRes.find((geo) => geo.id === layer.geoservice.id),
            order: layer.order,
            opacity: layer.opacity,
            visibility: layer.visibility,
            role: layer.role,
        };
    });
}

async function getCommunityById(communityId: string): Promise<[Community, CommunityLayer[] | null] | null> {
    const res = await axios.get(`${COMMUNITIES_API_URL}/${communityId}`, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
    });

    if (res.status === 401) {
        window.location.href = LIST_COMMUNITIES_URL;
        return null;
    }
    if (!res.data || res.status !== 200) return null;

    const community = {
        id: res.data.id,
        listed: res.data.listed,
        description: res.data.description,
        name: res.data.name,
        about: res.data.about,
        functionalities: res.data.functionalities,
        logoUrl: res.data.logo_url,
    };
    const layers = await getCommunityLayers(community.id);
    return [community, layers];
}

export const useGetCommunityByIdAPI = (communityId: string) => {
    const { community } = useCommunityStore();
    const { user } = useUserStore();
    return useQuery({
        queryKey: ["COMMUNITY_DATA_" + communityId],
        queryFn: () => getCommunityById(communityId),
        retry: (failureCount, error) => {
            console.log(failureCount);
            return error instanceof TypeError;
        },
        enabled: !community && isDigital(communityId) && !!user,
    });
};
