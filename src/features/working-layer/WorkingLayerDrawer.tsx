import DrawerComponent from "@/components/DrawerComponent";
import { useContributionStore, useMapStore, useModalStore } from "@/store";
import { useCallback, useEffect, useRef } from "react";
import ShowFeatureTypeForm from "./forms/ShowFeatureTypeForm";
import EditFeatureTypeForm from "./forms/EditFeatureTypeForm";
import { FeatureTypeMode } from "@/constants/contributions/types";
import { FEATURE_TYPE_SELECTED_PROPERTY } from "@/constants";
import ConfirmMultipleDeselection from "@/features/navigation/controls/custom-controls/ConfirmMultipleDeselection";

const WorkingLayerDrawer = () => {
    const { clickedMapFeature, workingLayerDrawerOpened, setWorkingLayerDrawerOpened, setClickedMapFeature } = useMapStore();
    const { featureTypeMode, selectedObjects, setSelectedObjects, setFeatureTypeMode, setColumnsToModify } = useContributionStore();
    const { confirmMultipleDeselectionModal } = useModalStore();

    const pendingClose = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (clickedMapFeature && !workingLayerDrawerOpened) {
            setWorkingLayerDrawerOpened(true);
        }
    }, [clickedMapFeature, workingLayerDrawerOpened, setWorkingLayerDrawerOpened]);

    useEffect(() => {
        if (!clickedMapFeature && workingLayerDrawerOpened) {
            handleCloseDrawer();
        }
    }, [clickedMapFeature]);

    const handleCloseDrawer = useCallback(() => {
        if (selectedObjects.length > 1) {
            pendingClose.current = handleCloseDrawer;
            confirmMultipleDeselectionModal.open();
            return;
        }
        selectedObjects.forEach((feat) => {
            feat.unset(FEATURE_TYPE_SELECTED_PROPERTY);
            feat.changed();
        });
        setSelectedObjects([]);
        setColumnsToModify([]);
        setClickedMapFeature(null);
        setWorkingLayerDrawerOpened(false);
        setFeatureTypeMode(FeatureTypeMode.VIEW);
    }, [selectedObjects, setClickedMapFeature, setFeatureTypeMode, setSelectedObjects, setWorkingLayerDrawerOpened, setColumnsToModify]);

    const onConfirmDeselection = useCallback(() => {
        confirmMultipleDeselectionModal.close();
        pendingClose.current?.();
        pendingClose.current = null;
    }, [confirmMultipleDeselectionModal]);

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
