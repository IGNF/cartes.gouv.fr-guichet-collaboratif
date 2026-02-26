import { useCallback, useEffect, useMemo } from "react";
import { useCommunityStore } from "@/store/useCommunityStore";
import VectorSource, { VectorSourceEvent } from "ol/source/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import { Collection, Feature } from "ol";
import { Geometry } from "ol/geom";
import GeoJSON from "ol/format/GeoJSON";
import { bbox as bboxStrategy } from "ol/loadingstrategy";
import { ArrayGeoJSONProps, CommunityGeoservice, GeoJSONProps, StatusMessage } from "@/constants/communities/types";
import { useQueryClient } from "@tanstack/react-query";
import { useMapStore } from "@/store";
import { declareComponentKeys, useTranslation } from "@/i18n";

import { transformExtent } from "ol/proj";
import { Extent } from "ol/extent";
import { arrayToGeoJSON, getGeoJSONProps } from "@/constants/communities/utils";
import { getTrafficFlowStyles, getWebGLStyle } from "@/constants/styles";
import { FEATURE_TYPE_SELECTED_PROPERTY, LAYER_FEATURE_TYPE, LAYER_SWITCHER_INFO_DIV, TILE_MAX_FEATURES } from "@/constants";
import VectorLayer from "ol/layer/Vector";
import { Stroke, Style } from "ol/style";
import Text from "ol/style/Text";
import { LayerGroupSource } from "@/classes/LayerGroupSource";
import { ObjectEvent } from "ol/Object";

