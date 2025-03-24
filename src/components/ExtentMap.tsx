import { fr } from "@codegouvfr/react-dsfr";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import Catalog from "geopf-extensions-openlayers/src/packages/Controls/Catalog/Catalog";
import GeoportalFullScreen from "geopf-extensions-openlayers/src/packages/Controls/FullScreen/GeoportalFullScreen";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import SearchEngine from "geopf-extensions-openlayers/src/packages/Controls/SearchEngine/SearchEngine";
import GeoportalZoom from "geopf-extensions-openlayers/src/packages/Controls/Zoom/GeoportalZoom";
import { View } from "ol";
import { ScaleLine } from "ol/control";
import GeoJSON from "ol/format/GeoJSON";
import { defaults as defaultInteractions } from "ol/interaction";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import Map from "ol/Map";
import { fromLonLat } from "ol/proj";
import VectorSource from "ol/source/Vector";
import WMTS, { optionsFromCapabilities } from "ol/source/WMTS";
import { useEffect, useMemo, useRef } from "react";
// @ts-expect-error il manque les types
import Gp from "geoportal-access-lib";

import extent from "@/data/extent.json";
import olDefaults from "@/data/ol-defaults.json";
import useGpWmtsCapabilities from "@/hooks/useGpWmtsCapabilities";

import "ol/ol.css";

import "geopf-extensions-openlayers/css/Dsfr.css";

import "@/styles/map-view.css";

export default function ExtentMap() {
    const mapTargetRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<Map>(null);

    const { data: capabilities } = useGpWmtsCapabilities();

    useEffect(() => {
        const cfg = new Gp.Services.Config({
            customConfigFile: "https://raw.githubusercontent.com/IGNF/geoportal-configuration/new-url/dist/fullConfig.json",
            onSuccess: () => {
                console.log("gp config loaded!");
            },
            onFailure: (e: unknown) => {
                console.error(e);
            },
        });
        cfg.call();
    }, []);

    const extentLayer = useMemo(() => {
        const extentFeatures = new GeoJSON({
            dataProjection: "EPSG:4326",
            featureProjection: "EPSG:3857",
        }).readFeatures(extent);

        const extentSource = new VectorSource({
            features: extentFeatures,
        });

        return new VectorLayer({
            source: extentSource,
        });
    }, []);

    const bgLayer = useMemo(() => {
        if (!capabilities) return;

        const wmtsOptions = optionsFromCapabilities(capabilities, {
            layer: olDefaults.default_background_layer,
        });

        if (!wmtsOptions) return;

        const bgLayer = new TileLayer();
        bgLayer.setSource(new WMTS(wmtsOptions));

        return bgLayer;
    }, [capabilities]);

    useEffect(() => {
        if (!bgLayer || !extentLayer) return;

        const layerSwitcher = new LayerSwitcher({
            layers: [
                {
                    layer: bgLayer,
                    config: {
                        title: "Plan IGN v2",
                    },
                },
                {
                    layer: extentLayer,
                    config: {
                        title: "Emprise",
                    },
                },
            ],
            options: {
                position: "top-right",
                collapsed: true,
                panel: true,
                counter: true,
            },
        });

        const catalog = new Catalog({
            collapsed: true,
            draggable: false,
            titlePrimary: "",
            titleSecondary: "Gérer vos couches de données",
            layerLabel: "title",
            layerFilter: [],
            search: {
                display: true,
                criteria: ["name", "title", "description"],
            },
            addToMap: true,
            categories: [
                {
                    title: "Données",
                    id: "data",
                    default: true,
                    filter: null,
                    // sous categories
                    // items : [
                    //     {
                    //         title : "",
                    //         default : true,
                    //         filter : {
                    //             field : "",
                    //             value : ""
                    //         }
                    //     }
                    // ]
                },
            ],
            configuration: {
                type: "json", // type:"service"
                urls: [
                    // data:{}
                    "https://raw.githubusercontent.com/IGNF/cartes.gouv.fr-entree-carto/main/public/data/layers.json",
                    "https://raw.githubusercontent.com/IGNF/cartes.gouv.fr-entree-carto/main/public/data/edito.json",
                ],
            },
            position: "top-left",
        });

        const controls = [
            layerSwitcher,
            new SearchEngine({
                collapsed: true,
                displayAdvancedSearch: false,
                apiKey: "essentiels",
                zoomTo: "auto",
            }),
            new ScaleLine(),
            new GeoportalZoom({ position: "top-left" }),
            new GeoportalFullScreen({ position: "bottom-right" }),
            catalog,
        ];

        mapRef.current = new Map({
            target: mapTargetRef.current as HTMLElement,
            layers: [bgLayer, extentLayer],
            interactions: defaultInteractions(),
            controls: controls,
            view: new View({
                projection: olDefaults.projection,
                center: fromLonLat(olDefaults.center),
                zoom: olDefaults.zoom,
            }),
        });
        const extentLayerSource = extentLayer.getSource();
        if (extentLayerSource) {
            mapRef.current.getView().fit(extentLayerSource.getExtent());
        }

        return () => mapRef.current?.setTarget(undefined);
    }, [bgLayer, extentLayer]);

    return (
        <div className={fr.cx("fr-grid-row")}>
            <div className={cx(fr.cx("fr-col"), "map-view")} ref={mapTargetRef}></div>
        </div>
    );
}
