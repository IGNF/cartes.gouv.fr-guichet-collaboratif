import axios from "axios";
import { Community, useCommunityStore } from "@/store/useCommunityStore";
import { COMMUNITIES_API_URL, LIST_COMMUNITIES_URL } from "@/constants/urls";
import { useQuery } from "@tanstack/react-query";

async function getCommunityById(communityId: string): Promise<Community | null> {
    const res = await axios.get(`${COMMUNITIES_API_URL}/${communityId}`, {
        headers: { "X-Requested-With": "XMLHttpRequest" },
    });

    if (res.status === 401) {
        window.location.href = LIST_COMMUNITIES_URL;
        return null;
    }
    if (res.status !== 200) return null;

    const community = res.data;
    return {
        id: community.id,
        listed: community.listed,
        description: community.description,
        name: community.name,
        about: community.about,
        functionalities: community.functionalities,
        logoUrl: community.logo_url,
    };
}

export const useGetCommunityById = (communityId: string) => {
    const { community } = useCommunityStore();
    return useQuery({
        queryKey: ["community_infos_" + communityId],
        queryFn: () => getCommunityById(communityId),
        enabled: !community,
    });
};
