import { memo, useCallback, useEffect, useRef } from "react";
import ButtonControl from "./ButtonControl";
import { useContributionStore, useMapStore, useModalStore } from "@/store";
import AllReportsControl from "./AllReportsControl";
import { useTranslation } from "@/i18n";
import useCustomControlsList from "@/hooks/navigation/controls/useCustomControlsList";
import CenterReportControl from "./CenterReportControl";
import AddOrRemoveSnapInteraction from "./interactions/AddOrRemoveSnapInteraction";
import useGetInteractionsFuncs from "@/hooks/navigation/controls/useGetInteractionsFuncs";
import AddOrRemoveMapControlInteraction from "./interactions/AddOrRemoveMapControlInteraction";
import useGetInteractions from "@/hooks/navigation/controls/useGetInteractions";
import { CustomControlItem, InteractionType } from "@/constants/communities/types";
import { FeatureTypeFormActionMode } from "@/constants/contributions/types";
import { FEATURE_TYPE_SELECTED_PROPERTY } from "@/constants";
import ConfirmMultipleDeselection from "./ConfirmMultipleDeselection";
import ConfirmMultipleObjectsActionModal from "@/features/working-layer/forms/ConfirmMultipleObjectsActionModal";
import SearchObjectsModal from "@/features/working-layer/modal/searchObjects/SearchObjectsModal";
import ExportMapModal from "./ExportMapModal";
import NamedPositionModal from "../NamedPositionModal";

const CustomControls = () => {
    const { clickedControl, setClickedControl, setWorkingLayerDrawerOpened, setClickedMapFeature, clickedMapFeature, workingLayerDrawerOpened } = useMapStore();
    const { selectedObjects, setSelectedObjects } = useContributionStore();
    const { confirmMultipleDeselectionModal, confirmMultipleObjectsActionModal } = useModalStore();

    const { t } = useTranslation({ CustomControls });

    const controlsList = useCustomControlsList(t);

    const interactions = useGetInteractions();
    const interactionsFuncs = useGetInteractionsFuncs(interactions);
    const pendingControlChange = useRef<CustomControlItem | null>(null);

    useEffect(() => {
        const selectControl = controlsList.find((c) => c.interaction === InteractionType.SELECT);
        if (clickedControl?.interaction === InteractionType.SELECT && selectControl?.disabled) {
            setClickedControl(null);
        }
    }, [controlsList, clickedControl, setClickedControl]);

    useEffect(() => {
        if (selectedObjects.length === 0) {
            interactions.selectInteraction.clearSelection();
        }
    }, [selectedObjects, interactions.selectInteraction]);

    const clickToolButton = useCallback(() => {
        if (!clickedControl || clickedControl.disabled || !(clickedControl?.interaction === InteractionType.CREATE_REPORT)) return;

        const controlButton = document.querySelector(`button[id^='${clickedControl.target}']`) as HTMLButtonElement | null;
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
            if (
                control.interaction !== InteractionType.MODIFY &&
                control.interaction !== InteractionType.TRANSLATE_OBJECT &&
                control.interaction !== InteractionType.COPY_OBJECT
            ) {
                interactions.selectInteraction.clearSelection();
                selectedObjects.forEach((feat) => {
                    feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
                });
                setSelectedObjects([]);
                setWorkingLayerDrawerOpened(false);
                setClickedMapFeature(null);
            }

            setClickedControl(control?.id === clickedControl?.id ? null : control);
            pendingControlChange.current = null;
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
                pendingControlChange.current = control;
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

    const handleConfirmDeleteMultiple = useCallback(() => {
        confirmMultipleObjectsActionModal.close();
        if (selectedObjects.length === 0) return;
        interactionsFuncs.deleteSelectedObjects(selectedObjects);
    }, [confirmMultipleObjectsActionModal, interactionsFuncs, selectedObjects]);

    const handleConfirmUnSelectMultiple = () => {
        interactions.selectInteraction.clearSelection();
        selectedObjects.forEach((feat) => {
            feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
            feat.changed();
        });
        setSelectedObjects([]);
        setClickedMapFeature(null);
        confirmMultipleDeselectionModal.close();
    };

    useEffect(() => {
        if (!pendingControlChange.current || selectedObjects.length !== 0) return;
        onConfirm(pendingControlChange.current);
    }, [selectedObjects.length, onConfirm]);

    const isEditableTarget = useCallback((target: EventTarget | null) => {
        return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || (target instanceof HTMLElement && target.isContentEditable);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Delete") {
                console.log(clickedMapFeature, selectedObjects);
                if (isEditableTarget(e.target)) return;

                const deleteControl = controlsList.find((control) => control.interaction === InteractionType.REMOVE);
                if (!deleteControl || deleteControl.disabled) return;

                if (selectedObjects.length > 1) {
                    confirmMultipleObjectsActionModal.open();
                    return;
                }

                const targetFeature = selectedObjects[0] ?? null;
                if (targetFeature) {
                    interactionsFuncs.deleteSelectedObjects([targetFeature]);
                }
                return;
            }

            if (e.key !== "Escape") return;
            if (workingLayerDrawerOpened) {
                setClickedMapFeature(null);
                return;
            }
            if (clickedControl) {
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
    }, [
        clickedControl,
        setClickedControl,
        selectedObjects,
        workingLayerDrawerOpened,
        setClickedMapFeature,
        controlsList,
        confirmMultipleObjectsActionModal,
        interactionsFuncs,
        isEditableTarget,
    ]);

    return (
        <>
            <div className="custom-controls">
                <div className="control-btns">
                    {controlsList.map((control) => {
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
            <ConfirmMultipleDeselection onConfirm={handleConfirmUnSelectMultiple} />
            <SearchObjectsModal />
            <ConfirmMultipleObjectsActionModal action={FeatureTypeFormActionMode.DELETE} onConfirm={handleConfirmDeleteMultiple} />
            <ExportMapModal />
            <NamedPositionModal />
        </>
    );
};

export default memo(CustomControls);
