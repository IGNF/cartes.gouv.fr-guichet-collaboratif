import { addInteractionToMap, removeInteractionFromMap } from "@/constants/contributions/utils";
import useGetInteractions from "@/hooks/navigation/controls/useGetInteractions";
import useGetInteractionsFuncs from "@/hooks/navigation/controls/useGetInteractionsFuncs";
import { useCommunityStore, useContributionStore, useMapStore } from "@/store";
import { useEffect, useMemo } from "react";

const AddOrRemoveMapControlInteraction = () => {
    const { map, clickedControl, mapWorkingLayer, clickedMapFeature } = useMapStore();
    const { communityLayers } = useCommunityStore();
    const { isModifying } = useContributionStore();

    const currentCommunityLayer = useMemo(() => communityLayers?.find((l) => l.geoservice.layer === mapWorkingLayer), [communityLayers, mapWorkingLayer]);

    const { selectInteraction } = useGetInteractions();
    const { selectInteractionFunc, removeInteractionFunc, splitLineInteractionFuncEnd, splitLineInteractionFuncPointer, getInteractionByType } =
        useGetInteractionsFuncs();

    const clickedInteraction = useMemo(() => {
        if (clickedControl) {
            return getInteractionByType(clickedControl.interaction, currentCommunityLayer?.geoservice.featureType ?? clickedControl.target);
        }
        return null;
    }, [clickedControl, currentCommunityLayer?.geoservice.featureType, getInteractionByType]);

    useEffect(() => {
        if (!isModifying && clickedInteraction && clickedControl) {
            removeInteractionFromMap(clickedControl.interaction, map!);
            addInteractionToMap(clickedInteraction, map!);
        }
    }, [
        clickedControl,
        map,
        mapWorkingLayer,
        currentCommunityLayer?.geoservice.featureType,
        isModifying,
        selectInteraction,
        clickedMapFeature,
        clickedInteraction,
        getInteractionByType,
        removeInteractionFunc,
        selectInteractionFunc,
        splitLineInteractionFuncEnd,
        splitLineInteractionFuncPointer,
    ]);
    return null;
};

export default AddOrRemoveMapControlInteraction;
