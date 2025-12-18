import DrawerComponent from "@/components/DrawerComponent";
import { useContributionStore, useMapStore } from "@/store";
import { useCallback, useEffect } from "react";
import ShowFeatureTypeForm from "./forms/ShowFeatureTypeForm";
import EditFeatureTypeForm from "./forms/EditFeatureTypeForm";
import { FeatureTypeMode } from "@/constants/contributions/types";
import { FEATURE_TYPE_SELECTED_PROPERTY } from "@/constants";

const WorkingLayerDrawer = () => {
    const { clickedMapFeature, workingLayerDrawerOpened, setWorkingLayerDrawerOpened, setClickedMapFeature } = useMapStore();
    const { featureTypeMode, selectedObjects, setSelectedObjects, setFeatureTypeMode, setColumnsToModify } = useContributionStore();

    useEffect(() => {
        if (clickedMapFeature && !workingLayerDrawerOpened) {
            setWorkingLayerDrawerOpened(true);
        }
    }, [clickedMapFeature, workingLayerDrawerOpened, setWorkingLayerDrawerOpened]);

    const handleCloseDrawer = useCallback(() => {
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

    const drawerWidth = window.innerWidth * (1.2 / 3);

    return (
        <DrawerComponent anchor="left" isOpen={workingLayerDrawerOpened} onClose={handleCloseDrawer}>
            <div className="working-layer-drawer" style={{ maxWidth: drawerWidth }}>
                {featureTypeMode === FeatureTypeMode.VIEW ? <ShowFeatureTypeForm /> : <EditFeatureTypeForm />}
            </div>
        </DrawerComponent>
    );
};

export default WorkingLayerDrawer;
