import { InteractionType } from "@/constants/communities/types";
import { InteractionsProps } from "@/constants/contributions/types";
import { useCommunityStore, useMapStore } from "@/store";
import { useCallback, useEffect, useMemo, useRef } from "react";
import useKeyEvent from "@/hooks/useKeyEvent";
import type { Collection } from "ol";
import type { Interaction } from "ol/interaction";

const isEditInteraction = (interaction: InteractionType | null | undefined): boolean => {
    return interaction === InteractionType.ADD_OBJECT || interaction === InteractionType.MODIFY || interaction === InteractionType.TRANSLATE_OBJECT;
};

/**
 *  Ol uses last handle first for interactions:
 *  - Snap is always last
 *  - Enable/disable is done via setActive()
 *    so we never reorder the collection just to toggle snapping on/off.
 */
const SnapInteractionEffect = (props: InteractionsProps) => {
    const { snapInteraction } = props;
    const { map, clickedControl, mapWorkingLayer } = useMapStore();
    const { communityLayers } = useCommunityStore();

    const currentCommunityLayer = useMemo(
        () => communityLayers?.find((layer) => layer?.geoservice?.layer === mapWorkingLayer),
        [communityLayers, mapWorkingLayer]
    );

    const needToSnap = Boolean(currentCommunityLayer?.snapto && isEditInteraction(clickedControl?.interaction));

    const needToSnapRef = useRef(needToSnap);
    const isShiftPressedRef = useRef(false);

    const applyActive = useCallback(() => {
        snapInteraction.setActive(needToSnapRef.current && !isShiftPressedRef.current);
    }, [snapInteraction]);

    useEffect(() => {
        needToSnapRef.current = needToSnap;
        applyActive();
    }, [needToSnap, applyActive]);

    useEffect(() => {
        if (!map) return;

        const interactions = map.getInteractions() as Collection<Interaction>;

        const moveSnapToTail = () => {
            const array = interactions.getArray();
            if (array[array.length - 1] === snapInteraction) return;
            interactions.remove(snapInteraction);
            interactions.push(snapInteraction);
        };

        let reordering = false;
        const onAdd = (event: { element?: Interaction }) => {
            if (reordering || event.element === snapInteraction) return;
            reordering = true;
            moveSnapToTail();
            reordering = false;
        };

        if (!interactions.getArray().includes(snapInteraction)) {
            interactions.push(snapInteraction);
        } else {
            moveSnapToTail();
        }
        applyActive();

        interactions.on("add", onAdd as never);

        return () => {
            interactions.un("add", onAdd as never);
            if (interactions.getArray().includes(snapInteraction)) {
                interactions.remove(snapInteraction);
            }
        };
    }, [map, snapInteraction, applyActive]);

    // Hold Shift to temporarily suspend snapping
    useKeyEvent(
        "keydown",
        useCallback(
            (e: KeyboardEvent) => {
                if (e.key !== "Shift" || isShiftPressedRef.current) return;
                isShiftPressedRef.current = true;
                applyActive();
            },
            [applyActive]
        )
    );

    useKeyEvent(
        "keyup",
        useCallback(
            (e: KeyboardEvent) => {
                if (e.key !== "Shift") return;
                isShiftPressedRef.current = false;
                applyActive();
            },
            [applyActive]
        )
    );

    return null;
};

export default SnapInteractionEffect;
