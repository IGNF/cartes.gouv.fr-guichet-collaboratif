import { InteractionType } from "@/constants/communities/types";
import useGetInteractions from "@/hooks/navigation/controls/useGetInteractions";
import { useContributionStore, useMapStore } from "@/store";
import { useEffect } from "react";

const SnapInteractionEffect = () => {
    const { map, clickedControl } = useMapStore();
    const { isModifying } = useContributionStore();

    const { snapInteraction } = useGetInteractions();

    useEffect(() => {
        if (clickedControl && clickedControl.interaction === InteractionType.MODIFY) {
            map?.addInteraction(snapInteraction);
        }
        return () => {
            if (clickedControl && clickedControl.interaction === InteractionType.MODIFY) {
                map?.removeInteraction(snapInteraction);
            }
        };
    }, [map, clickedControl, snapInteraction, isModifying]);

    return null;
};

export default SnapInteractionEffect;
