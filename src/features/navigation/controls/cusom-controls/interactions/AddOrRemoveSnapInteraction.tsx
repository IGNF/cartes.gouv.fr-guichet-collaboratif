import { InteractionsProps } from "@/constants/contributions/types";
import { useCommunityStore, useMapStore } from "@/store";
import { useEffect, useMemo } from "react";

const SnapInteractionEffect = (props: InteractionsProps) => {
    const { map, clickedControl, mapWorkingLayer } = useMapStore();
    const { communityLayers } = useCommunityStore();

    const currentCommunityLayer = useMemo(
        () => communityLayers?.find((layer) => layer.geoservice.layer === mapWorkingLayer),
        [communityLayers, mapWorkingLayer]
    );

    useEffect(() => {
        if (clickedControl && currentCommunityLayer?.snapto) {
            map?.addInteraction(props.snapInteraction);
        }
        return () => {
            if (clickedControl && currentCommunityLayer?.snapto) {
                map?.removeInteraction(props.snapInteraction);
            }
        };
    }, [map, clickedControl, props, currentCommunityLayer?.snapto]);

    return null;
};

export default SnapInteractionEffect;
