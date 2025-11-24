import DrawerComponent from "@/components/DrawerComponent";
import { useMapStore } from "@/store";
import { useEffect } from "react";
import ShowFeatureTypeForm from "./forms/ShowFeatureTypeForm";
import EditFeatureTypeForm from "./forms/EditFeatureTypeForm";

const WorkingLayerDrawer = () => {
    const { clickedMapFeature, workingLayerDrawerOpened, setWorkingLayerDrawerOpened, setClickedMapFeature, featureTypeMode, setFeatureTypeMode } =
        useMapStore();

    useEffect(() => {
        if (clickedMapFeature && !workingLayerDrawerOpened) {
            setWorkingLayerDrawerOpened(true);
        }
    }, [clickedMapFeature, workingLayerDrawerOpened, setWorkingLayerDrawerOpened]);

    const handleCloseDrawer = () => {
        setClickedMapFeature(null);
        setWorkingLayerDrawerOpened(false);
        setFeatureTypeMode("view");
    };

    const drawerWidth = window.innerWidth * (1.2 / 3);
    return (
        <DrawerComponent anchor="left" isOpen={workingLayerDrawerOpened} onClose={handleCloseDrawer}>
            <div className="working-layer-drawer" style={{ maxWidth: drawerWidth }}>
                {featureTypeMode === "view" ? <ShowFeatureTypeForm /> : <EditFeatureTypeForm />}
            </div>
        </DrawerComponent>
    );
};

export default WorkingLayerDrawer;
