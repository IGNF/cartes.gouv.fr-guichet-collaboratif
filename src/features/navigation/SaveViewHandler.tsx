import { LocalStorageData } from "@/constants/localStorage/types";
import { useCommunityStore, useLocalStorageStore, useMapStore } from "@/store";
import isEqual from "lodash.isequal";
import { EventTypes } from "ol/Observable";
import { useCallback, useEffect } from "react";

let timer: ReturnType<typeof setTimeout> | undefined;

const SaveViewHandler: React.FC = () => {
    const { community } = useCommunityStore();
    const { localStorageData, setLocalStorage } = useLocalStorageStore();
    const { mapWorkingLayer, map, mapSwitcher } = useMapStore();

    const handleSaveButton = useCallback(async () => {
        if (!community?.name || !map) return;
        const orderedLayers = map
            ?.getLayers()
            .getArray()
            .sort((l1, l2) => l1.getZIndex()! - l2.getZIndex()!);
        const view = map.getView();
        const newLocalStorageData: LocalStorageData = {
            activeLayer: mapWorkingLayer,
            center: view.getCenter()?.map((c) => c) || [],
            layers: orderedLayers.map((layer, index: number) => {
                return {
                    name: layer?.get("title"),
                    opacity: layer?.getOpacity(),
                    type: layer?.get("type"),
                    visibility: layer?.getVisible(),
                    order: index,
                };
            }),
            zoom: view.getZoom() || 0,
            projection: view.getProjection().getCode(),
        };
        if (isEqual(newLocalStorageData, localStorageData)) return;
        setLocalStorage(community?.name, newLocalStorageData);
    }, [map, community, localStorageData, mapWorkingLayer, setLocalStorage]);

    const onChange = useCallback(() => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            handleSaveButton();
        }, 200);
    }, [handleSaveButton]);

    useEffect(() => {
        const mapView = map?.getView();
        mapView?.on("change:center", onChange);
        mapView?.on("change:rotation", onChange);
        mapSwitcher?.on("layerswitcher:change:visibility" as EventTypes, onChange);
        mapSwitcher?.on("layerswitcher:change:opacity" as EventTypes, onChange);
        mapSwitcher?.on("layerswitcher:change:position" as EventTypes, onChange);

        return () => {
            mapView?.un("change:center", onChange);
            mapView?.un("change:rotation", onChange);
            mapSwitcher?.un("layerswitcher:change:visibility" as EventTypes, onChange);
            mapSwitcher?.un("layerswitcher:change:opacity" as EventTypes, onChange);
            mapSwitcher?.un("layerswitcher:change:position" as EventTypes, onChange);
        };
    }, [map, mapSwitcher, onChange]);

    return null;
};

export default SaveViewHandler;
