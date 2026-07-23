import DrawerComponent from "@/components/DrawerComponent";
import { useContributionStore, useMapStore, useModalStore } from "@/store";
import { useCallback, useEffect, useRef } from "react";
import ShowFeatureTypeForm from "./forms/ShowFeatureTypeForm";
import EditFeatureTypeForm from "./forms/EditFeatureTypeForm";
import { FeatureTypeMode } from "@/constants/contributions/types";
import { FEATURE_TYPE_NEW_PROPERTY, FEATURE_TYPE_SELECTED_PROPERTY } from "@/constants";
import ConfirmMultipleDeselection from "@/features/navigation/controls/custom-controls/ConfirmMultipleDeselection";

const WorkingLayerDrawer = () => {
    const { clickedMapFeature, workingLayerDrawerOpened, setWorkingLayerDrawerOpened, setClickedMapFeature } = useMapStore();
    const { featureTypeMode, isReviewContribution, selectedObjects, setSelectedObjects, setFeatureTypeMode, setColumnsToModify } = useContributionStore();
    const { confirmMultipleDeselectionModal } = useModalStore();

    const pendingClose = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (clickedMapFeature && !workingLayerDrawerOpened && !isReviewContribution) {
            if (clickedMapFeature.get(FEATURE_TYPE_NEW_PROPERTY)) {
                setFeatureTypeMode(FeatureTypeMode.EDIT);
            }
            setWorkingLayerDrawerOpened(true);
        }
    }, [clickedMapFeature, workingLayerDrawerOpened, isReviewContribution, setWorkingLayerDrawerOpened, setFeatureTypeMode]);

    const closeDrawer = useCallback(() => {
        selectedObjects.forEach((feat) => {
            feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
            feat.changed();
        });
        setSelectedObjects([]);
        setColumnsToModify([]);
        setClickedMapFeature(null);
        setWorkingLayerDrawerOpened(false);
        setFeatureTypeMode(FeatureTypeMode.VIEW);
    }, [selectedObjects, setSelectedObjects, setColumnsToModify, setClickedMapFeature, setWorkingLayerDrawerOpened, setFeatureTypeMode]);

    const handleCloseDrawer = useCallback(() => {
        if (selectedObjects.length > 1) {
            pendingClose.current = closeDrawer;
            confirmMultipleDeselectionModal.open();
            return;
        }
        closeDrawer();
    }, [selectedObjects.length, closeDrawer, confirmMultipleDeselectionModal]);

    useEffect(() => {
        if (!clickedMapFeature && workingLayerDrawerOpened) {
            handleCloseDrawer();
        }
    }, [clickedMapFeature, handleCloseDrawer, workingLayerDrawerOpened]);

    const onConfirmDeselection = useCallback(() => {
        confirmMultipleDeselectionModal.close();
        closeDrawer();
        pendingClose.current = null;
    }, [confirmMultipleDeselectionModal, closeDrawer]);

    const drawerWidth = window.innerWidth * (1.2 / 3);

    return (
        <>
            <DrawerComponent anchor="left" isOpen={workingLayerDrawerOpened} onClose={handleCloseDrawer}>
                <div className="working-layer-drawer" style={{ maxWidth: drawerWidth }}>
                    {featureTypeMode === FeatureTypeMode.VIEW ? (
                        <ShowFeatureTypeForm onClose={handleCloseDrawer} />
                    ) : (
                        <EditFeatureTypeForm onClose={handleCloseDrawer} />
                    )}
                </div>
            </DrawerComponent>
            <ConfirmMultipleDeselection onConfirm={onConfirmDeselection} />
        </>
    );
};

export default WorkingLayerDrawer;
