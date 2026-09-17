import { getAxiosApi } from ".";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CommunityGrids, GridData } from "@/constants/communities/types";
import { GRIDS_API_URL } from "@/constants/urls";

type GridDetails = Pick<GridData, "extent" | "geometry">;

async function getGridDetails(gridName: string): Promise<GridDetails> {
    const api = await getAxiosApi();
    const res = await api.get<GridDetails>(`${GRIDS_API_URL}/${encodeURIComponent(gridName)}`, {
        params: {
            fields: ["name", "title", "extent", "geometry"].join(","),
        },
    });
    return res.data;
}

export const useGetCommunityGridsAPI = (communityId: string, communityGrids?: CommunityGrids[], allowedGridNames?: string[]) => {
    const queryClient = useQueryClient();
    const allowedGridNamesSet = new Set(allowedGridNames);
    const filteredCommunityGrids = communityGrids?.filter((grid) => allowedGridNamesSet.has(grid.name)) ?? [];
    const gridNames = filteredCommunityGrids.map((grid) => grid.name).sort();

    return useQuery({
        queryKey: ["COMMUNITY_GRIDS_DATA", communityId, ...gridNames],
        queryFn: () =>
            Promise.all(
                filteredCommunityGrids.map(async (grid) => ({
                    ...grid,
                    ...(await queryClient.query({
                        queryKey: ["GRID_DETAILS_DATA", grid.name],
                        queryFn: () => getGridDetails(grid.name),
                        staleTime: Infinity,
                    })),
                }))
            ),
        enabled: communityGrids !== undefined && allowedGridNames !== undefined,
        retry: 1,
        staleTime: Infinity,
    });
};
