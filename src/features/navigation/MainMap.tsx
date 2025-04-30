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
import { useCommunityStore } from "@/store";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import layerSwitcherControl from "./controls/layerSwitcherControl";
import BaseLayer from "ol/layer/Base";
import useGetLayersHook from "@/hooks/navigation/layers";
import { SourceLayer } from "@/store/useCommunityStore";
import useGpConfig from "@/hooks/navigation/useGpConfig";

export default function MainMap() {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map>(null);
    const switcherRef = useRef<typeof LayerSwitcher>(null);

    const { mapLayers, errorCommunity } = useCommunityStore();
    useGetLayersHook();

    if (errorCommunity) console.error(errorCommunity);

    const mapControls = getMapControls();

    const addLayer = useCallback((layer: BaseLayer): void => {
        mapRef.current?.addLayer(layer);
        switcherRef.current?.addLayer(layer, {
            title: layer.get("title"),
            description: layer.get("description"),
        });
    }, []);

    const { data: cfg } = useGpConfig();

    useEffect(() => {
        if (cfg && typeof cfg.call === "function") cfg.call();
    }, [cfg]);

    useLayoutEffect(() => {
        if (mapRef.current && switcherRef.current) return;
        const mapLayersSource: BaseLayer[] = mapLayers.map((layer: SourceLayer) => layer.source);

        mapRef.current = new Map({
            target: mapTargetRef.current as HTMLElement,
            layers: mapLayersSource,
            interactions: defaultInteractions(),
            controls: mapControls,
            view: new View({
                projection: olDefaults.projection,
                center: fromLonLat(olDefaults.center),
                zoom: olDefaults.zoom,
            }),
        });

        const switcher = layerSwitcherControl(mapLayers);

        mapRef.current.addControl(switcher);

        switcherRef.current = switcher;

        mapRef.current?.render();
    });

    useEffect(() => {
        (async () => {
            if (!mapRef.current || !switcherRef.current) return;
            mapRef.current?.getLayers().clear();
            mapLayers.forEach((layer: SourceLayer) => {
                addLayer(layer.source);
            });
        })();
    }, [mapLayers, addLayer]);

    return (
        <div className={fr.cx("fr-grid-row")}>
            <div className={cx(fr.cx("fr-col"), "map-view")} ref={mapTargetRef}></div>
        </div>
    );
}
