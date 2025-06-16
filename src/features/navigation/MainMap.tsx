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

import getMapControls from "./controls";
import { useCommunityStore, useLocalStorageStore, useMapStore } from "@/store";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import layerSwitcherControl from "./controls/layerSwitcherControl";
import useGpConfig from "@/hooks/navigation/useGpConfig";
import GetAllLayers from "./layers";
import { MapLayer, MapLayerSource } from "@/constants/communities/types";
import ShowReportModal from "../reports/ShowReportModal";
import { getLonLatFromPoint } from "@/constants/utils";
import SaveButtonHandler from "./SaveButtonHandler";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS";
import { GetFeatureInfosHandler } from "./GetFeatureInfosHandler";

export default function MainMap() {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map>(null);
    const viewRef = useRef<View>(null);
    const switcherRef = useRef<typeof LayerSwitcher>(null);

    const { community, mapLayers } = useCommunityStore();
    const { localStorageData } = useLocalStorageStore();
    const { map, setMap } = useMapStore();

    const mapControls = getMapControls();
    const { data: cfg } = useGpConfig();

    const addLayer = useCallback((layer: MapLayerSource): void => {
        mapRef.current?.addLayer(layer);
        switcherRef.current?.addLayer(layer, {
            title: layer.get("title"),
            description: layer.get("description"),
            type: layer.get("type"),
        });
    }, []);

    useEffect(() => {
        if (cfg && typeof cfg.call === "function") cfg.call();
    }, [cfg]);
    useLayoutEffect(() => {
        if (mapRef.current && switcherRef.current) return;
        const mapLayersSource: MapLayerSource[] = mapLayers.map((layer: MapLayer) => layer.source);

        const mapView = new View({
            projection: localStorageData?.projection || olDefaults.projection,
            center: localStorageData?.center || getLonLatFromPoint(community?.position),
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

        const geoLayer = new TileLayer({
            source: new TileWMS({
                url: "https://data.geopf.fr/wms-v/ows",
                params: {
                    LAYERS: "PROTECTEDAREAS.PRSF",
                    TILED: true,
                },
                serverType: "geoserver",
            }),
            visible: true,
        });

        geoLayer.set("title", "Zones protégées - Géoportail");
        geoLayer.set("name", "PROTECTEDAREAS.PRSF");
        geoLayer.set("infoFormat", "text/html");

        mapRef.current.addLayer(geoLayer);
        switcherRef.current.addLayer(geoLayer, {
            title: "Zones protégées - Géoportail",
            description: "Couches issues de data.geopf.fr",
        });

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
    console.log("Map Current", mapRef.current);

    const mapToolbarHeader = document.getElementById("map-toolbar-header");

    return (
        <div className={fr.cx("fr-grid-row")}>
            <div
                className={cx(fr.cx("fr-col"), "map-view")}
                ref={mapTargetRef}
                style={{ height: `calc(100vh - ${mapToolbarHeader?.clientHeight || 0}px)` }}
            ></div>
            <SaveButtonHandler map={mapRef.current} mapSwitcher={switcherRef.current} />
            <GetAllLayers />;
            <ShowReportModal map={mapRef.current} />
            <GetFeatureInfosHandler map={mapRef.current} />;
        </div>
    );
}
