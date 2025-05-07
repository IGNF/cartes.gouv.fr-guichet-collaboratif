import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { View } from "ol";
import { defaults as defaultInteractions } from "ol/interaction";
import Map from "ol/Map";
import { fromLonLat } from "ol/proj";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import olDefaults from "@/api/ol-defaults.json";

import "ol/ol.css";

import "geopf-extensions-openlayers/css/Dsfr.css";

import "./map-view.css";
import getMapControls from "./controls";
import { useCommunityStore, useLocalStorageStore, useMapStore } from "@/store";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import layerSwitcherControl from "./controls/layerSwitcherControl";
import useGpConfig from "@/hooks/navigation/useGpConfig";
import GetAllLayers from "./layers";

import isEqual from "lodash.isequal";
import { MapLayer, MapLayerSource, StatusMessage } from "@/constants/communities/types";
import { LocalStorageData } from "@/constants/localStorage/types";

export default function MainMap() {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map>(null);
    const viewRef = useRef<View>(null);
    const switcherRef = useRef<typeof LayerSwitcher>(null);

    const { community, mapLayers, addAlertMessage } = useCommunityStore();
    const { localStorageData, setLocalStorage } = useLocalStorageStore();
    const { map, setMap } = useMapStore();

    const mapControls = getMapControls();

    const addLayer = useCallback((layer: MapLayerSource): void => {
        mapRef.current?.addLayer(layer);
        switcherRef.current?.addLayer(layer, {
            title: layer.get("title"),
            description: layer.get("description"),
            type: layer.get("type"),
        });
    }, []);

    const { data: cfg } = useGpConfig();

    useEffect(() => {
        if (cfg && typeof cfg.call === "function") cfg.call();
    }, [cfg]);
    useLayoutEffect(() => {
        if (mapRef.current && switcherRef.current) return;
        const mapLayersSource: MapLayerSource[] = mapLayers.map((layer: MapLayer) => layer.source);

        const mapView = new View({
            projection: localStorageData?.projection || olDefaults.projection,
            center: localStorageData?.center || fromLonLat(olDefaults.center),
            zoom: localStorageData?.zoom || olDefaults.zoom,
        });

        mapRef.current = new Map({
            target: mapTargetRef.current as HTMLElement,
            layers: mapLayersSource,
            interactions: defaultInteractions(),
            controls: mapControls,
            view: mapView,
        });

        const switcher = layerSwitcherControl(mapLayers);

        mapRef.current.addControl(switcher);

        viewRef.current = mapView;
        switcherRef.current = switcher;

        mapRef.current?.render();
        if (!map) {
            setMap(mapRef.current);
        }
    });

    useEffect(() => {
        if (!mapRef.current || !switcherRef.current) return;
        mapRef.current?.getLayers().clear();

        mapLayers.forEach((layer: MapLayer) => {
            addLayer(layer.source);
        });
        console.log(switcherRef.current, mapRef.current);
    }, [mapLayers, addLayer]);

    const handleSaveButton = async () => {
        if (!community?.name || !mapRef.current || !switcherRef.current) return;
        await switcherRef.current?._updateLayersOrder();
        const layers = mapRef.current.getAllLayers();
        const view = mapRef.current.getView();
        const mapControls = mapRef.current.getControls().getArray();
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
    };

    useEffect(() => {
        document.addEventListener("save-view-button", handleSaveButton);

        return () => {
            document.removeEventListener("save-view-button", handleSaveButton);
        };
    });

    const mapToolbarHeader = document.getElementById("map-toolbar-header");
    console.log(mapLayers);

    return (
        <div className={fr.cx("fr-grid-row")}>
            <div
                className={cx(fr.cx("fr-col"), "map-view")}
                ref={mapTargetRef}
                style={{ height: `calc(100vh - ${mapToolbarHeader?.clientHeight || 0}px)` }}
            ></div>
            <GetAllLayers />
        </div>
    );
}
