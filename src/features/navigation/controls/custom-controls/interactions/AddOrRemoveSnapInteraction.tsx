import { InteractionType } from "@/constants/communities/types";
import { InteractionsProps } from "@/constants/contributions/types";
import { useCommunityStore, useMapStore } from "@/store";
import { useCallback, useEffect, useMemo, useRef } from "react";
import useKeyEvent from "@/hooks/useKeyEvent";

const isEditInteraction = (interaction: InteractionType | null | undefined): boolean => {
    return interaction === InteractionType.ADD_OBJECT || interaction === InteractionType.MODIFY || interaction === InteractionType.TRANSLATE_OBJECT;
};

const SnapInteractionEffect = (props: InteractionsProps) => {
    const { map, clickedControl, mapWorkingLayer } = useMapStore();
    const { communityLayers } = useCommunityStore();

    const currentCommunityLayer = useMemo(
        () => communityLayers?.find((layer) => layer?.geoservice?.layer === mapWorkingLayer),
        [communityLayers, mapWorkingLayer]
    );

    const needToSnap = Boolean(currentCommunityLayer?.snapto && isEditInteraction(clickedControl?.interaction));
    const needToSnapRef = useRef(needToSnap);

    useEffect(() => {
        needToSnapRef.current = needToSnap;
    }, [needToSnap]);

    useEffect(() => {
        if (!map) return;
        const interactions = map.getInteractions().getArray();
        const hasSnap = interactions.includes(props.snapInteraction);

        if (needToSnap && !hasSnap) {
            map.addInteraction(props.snapInteraction);
        }
        if (!needToSnap && hasSnap) {
            map.removeInteraction(props.snapInteraction);
        }

        return () => {
            if (map.getInteractions().getArray().includes(props.snapInteraction)) {
                map.removeInteraction(props.snapInteraction);
            }
        };
    }, [map, props.snapInteraction, needToSnap]);

    useKeyEvent(
        "keydown",
        useCallback(
            (e: KeyboardEvent) => {
                if (e.key !== "Shift" || !map) return;
                if (map.getInteractions().getArray().includes(props.snapInteraction)) {
                    map.removeInteraction(props.snapInteraction);
                }
            },
            [map, props.snapInteraction]
        )
    );

    useKeyEvent(
        "keyup",
        useCallback(
            (e: KeyboardEvent) => {
                if (e.key !== "Shift" || !map) return;
                if (needToSnapRef.current && !map.getInteractions().getArray().includes(props.snapInteraction)) {
                    map.addInteraction(props.snapInteraction);
                }
            },
            [map, props.snapInteraction]
        )
    );

    return null;
};

export default SnapInteractionEffect;
