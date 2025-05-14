import { StatusMessage } from "@/constants/communities/types";
import { LocalStorageData } from "@/constants/localStorage/types";
import { useCommunityStore, useLocalStorageStore } from "@/store";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import isEqual from "lodash.isequal";
import { Map } from "ol";
import { useCallback, useEffect } from "react";

interface Props {
    map: Map | null;
    mapSwitcher: typeof LayerSwitcher;
}

const SaveButtonHandler: React.FC<Props> = ({ map, mapSwitcher }) => {
    const { community, addAlertMessage } = useCommunityStore();
    const { localStorageData, setLocalStorage } = useLocalStorageStore();

    const handleSaveButton = useCallback(async () => {
        if (!community?.name || !map || !mapSwitcher) return;
        await mapSwitcher?._updateLayersOrder();
        const layers = map.getAllLayers();
        const view = map.getView();
        const mapControls = map.getControls().getArray();
        const switcher: typeof LayerSwitcher = mapControls[mapControls.length - 1];
        const newLocalStorageData: LocalStorageData = {
            activeLayer: layers[layers.length - 1].get("title"),
            center: view.getCenter()?.map((c) => c) || [],
            layers: switcher._layersOrder.reverse().map((layer: { title: string }, index: number) => {
                const mapLayer = layers.find((l) => l.get("title") === layer.title);
                return {
                    name: mapLayer?.get("title"),
                    opacity: mapLayer?.getOpacity(),
                    type: mapLayer?.get("type"),
                    visibility: mapLayer?.getVisible(),
                    order: index,
                };
            }),
            zoom: view.getZoom() || 0,
            projection: view.getProjection().getCode(),
        };
        if (isEqual(newLocalStorageData, localStorageData)) return;
        await setLocalStorage(community?.name, newLocalStorageData);
        addAlertMessage(StatusMessage.success, "Enregistrement fait avec succès");
    }, [map, mapSwitcher, community, localStorageData, setLocalStorage, addAlertMessage]);

    useEffect(() => {
        document.addEventListener("save-view-button", handleSaveButton);

        return () => {
            document.removeEventListener("save-view-button", handleSaveButton);
        };
    });

    return null;
};

export default SaveButtonHandler;
