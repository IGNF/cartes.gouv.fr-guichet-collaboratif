import { InteractionsFuncsProps, InteractionsProps } from "@/constants/contributions/types";
import { addInteractionToMap, removeInteractionFromMap } from "@/constants/contributions/utils";
import { useCommunityStore, useContributionStore, useMapStore } from "@/store";

import { useEffect, useMemo } from "react";

const AddOrRemoveMapControlInteraction = (props: InteractionsFuncsProps & InteractionsProps) => {
    const { map, clickedControl, mapWorkingLayer, clickedMapFeature } = useMapStore();
    const { communityLayers } = useCommunityStore();
    const { isModifying } = useContributionStore();

    const currentCommunityLayer = useMemo(() => communityLayers?.find((l) => l.geoservice.layer === mapWorkingLayer), [communityLayers, mapWorkingLayer]);

    useEffect(() => {
        if (!isModifying && clickedControl && clickedControl.interaction) {
            removeInteractionFromMap(clickedControl.interaction, map!);
            const clickedInteraction = props.getInteractionByType(
                clickedControl.interaction,
                currentCommunityLayer?.geoservice.featureType ?? clickedControl.target
            );
            addInteractionToMap(clickedInteraction, map!);
        }
        return () => {
            if (!isModifying && clickedControl && clickedControl.interaction) {
                map?.un("singleclick", props.splitLineInteractionFuncEnd);
                map?.un("pointermove", props.splitLineInteractionFuncPointer);
            }
        };
    }, [clickedControl, map, mapWorkingLayer, currentCommunityLayer?.geoservice.featureType, isModifying, clickedMapFeature, props]);
    return null;
};

export default AddOrRemoveMapControlInteraction;
