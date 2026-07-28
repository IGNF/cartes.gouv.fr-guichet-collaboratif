import { InteractionType } from "@/constants/communities/types";
import { InteractionsProps } from "@/constants/contributions/types";
import { useCommunityStore, useMapStore } from "@/store";
import { useCallback, useEffect, useMemo, useRef } from "react";
import useKeyEvent from "@/hooks/useKeyEvent";
import BaseObject from "ol/Object";

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
    const isShiftPressedRef = useRef(false);
    const lockSnapUntilEditionEndRef = useRef(false);

    useEffect(() => {
        needToSnapRef.current = needToSnap;
    }, [needToSnap]);

    const applySnapState = useCallback(() => {
        const shouldEnableSnap = needToSnapRef.current && !isShiftPressedRef.current && !lockSnapUntilEditionEndRef.current;
        props.snapInteraction.setActive(shouldEnableSnap);
    }, [props.snapInteraction]);

    useEffect(() => {
        if (!map) return;

        const hasSnap = map.getInteractions().getArray().includes(props.snapInteraction);
        if (!hasSnap) {
            map.addInteraction(props.snapInteraction);
        }

        if (!needToSnapRef.current) {
            isShiftPressedRef.current = false;
            lockSnapUntilEditionEndRef.current = false;
        }
        applySnapState();

        return () => {
            if (map.getInteractions().getArray().includes(props.snapInteraction)) {
                map.removeInteraction(props.snapInteraction);
            }
        };
    }, [map, props.snapInteraction, needToSnap, applySnapState]);

    useEffect(() => {
        const onEditionStart = () => {
            if (isShiftPressedRef.current) {
                lockSnapUntilEditionEndRef.current = true;
                applySnapState();
            }
        };
        const onEditionEnd = () => {
            lockSnapUntilEditionEndRef.current = false;
            applySnapState();
        };

        const editionInteractions: [BaseObject, string, string[]][] = [
            [props.modifyInteraction, "modifystart", ["modifyend"]],
            [props.translateInteraction, "translatestart", ["translateend"]],
            [props.drawPointInteraction, "drawstart", ["drawend", "drawabort"]],
            [props.drawLineInteraction, "drawstart", ["drawend", "drawabort"]],
            [props.drawPolygonInteraction, "drawstart", ["drawend", "drawabort"]],
        ];

        editionInteractions.forEach(([interaction, startEvent, endEvents]) => {
            interaction.on(startEvent as never, onEditionStart);
            endEvents.forEach((endEvent) => interaction.on(endEvent as never, onEditionEnd));
        });

        return () => {
            editionInteractions.forEach(([interaction, startEvent, endEvents]) => {
                interaction.un(startEvent as never, onEditionStart);
                endEvents.forEach((endEvent) => interaction.un(endEvent as never, onEditionEnd));
            });
        };
    }, [
        props.modifyInteraction,
        props.translateInteraction,
        props.drawPointInteraction,
        props.drawLineInteraction,
        props.drawPolygonInteraction,
        applySnapState,
    ]);

    useKeyEvent(
        "keydown",
        useCallback(
            (e: KeyboardEvent) => {
                if (e.key !== "Shift") return;
                isShiftPressedRef.current = true;
                applySnapState();
            },
            [applySnapState]
        )
    );

    useKeyEvent(
        "keyup",
        useCallback(
            (e: KeyboardEvent) => {
                if (e.key !== "Shift") return;
                isShiftPressedRef.current = false;
                applySnapState();
            },
            [applySnapState]
        )
    );

    return null;
};

export default SnapInteractionEffect;
