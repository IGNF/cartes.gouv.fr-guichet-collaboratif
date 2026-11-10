import { getAxiosApi } from ".";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { CommunityGrids, GridData } from "@/constants/communities/types";
import { GRIDS_API_URL } from "@/constants/urls";

async function getGridDetails(gridName: string): Promise<GridData> {
    const api = await getAxiosApi();
    const res = await api.get<GridData>(`${GRIDS_API_URL}/${encodeURIComponent(gridName)}`, {
        params: {
            fields: ["name", "title", "type", "extent", "geometry"].join(","),
        },
    });
    return res.data;
}

export const useGetCommunityGridsAPI = (communityId: string, communityGrids?: CommunityGrids[], allowedGridNames?: string[]) => {
    const queryClient = useQueryClient();
    const gridNames = useMemo(
        () => [...new Set([...(communityGrids?.map((grid) => grid.name) ?? []), ...(allowedGridNames ?? [])])].sort(),
        [allowedGridNames, communityGrids]
    );
    const enabled = communityGrids !== undefined && allowedGridNames !== undefined;

    return useQuery({
        queryKey: ["COMMUNITY_GRIDS_DATA", communityId, ...gridNames],
        queryFn: () =>
            Promise.all(
                gridNames.map((gridName) =>
                    queryClient.query({
                        queryKey: ["GRID_DETAILS_DATA", gridName],
                        queryFn: () => getGridDetails(gridName),
                        staleTime: Infinity,
                    })
                )
            ),
        enabled,
        retry: 1,
        staleTime: Infinity,
    });
};