function useGetWFSLayer(geoservice: CommunityGeoservice) {
    const { addAlertMessage } = useCommunityStore();
    const { map, featureTypeSelectedStyle, setFeatureTypeSelectedStyle } = useMapStore();

    const queryClient = useQueryClient();

    const { t } = useTranslation({ useGetWFSLayer });

    const mapProjCode = useMemo(() => map?.getView()?.getProjection().getCode() ?? "EPSG:3857", [map]);
    const geoProjCode = useMemo(() => geoservice.columns?.find((c) => c.name === geoservice.geometryName)?.crs ?? "EPSG:3857", [geoservice]);
    const filterDetruit = useMemo(() => (geoservice.columns?.find((c) => c.name === "detruit") ? '"detruit":false' : ""), [geoservice]);
    const filterFictif = useMemo(() => (geoservice.columns?.find((c) => c.name === "fictif") ? '"fictif":false' : ""), [geoservice]);

    const urlsFilters = useMemo(() => {
        const filters = [filterDetruit, filterFictif].filter((f) => !!f);

        if (filters.length) {
            return `&filter={${filters.join(",")}}`;
        }
        return "";
    }, [filterDetruit, filterFictif]);

    const selectedStyle = featureTypeSelectedStyle.find((style) => style.layer === geoservice.layer);

    const addFeaturesToSource = useCallback(
        (wfsSource: VectorSource, data: GeoJSONProps | ArrayGeoJSONProps[]) => {
            let newData;
            if (Array.isArray(data)) {
                newData = arrayToGeoJSON(data, geoservice);
            } else {
                newData = getGeoJSONProps(data, geoservice);
            }

            const features = new GeoJSON().readFeatures(newData, {
                dataProjection: geoProjCode,
                featureProjection: mapProjCode,
            });

            wfsSource.addFeatures(features);
        },
        [geoProjCode, mapProjCode, geoservice]
    );

    const wfsLoader = useCallback(
        async function (extent: Extent, wfsSource: VectorSource, page: number = 0) {
            try {
                const transformedExtent = transformExtent(extent, mapProjCode, geoProjCode);
                const isWFS2 = geoservice.version && String(geoservice.version).startsWith("2");
                const isWFS1 = geoservice.version && String(geoservice.version).startsWith("1.0");
                const url =
                    `${geoservice.url}${geoservice.url.includes("?") ? "" : "?"}SERVICE=WFS` +
                    (geoservice.version ? `&VERSION=${geoservice.version || "1.1.0"}` : "") +
                    `&REQUEST=GetFeature` +
                    (isWFS2 ? `&TYPENAMES=${geoservice.layer}` : `&typename=${geoservice.layer}`) +
                    `&outputFormat=${"application/json"}` +
                    `&SRSNAME=${geoProjCode}` +
                    (isWFS2
                        ? `&COUNT=${TILE_MAX_FEATURES}&STARTINDEX=${page * TILE_MAX_FEATURES}`
                        : `&maxFeatures=${TILE_MAX_FEATURES}${isWFS1 ? "" : `&offset=${page * TILE_MAX_FEATURES}`}`) +
                    urlsFilters +
                    `&bbox=${transformedExtent.join(",")},${geoProjCode}`;

                const queryKey = [`GET_WFS_GET_FEATURES_${geoservice.url}_${geoservice.version}_${geoservice.layer}_${transformedExtent.join(",")}_${page}`];
                const data: GeoJSONProps | ArrayGeoJSONProps[] = await queryClient.fetchQuery({
                    queryKey: queryKey,
                    queryFn: async () => {
                        return await fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
                            .then((response) => response.json())

                            .catch(() => {
                                throw Error;
                            });
                    },
                    retry: 1,
                });

                addFeaturesToSource(wfsSource, data);
                if (Array.isArray(data)) {
                    if (data.length === TILE_MAX_FEATURES) await wfsLoader(extent, wfsSource, page + 1);
                } else {
                    if (data.features.length === TILE_MAX_FEATURES) await wfsLoader(extent, wfsSource, page + 1);
                }
            } catch {
                addAlertMessage(StatusMessage.error, t("loading_layer_error", { layerTitle: geoservice.title }), 3000);
            }
        },
        [addAlertMessage, addFeaturesToSource, urlsFilters, geoProjCode, geoservice, mapProjCode, queryClient, t]
    );

    const wfsSource = useMemo(
        () =>
            new VectorSource<Feature<Geometry>>({
                format: new GeoJSON(),
                loader: (extent) => wfsLoader(extent, wfsSource),
                strategy: bboxStrategy,
            }),
        [wfsLoader]
    );

    const wfsSourceLabels = useMemo(() => new VectorSource<Feature<Geometry>>(), []);

    const wfsLayer = useMemo(() => {
        return new WebGLVectorLayer<VectorSource<Feature<Geometry>>>({
            source: wfsSource,
            style: getWebGLStyle(geoservice),
            properties: {
                name: geoservice.layer,
                title: geoservice.title,
                description: LAYER_SWITCHER_INFO_DIV,
            },
            disableHitDetection: false,
        });
    }, [wfsSource, geoservice]);

    const wfsLayerLabels = useMemo(() => {
        const wfsLayerLabels = new VectorLayer<VectorSource<Feature<Geometry>>>({
            source: wfsSourceLabels,
            properties: {
                title: `${geoservice.title} labels`,
                description: LAYER_SWITCHER_INFO_DIV,
            },
        });

        return wfsLayerLabels;
    }, [geoservice, wfsSourceLabels]);

    const layerGroup = useMemo(() => {
        return new LayerGroupSource({
            layers: [wfsLayer, wfsLayerLabels],
            properties: { title: geoservice.title, type: LAYER_FEATURE_TYPE, description: LAYER_SWITCHER_INFO_DIV, source: wfsLayer.getSource() },
        });
    }, [wfsLayer, wfsLayerLabels, geoservice]);

    const changeFeatureProperty = useCallback((e: ObjectEvent, original: Feature, clone: Feature) => {
        const value = original.get(e.key);
        if (value) {
            clone.set(e.key, value);
        } else {
            clone.unset(e.key);
        }
    }, []);

    const addFeaturesToLabels = useCallback(
        (e: VectorSourceEvent) => {
            const feature = e.feature;
            if (!feature) return;
            const fCloned = feature.clone();
            feature.on("propertychange", (e) => changeFeatureProperty(e, feature, fCloned));
            fCloned.on("propertychange", (e) => changeFeatureProperty(e, fCloned, feature));
            wfsSourceLabels.addFeature(fCloned);
        },
        [wfsSourceLabels, changeFeatureProperty]
    );

    useEffect(() => {
        wfsSource.on("addfeature", addFeaturesToLabels);

        return () => {
            wfsSource.un("addfeature", addFeaturesToLabels);
        };
    }, [wfsSource, addFeaturesToLabels]);

    useEffect(() => {
        if (!geoservice.featureType) return;
        const typeLabelStyle = selectedStyle?.selectedStyle?.types![0];
        if (typeLabelStyle?.labelMinZoom) wfsLayerLabels.setMinZoom(typeLabelStyle.labelMinZoom);

        wfsLayer.setStyle(getWebGLStyle(geoservice, featureTypeSelectedStyle));
        wfsLayerLabels.setStyle((ft, resolution) => {
            if (ft.get(FEATURE_TYPE_SELECTED_PROPERTY)) return;

            const styles: Style[] = [];
            if (typeLabelStyle?.label) {
                const text = ft.get(typeLabelStyle.label.replace(/\${|}/g, "") as string);
                if (text && text !== "null") {
                    styles.push(
                        new Style({
                            text: new Text({
                                text: text,
                                font: `${typeLabelStyle?.fontWeight} ${typeLabelStyle?.fontSize}px ${typeLabelStyle?.fontFamily}`,
                                offsetX: typeLabelStyle?.labelXOffset,
                                offsetY: typeLabelStyle?.labelYOffset,
                                stroke: new Stroke({
                                    color: "#fff",
                                    width: 2,
                                }),
                            }),
                        })
                    );
                }
            }

            if (typeLabelStyle?.directionField) {
                styles.push(...getTrafficFlowStyles(ft, typeLabelStyle.directionField, resolution));
            }

            return styles.length > 0 ? styles : undefined;
        });

        if (typeLabelStyle?.label || typeLabelStyle?.directionField) {
            layerGroup.setLayers(new Collection([wfsLayer, wfsLayerLabels]));
        } else {
            layerGroup.setLayers(new Collection([wfsLayer]));
        }
    }, [featureTypeSelectedStyle, map, selectedStyle, selectedStyle?.selectedStyle.name, geoservice, wfsLayer, layerGroup, wfsSource, wfsLayerLabels]);

    useEffect(() => {
        layerGroup.set("title", geoservice.title);
        layerGroup.set("name", geoservice.layer);

        layerGroup.set("description", geoservice.description);
        layerGroup.setMinZoom(geoservice.minZoom);
        layerGroup.setMaxZoom(geoservice.maxZoom);
        if (map) {
            const mapView = map.getView();
            const minResolution = mapView?.getResolutionForZoom(geoservice.maxZoom);
            const maxResolution = mapView?.getResolutionForZoom(geoservice.minZoom);
            layerGroup.setMinResolution(minResolution);
            layerGroup.setMaxResolution(maxResolution);
        }
    }, [map, geoservice, layerGroup, wfsLayer, wfsLayerLabels]);

    useEffect(() => {
        if (!geoservice.featureType) return;
        const currentLayerStyle = featureTypeSelectedStyle.find((style) => style.layer === geoservice.layer);
        if (!currentLayerStyle) {
            setFeatureTypeSelectedStyle({ layer: geoservice.layer, selectedStyle: geoservice.styles![0] });
        }
    });

    if (geoservice.extent) {
        const extent = geoservice.extent.split(",")?.map((extent) => parseFloat(extent));
        wfsLayer.setExtent(transformExtent(extent, "EPSG:4326", mapProjCode));
    }

    return layerGroup;
}

const { i18n } = declareComponentKeys<"loading_report_layer_error" | { K: "loading_layer_error"; P: { layerTitle: string }; R: string }>()(
    "useGetReportsLayer"
);
export type I18n = typeof i18n;

export default useGetWFSLayer;
