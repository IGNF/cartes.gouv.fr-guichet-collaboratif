import { useCallback, useEffect, useMemo } from "react";
import { useCommunityStore } from "@/store/useCommunityStore";
import VectorSource, { VectorSourceEvent } from "ol/source/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import { Collection, Feature } from "ol";
import { Geometry } from "ol/geom";
import GeoJSON from "ol/format/GeoJSON";
import { tile as tileStrategy } from "ol/loadingstrategy";
import { ArrayGeoJSONProps, CommunityGeoservice, GeoJSONProps, StatusMessage } from "@/constants/communities/types";
import { useQueryClient } from "@tanstack/react-query";
import { useMapStore } from "@/store";
import { declareComponentKeys, useTranslation } from "@/i18n";
import { createXYZ } from "ol/tilegrid";
import { transformExtent } from "ol/proj";
import { Extent } from "ol/extent";
import { arrayToGeoJSON, getGeoJSONProps } from "@/constants/communities/utils";
import { getWebGLStyle } from "@/constants/styles";
import { LAYER_FEATURE_TYPE, LAYER_SWITCHER_INFO_DIV, TILE_MAX_FEATURES, TILE_SIZE } from "@/constants";
import VectorLayer from "ol/layer/Vector";
import { Stroke, Style } from "ol/style";
import Text from "ol/style/Text";
import { LayerGroupSource } from "@/classes/LayerGeoupSource";
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
            let newData = data;
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
                const url =
                    `${geoservice.url}${geoservice.url.includes("?") ? "" : "?"}service=WFS` +
                    (geoservice.version ? `&version=${geoservice.version || "1.1.0"}` : "") +
                    `&request=GetFeature` +
                    `&typename=${geoservice.layer}` +
                    `&outputFormat=${geoservice.featureType ? "GeoJSON" : "application/json"}` + //
                    `&srsname=${geoProjCode}` +
                    `&maxFeatures=${TILE_MAX_FEATURES}` +
                    `&offset=${page * TILE_MAX_FEATURES}` +
                    urlsFilters +
                    `&bbox=${transformedExtent.join(",")},${geoProjCode}`;

                const queryKey = [`GET_WFS_GET_FEATURES_${geoservice.url}_${geoservice.version}_${geoservice.layer}_${transformedExtent.join(",")}_${page}`];

                const data: GeoJSONProps | ArrayGeoJSONProps[] = await queryClient.fetchQuery({
                    queryKey: queryKey,
                    queryFn: async () => {
                        let data: { code: number } | unknown = queryClient.getQueryData(queryKey);
                        if (!data || (typeof data === "object" && "code" in data && data.code !== 200)) {
                            data = await fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
                                .then((response) => response.json())

                                .catch(() => {
                                    throw Error;
                                });
                        }
                        return data;
                    },
                    retry: 1,
                });

                addFeaturesToSource(wfsSource, data);
                if (Array.isArray(data)) {
                    if (data.length === 5000) await wfsLoader(extent, wfsSource, page + 1);
                } else {
                    if (data.features.length === 5000) await wfsLoader(extent, wfsSource, page + 1);
                }
            } catch {
                addAlertMessage(StatusMessage.error, t("loading_layer_error", { layerTitle: geoservice.title }));
            }
        },
        [addAlertMessage, addFeaturesToSource, urlsFilters, geoProjCode, geoservice, mapProjCode, queryClient, t]
    );

    const wfsSource = useMemo(
        () =>
            new VectorSource<Feature<Geometry>>({
                format: new GeoJSON(),
                loader: (extent) => wfsLoader(extent, wfsSource),
                strategy: tileStrategy(createXYZ({ tileSize: TILE_SIZE, minZoom: geoservice.tileZoom, maxZoom: geoservice.maxZoom })),
            }),
        [geoservice, wfsLoader]
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
        const typeLabelStyle = selectedStyle?.selectedStyle?.types![0];
        if (typeLabelStyle?.labelMinZoom) wfsLayerLabels.setMinZoom(typeLabelStyle.labelMinZoom);

        wfsLayer.setStyle(getWebGLStyle(geoservice, featureTypeSelectedStyle));
        wfsLayerLabels.setStyle((ft) => {
            if (ft.get("selected")) return;
            return new Style({
                text: new Text({
                    text: ft.get(typeLabelStyle?.label?.replace(/\${|}/g, "") as string),
                    font: `${typeLabelStyle?.fontWeight} ${typeLabelStyle?.fontSize}px ${typeLabelStyle?.fontFamily}`,
                    offsetX: typeLabelStyle?.labelXOffset,
                    offsetY: typeLabelStyle?.labelYOffset,
                    stroke: new Stroke({
                        color: "#fff",
                        width: 2,
                    }),
                }),
            });
        });

        if (typeLabelStyle?.label) {
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
