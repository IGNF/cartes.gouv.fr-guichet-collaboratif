import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import { View } from "ol";
import { defaults as defaultInteractions } from "ol/interaction";
import Map from "ol/Map";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import olDefaults from "@/api/ol-defaults.json";
import "ol/ol.css";
import "geopf-extensions-openlayers/css/Dsfr.css";
import "./map-view.css";
import { useCommunityStore, useLocalStorageStore, useMapStore } from "@/store";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import layerSwitcherControl from "./controls/layerSwitcherControl";
import useGpConfig from "@/hooks/navigation/useGpConfig";
import GetAllLayers from "./layers";
import { MapLayer, MapLayerSource } from "@/constants/communities/types";
import { getLonLatFromPoint } from "@/constants/utils";
import SaveButtonHandler from "./SaveButtonHandler";
import getMapControls from "./controls";
import ReportDrawer from "../reports/ReportDrawer";
import { Cluster } from "ol/source";
import VectorLayer from "ol/layer/Vector";
import { clusterStyle } from "@/constants/reports/utils/cluster";

export default function MainMap() {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map>(null);
    const viewRef = useRef<View>(null);
    const switcherRef = useRef<typeof LayerSwitcher>(null);

    const { community, mapLayers } = useCommunityStore();
    const { localStorageData } = useLocalStorageStore();
    const { map, setMap } = useMapStore();

    const mapControls = getMapControls();

    const addLayer = useCallback((layer: MapLayerSource): void => {
        let newLayer: MapLayerSource | Cluster = layer;

        if (layer.get("title") === "Signalements") {
            const reportCluster = new Cluster({
                distance: 60,
                source: (layer as VectorLayer).getSource() || undefined,
            });

            newLayer = new VectorLayer({
                source: reportCluster,
                style: clusterStyle,
            });

            newLayer.set("title", layer.get("title"));
            newLayer.set("description", layer.get("description"));
            newLayer.set("type", layer.get("type"));
        }
        mapRef.current?.addLayer(newLayer);
        switcherRef.current?.addLayer(newLayer, {
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
            center: localStorageData?.center || (getLonLatFromPoint(community?.position) as number[]),
            zoom: localStorageData?.zoom || community?.zoom,
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
        (async () => {
            if (!mapRef.current || !switcherRef.current) return;
            mapRef.current?.getLayers().clear();

            mapLayers.forEach((layer: MapLayer) => {
                addLayer(layer.source);
            });
        })();
    }, [mapLayers, addLayer]);

    const mapToolbarHeader = document.getElementById("map-toolbar-header");

    return (
        <div className={fr.cx("fr-grid-row")}>
            <div
                className={cx(fr.cx("fr-col"), "map-view")}
                ref={mapTargetRef}
                style={{ height: `calc(100vh - ${mapToolbarHeader?.clientHeight || 0}px)` }}
            ></div>

            <SaveButtonHandler map={mapRef.current} mapSwitcher={switcherRef.current} />
            <GetAllLayers />

            <ReportDrawer />
        </div>
    );
}
