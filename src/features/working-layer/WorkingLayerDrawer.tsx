import DrawerComponent from "@/components/DrawerComponent";
import { useContributionStore, useMapStore } from "@/store";
import { useEffect } from "react";
import ShowFeatureTypeForm from "./forms/ShowFeatureTypeForm";
import EditFeatureTypeForm from "./forms/EditFeatureTypeForm";
import { FeatureTypeMode } from "@/constants/contributions/types";

const WorkingLayerDrawer = () => {
    const { clickedMapFeature, workingLayerDrawerOpened, setWorkingLayerDrawerOpened, setClickedMapFeature } = useMapStore();
    const { featureTypeMode, setFeatureTypeMode } = useContributionStore();

    useEffect(() => {
        if (clickedMapFeature && !workingLayerDrawerOpened) {
            setWorkingLayerDrawerOpened(true);
        }
    }, [clickedMapFeature, workingLayerDrawerOpened, setWorkingLayerDrawerOpened]);

    const handleCloseDrawer = () => {
        setClickedMapFeature(null);
        setWorkingLayerDrawerOpened(false);
        setFeatureTypeMode(FeatureTypeMode.VIEW);
    };

    const drawerWidth = window.innerWidth * (1.2 / 3);

    return (
        <DrawerComponent anchor="left" isOpen={workingLayerDrawerOpened} onClose={handleCloseDrawer}>
            <div className="working-layer-drawer" style={{ maxWidth: drawerWidth, height: "100%" }}>
                {featureTypeMode === FeatureTypeMode.VIEW ? <ShowFeatureTypeForm /> : <EditFeatureTypeForm />}
            </div>
        </DrawerComponent>
    );
};

export default WorkingLayerDrawer;
