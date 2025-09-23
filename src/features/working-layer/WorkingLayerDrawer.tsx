import DrawerComponent from "@/components/DrawerComponent";
import { useMapStore } from "@/store";
import { useEffect } from "react";
import ShowFeatureTypeForm from "./forms/ShowFeatureTypeForm";
import "./workingLayerDrawer.css";

const WorkingLayerDrawer = () => {
    const { clickedMapFeature, workingLayerDrawerOpened, setWorkingLayerDrawerOpened, setClickedMapFeature } = useMapStore();

    useEffect(() => {
        if (clickedMapFeature && !workingLayerDrawerOpened) {
            setWorkingLayerDrawerOpened(true);
        }
    }, [clickedMapFeature, workingLayerDrawerOpened, setWorkingLayerDrawerOpened]);

    const handleCloseDrawer = () => {
        setClickedMapFeature(null);
        setWorkingLayerDrawerOpened(false);
    };

    const drawerWidth = window.innerWidth * (1.2 / 3);
    return (
        <DrawerComponent anchor="left" isOpen={workingLayerDrawerOpened} onClose={handleCloseDrawer}>
            <div className="working-layer-drawer" style={{ maxWidth: drawerWidth }}>
                <ShowFeatureTypeForm />
            </div>
        </DrawerComponent>
    );
};

export default WorkingLayerDrawer;
