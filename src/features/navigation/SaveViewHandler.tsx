import { LocalStorageData } from "@/constants/localStorage/types";
import { StatusKey } from "@/constants/reports/types";
import { reportImgStatus } from "@/constants/utils";
import useDebounce from "@/hooks/useDebounce";
import { useCommunityStore, useLocalStorageStore, useMapStore } from "@/store";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import isEqual from "lodash.isequal";
import { Map } from "ol";
import Layer from "ol/layer/Layer";
import { useCallback, useEffect, useState } from "react";

interface StateProps {
    map: Map | null;
    mapSwitcher: typeof LayerSwitcher | null;
}

const SaveViewHandler: React.FC = () => {
    const { community } = useCommunityStore();
    const { localStorageData, setLocalStorage } = useLocalStorageStore();
    const [changed, setChanged] = useState<StateProps>({ map: null, mapSwitcher: null });
    const { mapWorkingLayer, map, mapSwitcher } = useMapStore();

    const debounced = useDebounce(changed, 500);

    useEffect(() => {
        if (map && mapSwitcher && !changed.map && !changed.mapSwitcher) {
            setChanged({ map, mapSwitcher });
        }
    }, [map, mapSwitcher, changed]);

    const handleSaveButton = useCallback(async () => {
        if (!community?.name || !map || !mapSwitcher) return;
        await mapSwitcher?._updateLayersOrder();
        const view = map.getView();
        const mapControls = map.getControls().getArray();
        const switcher: typeof LayerSwitcher = mapControls.find((c) => c instanceof LayerSwitcher);
        const newLocalStorageData: LocalStorageData = {
            activeLayer: mapWorkingLayer,
            center: view.getCenter()?.map((c) => c) || [],
            layers: switcher._layersOrder.reverse().map((switcherLayer: { layer: Layer }, index: number) => {
                return {
                    name: switcherLayer?.layer?.get("title"),
                    opacity: switcherLayer?.layer?.getOpacity(),
                    type: switcherLayer?.layer?.get("type"),
                    visibility: switcherLayer?.layer?.getVisible(),
                    order: index,
                };
            }),
            zoom: view.getZoom() || 0,
            projection: view.getProjection().getCode(),
        };
        if (isEqual(newLocalStorageData, localStorageData)) return;
        await setLocalStorage(community?.name, newLocalStorageData);
    }, [map, mapSwitcher, community, localStorageData, mapWorkingLayer, setLocalStorage]);

    useEffect(() => {
        if (debounced) {
            handleSaveButton();
        }
    }, [debounced, handleSaveButton]);

    const onChange = useCallback(() => {
        setChanged({ map: map!, mapSwitcher });
    }, [map, mapSwitcher]);

    useEffect(() => {
        const mapView = map?.getView();
        mapView?.on("change:center", onChange);
        mapView?.on("change:rotation", onChange);
        mapSwitcher?.on("layerswitcher:change:visibility", onChange);
        mapSwitcher?.on("layerswitcher:change:opacity", onChange);
        mapSwitcher?.on("layerswitcher:change:position", onChange);

        return () => {
            mapView?.un("change:center", onChange);
            mapView?.un("change:rotation", onChange);
            mapSwitcher?.un("layerswitcher:change:visibility", onChange);
            mapSwitcher?.un("layerswitcher:change:opacity", onChange);
            mapSwitcher?.un("layerswitcher:change:position", onChange);
        };
    }, [map, mapSwitcher, onChange]);

    useEffect(() => {
        Object.keys(reportImgStatus).forEach((key: string) => {
            const img = new Image();
            img.src = reportImgStatus[key as StatusKey].img;
        });
    });

    return null;
};

export default SaveViewHandler;
