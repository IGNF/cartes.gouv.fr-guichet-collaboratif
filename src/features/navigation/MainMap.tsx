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
import SaveViewHandler from "./SaveViewHandler";
import ReportDrawer from "../reports/ReportDrawer";
import { Cluster } from "ol/source";
import VectorLayer from "ol/layer/Vector";
import { clusterStyle } from "@/constants/styles";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import useGetMapControls from "./controls";
import WorkingLayerDrawer from "../working-layer/WorkingLayerDrawer";
import { Control } from "ol/control";
import Layer from "ol/layer/Layer";
import WorkingLayerControl from "./controls/WorkingLayerControl";
import { APP_FOOTER_MIN_HEIGHT } from "@/constants";
import WorkingLayerLabelMap from "./controls/WorkingLayerLabelMap";
import CustomControls from "./controls/cusom-controls";

export default function MainMap() {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map>(null);
    const viewRef = useRef<View>(null);
    const switcherRef = useRef<LayerSwitcher>(null);

    const { community, mapLayers } = useCommunityStore();
    const { localStorageData } = useLocalStorageStore();
    const { map, mapSwitcher, setMap } = useMapStore();

    const mapControls = useGetMapControls();

    const addReportLayer = useCallback((layer: VectorLayer) => {
        const reportCluster = new Cluster({
            distance: 60,
            source: layer.getSource() || undefined,
        });

        const reportLayer = new VectorLayer({
            source: reportCluster,
            style: clusterStyle,
        });

        reportLayer.set("title", layer.get("title"));
        reportLayer.set("description", layer.get("description"));
        reportLayer.set("type", layer.get("type"));

        mapRef.current?.addLayer(reportLayer);
        switcherRef.current?.addLayer(reportLayer, {
            title: layer.get("title"),
            description: layer.get("description"),
            //type: layer.get("type"),
        });
    }, []);

    const addLayer = useCallback(
        (layer: MapLayerSource | Layer): void => {
            if (layer.get("type") === REPORTS_LAYER_TYPE) {
                addReportLayer(layer as VectorLayer);
                return;
            }

            mapRef.current?.addLayer(layer);
            switcherRef.current?.addLayer(layer as Layer, {
                title: layer.get("title"),
                description: layer.get("description"),
                //type: layer.get("type"),
            });
        },
        [addReportLayer]
    );

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

        const switcher = layerSwitcherControl(mapLayers);

        mapRef.current = new Map({
            target: mapTargetRef.current as HTMLElement,
            layers: mapLayersSource,
            interactions: defaultInteractions(),
            controls: [...(mapControls as Control[]), switcher],
            view: mapView,
        });

        viewRef.current = mapView;
        switcherRef.current = switcher;

        mapRef.current?.render();
        if (!map && !mapSwitcher) {
            setMap(mapRef.current, switcherRef.current);
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
        <div className={(fr.cx("fr-grid-row"), "grid-map-container")}>
            <div
                className={cx(fr.cx("fr-col"), "map-view")}
                ref={mapTargetRef}
                style={{ height: `calc(100vh - ${(mapToolbarHeader?.clientHeight || 0) + APP_FOOTER_MIN_HEIGHT}px)` }}
            ></div>

            <SaveViewHandler />
            <GetAllLayers />

            <ReportDrawer />
            <WorkingLayerDrawer />
            <WorkingLayerControl />
            <WorkingLayerLabelMap />

            {map?.getAllLayers().length && <CustomControls />}
        </div>
    );
}
