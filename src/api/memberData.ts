import { useQuery } from "@tanstack/react-query";

import { COMMUNITIES_API_URL } from "@/constants/urls";
import { getAxiosApi } from ".";

interface CommunityMemberGrids {
    grids: string[];
}

async function getCommunityMemberGrids(communityId: string, userId: string): Promise<CommunityMemberGrids> {
    const api = await getAxiosApi();
    const res = await api.get<CommunityMemberGrids>(`${COMMUNITIES_API_URL}/${communityId}/members/${userId}`, {
        params: {
            fields: ["grids"],
        },
    });
    return res.data;
}

export const useGetCommunityMemberGridsAPI = (communityId: string, userId?: string) => {
    return useQuery({
        queryKey: ["COMMUNITY_MEMBER_GRIDS_DATA", communityId, userId],
        queryFn: () => getCommunityMemberGrids(communityId, userId!),
        enabled: Boolean(communityId && userId),
        retry: 1,
        staleTime: Infinity,
    });
};
