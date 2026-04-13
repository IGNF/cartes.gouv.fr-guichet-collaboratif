import { InteractionType } from "@/constants/communities/types";
import { InteractionsFuncsProps, InteractionsProps } from "@/constants/contributions/types";
import { addInteractionToMap, removeInteractionFromMap } from "@/constants/contributions/utils";
import { useContributionStore, useMapStore } from "@/store";
import { useRasterWorkingLayer } from "@/hooks/working-layer/useRasterWorkingLayer";

import { useEffect, useRef } from "react";

const AddOrRemoveMapControlInteraction = (props: InteractionsFuncsProps & InteractionsProps) => {
    const { map, clickedControl } = useMapStore();
    const { isModifying } = useContributionStore();
    const { isRasterLayer } = useRasterWorkingLayer();
    const isModifyingRef = useRef(isModifying);

    isModifyingRef.current = isModifying;

    useEffect(() => {
        if (!isModifying && clickedControl && clickedControl.interaction) {
            removeInteractionFromMap(clickedControl.interaction, map!);
            const clickedInteraction = props.getInteractionByType(clickedControl.interaction, clickedControl.target);
            addInteractionToMap(clickedInteraction, map!);
            if (clickedControl.interaction === InteractionType.SELECT && !isRasterLayer) {
                map?.addInteraction(props.dragInteraction);
                props.dragInteraction.on(["boxend"], () => props.dragInteractionFunc());
                props.dragInteraction.setActive(true);
            }
        }
        return () => {
            if (!isModifying && clickedControl && clickedControl.interaction) {
                if (!isModifyingRef.current) {
                    removeInteractionFromMap(clickedControl.interaction, map!);
                }
                map?.un("singleclick", props.splitLineInteractionFuncEnd);
                map?.un("pointermove", props.splitLineInteractionFuncPointer);
                map?.removeInteraction(props.dragInteraction);
                props.dragInteraction.un(["boxend"], () => props.dragInteractionFunc());
                props.dragInteraction.setActive(false);
            }
        };
    }, [clickedControl, map, isModifying, isRasterLayer, props]);
    return null;
};

export default AddOrRemoveMapControlInteraction;
