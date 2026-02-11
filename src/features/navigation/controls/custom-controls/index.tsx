import { memo, useCallback, useEffect } from "react";
import ButtonControl from "./ButtonControl";
import { useContributionStore, useMapStore, useModalStore } from "@/store";
import AllReportsControl from "./AllReportsControl";
import { useTranslation } from "@/i18n";
import useCustomControlsList from "@/hooks/navigation/controls/useCustomControlsList";
import CenterReportControl from "./CenterReportControl";
import ConfirmCopyModal from "./ConfirmCopyModal";
import AddOrRemoveSnapInteraction from "./interactions/AddOrRemoveSnapInteraction";
import useGetInteractionsFuncs from "@/hooks/navigation/controls/useGetInteractionsFuncs";
import AddOrRemoveMapControlInteraction from "./interactions/AddOrRemoveMapControlInteraction";
import useGetInteractions from "@/hooks/navigation/controls/useGetInteractions";
import { CustomControlItem, InteractionType } from "@/constants/communities/types";
import { FEATURE_TYPE_SELECTED_PROPERTY } from "@/constants";
import ConfirmMultipleDeselection from "./ConfirmMultipleDeselection";
import SearchObjectsModal from "@/features/working-layer/modal/searchObjects/SearchObjectsModal";

let prevClickedControl: CustomControlItem | null = null;

const CustomControls = () => {
    const { clickedControl, setClickedControl, setWorkingLayerDrawerOpened, setClickedMapFeature } = useMapStore();
    const { selectedObjects, setSelectedObjects } = useContributionStore();
    const { confirmMultipleDeselectionModal } = useModalStore();

    const { t } = useTranslation({ CustomControls });

    const constrolsList = useCustomControlsList(t);

    const interactions = useGetInteractions();
    const interactionsFuncs = useGetInteractionsFuncs(interactions);

    const clickToolButton = useCallback(() => {
        if (!clickedControl || clickedControl?.interaction || clickedControl?.disabled) return;
        const controlButton = document.querySelector(`button[id^='${clickedControl?.target}'`) as HTMLButtonElement;
        if (controlButton) {
            controlButton.click();
            if (controlButton.classList.contains("active")) {
                setClickedControl(null);
            }
        }
    }, [clickedControl, setClickedControl]);

    const onConfirm = useCallback(
        (control: CustomControlItem) => {
            interactionsFuncs.handleClick(control);

            if (control.interaction !== InteractionType.MODIFY && control.interaction !== InteractionType.TRANSLATE_OBJECT) {
                interactions.selectInteraction.getFeatures().clear();
                selectedObjects.forEach((feat) => {
                    feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
                });
                setSelectedObjects([]);
                setWorkingLayerDrawerOpened(false);
                setClickedMapFeature(null);
            }

            setClickedControl(control?.id === clickedControl?.id ? null : control);
            prevClickedControl = null;
        },
        [
            interactionsFuncs,
            interactions,
            selectedObjects,
            clickedControl,
            setSelectedObjects,
            setClickedControl,
            setClickedMapFeature,
            setWorkingLayerDrawerOpened,
        ]
    );

    const onClick = useCallback(
        (control: CustomControlItem) => {
            if (control.disabled) return;

            if (clickedControl?.interaction === InteractionType.SELECT && selectedObjects.length > 1) {
                prevClickedControl = control;
                confirmMultipleDeselectionModal.open();
                return;
            }
            onConfirm(control);
        },
        [clickedControl, selectedObjects, confirmMultipleDeselectionModal, onConfirm]
    );

    useEffect(() => {
        clickToolButton();
        return () => {
            clickToolButton();
        };
    }, [clickToolButton]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && clickedControl) {
                if (clickedControl.interaction === InteractionType.SELECT && selectedObjects.length > 1) {
                    return;
                }
                if (clickedControl.target) {
                    const controlButton = document.querySelector(`button[id^='${clickedControl.target}']`) as HTMLButtonElement;
                    if (controlButton?.classList.contains("active")) {
                        controlButton.click();
                    }
                }
                setClickedControl(null);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [clickedControl, setClickedControl, selectedObjects]);

    return (
        <>
            <div className="custom-controls">
                <div className="control-btns">
                    {constrolsList.map((control) => {
                        return <ButtonControl key={`custom-control-${control.id}`} control={control} onClick={onClick} />;
                    })}
                </div>
                <div className="all-reports-btn">
                    <AllReportsControl />
                </div>
                <CenterReportControl />
            </div>
            <AddOrRemoveMapControlInteraction {...interactionsFuncs} {...interactions} />
            <AddOrRemoveSnapInteraction {...interactions} />
            <ConfirmCopyModal />
            <ConfirmMultipleDeselection onConfirm={() => onConfirm(prevClickedControl!)} />
            <SearchObjectsModal />
        </>
    );
};

export default memo(CustomControls);
