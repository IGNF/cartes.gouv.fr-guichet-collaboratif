import { InteractionType } from "@/constants/communities/types";
import { InteractionsFuncsProps, InteractionsProps } from "@/constants/contributions/types";
import { addInteractionToMap, removeInteractionFromMap } from "@/constants/contributions/utils";
import { useContributionStore, useMapStore } from "@/store";
import { useRasterWorkingLayer } from "@/hooks/working-layer/useRasterWorkingLayer";

import { useEffect } from "react";

const AddOrRemoveMapControlInteraction = (props: InteractionsFuncsProps & InteractionsProps) => {
    const { map, clickedControl, mapWorkingLayer, clickedMapFeature } = useMapStore();
    const { isModifying } = useContributionStore();
    const { isRasterLayer } = useRasterWorkingLayer();

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
                map?.un("singleclick", props.splitLineInteractionFuncEnd);
                map?.un("pointermove", props.splitLineInteractionFuncPointer);
                map?.removeInteraction(props.dragInteraction);
                props.dragInteraction.un(["boxend"], () => props.dragInteractionFunc());
                props.dragInteraction.setActive(false);
            }
        };
    }, [clickedControl, map, mapWorkingLayer, isModifying, clickedMapFeature, isRasterLayer, props]);
    return null;
};

export default AddOrRemoveMapControlInteraction;
