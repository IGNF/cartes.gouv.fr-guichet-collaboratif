import { useCommunityStore } from "@/store";
import { useMemo } from "react";

const useExtentList = () => {
    const { community } = useCommunityStore();

    const grids = useMemo(() => community?.grids, [community]);

    const extentList = [
        { value: "map_extent", title: "Dans l'emprise de la carte" },
        { value: "table_extent", title: "Dans toute la table" },
        ...(grids?.map((grid) => {
            return { value: grid.extent?.join(",") ?? "", title: `${grid.type.title} ${grid.title}` };
        }) ?? []),
    ];
    return extentList;
};

export default useExtentList;
