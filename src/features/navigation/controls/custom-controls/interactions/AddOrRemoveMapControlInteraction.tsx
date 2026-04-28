import { InteractionType } from "@/constants/communities/types";
import { InteractionsFuncsProps, InteractionsProps } from "@/constants/contributions/types";
import { addInteractionToMap, removeInteractionFromMap } from "@/constants/contributions/utils";
import { useContributionStore, useMapStore } from "@/store";
import { useRasterWorkingLayer } from "@/hooks/working-layer/useRasterWorkingLayer";

import { useEffect } from "react";

const AddOrRemoveMapControlInteraction = (props: InteractionsFuncsProps & InteractionsProps) => {
    const { map, clickedControl } = useMapStore();
    const { isModifying } = useContributionStore();
    const { isRasterLayer } = useRasterWorkingLayer();

    useEffect(() => {
        const shouldManageInteraction = !isModifying && clickedControl?.interaction;
        let didAddInteractions = false;
        let handleBoxEnd: (() => void) | undefined;

        if (shouldManageInteraction) {
            removeInteractionFromMap(clickedControl.interaction, map!);
            const clickedInteraction = props.getInteractionByType(clickedControl.interaction, clickedControl.target);
            addInteractionToMap(clickedInteraction, map!);

            didAddInteractions = true;

            if (clickedControl.interaction === InteractionType.SELECT && !isRasterLayer) {
                handleBoxEnd = () => props.dragInteractionFunc();
                map?.addInteraction(props.dragInteraction);
                props.dragInteraction.on(["boxend"], handleBoxEnd);
                props.dragInteraction.setActive(true);

                return () => {
                    if (didAddInteractions) {
                        removeInteractionFromMap(clickedControl.interaction, map!);
                        if (handleBoxEnd) {
                            props.dragInteraction.un(["boxend"], handleBoxEnd);
                        }
                        map?.removeInteraction(props.dragInteraction);
                        props.dragInteraction.setActive(false);
                    }
                };
            }
        }

        return () => {
            if (didAddInteractions && clickedControl?.interaction) {
                removeInteractionFromMap(clickedControl.interaction, map!);
                map?.un("singleclick", props.splitLineInteractionFuncEnd);
                map?.un("pointermove", props.splitLineInteractionFuncPointer);
                map?.removeInteraction(props.dragInteraction);
                if (handleBoxEnd) {
                    props.dragInteraction.un(["boxend"], handleBoxEnd);
                }
                props.dragInteraction.setActive(false);
            }
        };
    }, [clickedControl, map, isModifying, isRasterLayer, props]);
    return null;
};

export default AddOrRemoveMapControlInteraction;
