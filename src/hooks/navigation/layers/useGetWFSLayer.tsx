import { useCallback, useEffect, useMemo, useState } from "react";
import { useCommunityStore } from "@/store/useCommunityStore";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import GeoJSON from "ol/format/GeoJSON";
import { tile as tileStrategy } from "ol/loadingstrategy";
import { CommunityGeoservice, StatusMessage } from "@/constants/communities/types";
import { useQueryClient } from "@tanstack/react-query";
import { useMapStore } from "@/store";
import { declareComponentKeys, useTranslation } from "@/i18n";
import { addFeaturesInBatches, featureExists, getGeoserviceFeatureTypeGeometries, setFeatureLayerStyle } from "@/constants/utils";
import { createXYZ } from "ol/tilegrid";
import { transformExtent } from "ol/proj";
import { Style } from "ol/style";
import { FeatureLike } from "ol/Feature";
import { Extent } from "ol/extent";
import useDebounce from "@/hooks/useDebounce";

const TILE_SIZE = 512;

function useGetWFSLayer(geoservice: CommunityGeoservice) {
    const { addAlertMessage } = useCommunityStore();
    const { map, featureTypeSelectedStyle } = useMapStore();

    const queryClient = useQueryClient();

    const { t } = useTranslation({ useGetWFSLayer });

    const mapProjCode = useMemo(() => map?.getView()?.getProjection().getCode() ?? "EPSG:3857", [map]);
    const geoProjCode = useMemo(() => geoservice.columns?.find((c) => c.name === geoservice.geometryName)?.crs ?? "EPSG:3857", [geoservice]);
    const filterDetruit = useMemo(() => geoservice.columns?.find((c) => c.name === "detruit"), [geoservice]);

    const [newExtent, setExtent] = useState<Extent>([]);

    const debounced = useDebounce(newExtent, 500);

    const addFeaturesToSource = useCallback(
        (wfsSource: VectorSource, newData: unknown) => {
            let features: Feature[] = [];
            if (Array.isArray(newData)) {
                features = getGeoserviceFeatureTypeGeometries(newData, geoservice, mapProjCode, geoProjCode, wfsSource);
            } else {
                features = new GeoJSON().readFeatures(newData, {
                    dataProjection: geoProjCode,
                    featureProjection: mapProjCode,
                });
            }
            addFeaturesInBatches(
                wfsSource,
                features.filter((f) => !featureExists(f, wfsSource)),
                1000
            );
        },
        [geoProjCode, geoservice, mapProjCode]
    );

    const wfsLoader = useCallback(
        async function (extent: Extent, wfsSource: VectorSource) {
            try {
                const transformedExtent = transformExtent(extent, mapProjCode, geoProjCode);
                const url =
                    `${geoservice.url}${geoservice.url.includes("?") ? "" : "?"}service=WFS` +
                    (geoservice.version ? `&version=${geoservice.version || "1.1.0"}` : "") +
                    `&request=GetFeature` +
                    `&typename=${geoservice.layer}` +
                    `&outputFormat=GeoJSON` +
                    `&srsname=${geoProjCode}` +
                    `&maxFeatures=5000` +
                    (filterDetruit ? `&filter={"detruit":false}` : "") +
                    `&bbox=${transformedExtent.join(",")},${geoProjCode}`;

                const queryKey = [`GET_WFS_GET_FEATURES_${geoservice.url}_${geoservice.version}_${geoservice.layer}_${transformedExtent.join(",")}`];

                queryClient
                    .fetchQuery({
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
                    })
                    .then((data) => {
                        if (data && typeof data === "object" && "code" in data && data.code !== 200) throw Error;

                        addFeaturesToSource(wfsSource, data);
                    });
            } catch {
                addAlertMessage(StatusMessage.error, t("loading_layer_error", { layerTitle: geoservice.title }));
            }
        },
        [addAlertMessage, addFeaturesToSource, filterDetruit, geoProjCode, geoservice, mapProjCode, queryClient, t]
    );

    const wfsSource = useMemo(() => {
        const wfsSource = new VectorSource<Feature<Geometry>>({
            loader: (extent) => setExtent(extent),
            strategy: tileStrategy(createXYZ({ tileSize: TILE_SIZE, minZoom: geoservice.tileZoom, maxZoom: geoservice.maxZoom })),
        });

        return wfsSource;
    }, [geoservice]);

    const wfsLayer = useMemo(
        () =>
            new VectorLayer<VectorSource<Feature<Geometry>>>({
                source: wfsSource,
                style: (feat: FeatureLike) => {
                    if (feat instanceof Feature && geoservice.featureType) {
                        const props = { ...feat.getProperties() };
                        delete props.geometry;
                        if (!feat.get("featureTypeData")) feat.set("featureTypeData", props);
                        feat.set("geoservice", geoservice);
                        setFeatureLayerStyle(feat, geoservice, featureTypeSelectedStyle);
                        return feat.getStyle() as Style;
                    }
                    return undefined;
                },
            }),
        [wfsSource, featureTypeSelectedStyle, geoservice]
    );

    useEffect(() => {
        if (debounced.length && map) {
            const mapView = map.getView();
            const extent = mapView.calculateExtent(map.getSize());
            const resolution = mapView.getResolution();
            const strategy = tileStrategy(createXYZ({ tileSize: TILE_SIZE, minZoom: geoservice.tileZoom, maxZoom: geoservice.maxZoom }));
            if (!resolution) return;
            const extents = strategy(extent, resolution, mapView.getProjection());

            extents.forEach(async (extent: Extent) => wfsLoader(extent, wfsSource));
        }
    }, [debounced, geoservice, map, wfsSource, wfsLoader]);

    useEffect(() => {
        wfsLayer.set("title", geoservice.title);
        wfsLayer.set("name", geoservice.layer);

        wfsLayer.set("description", geoservice.description);
        wfsLayer.setMinZoom(geoservice.minZoom);
        wfsLayer.setMaxZoom(geoservice.maxZoom);
        if (map) {
            const mapView = map.getView();
            const minResolution = mapView?.getResolutionForZoom(geoservice.maxZoom);
            const maxResolution = mapView?.getResolutionForZoom(geoservice.minZoom);
            wfsLayer.setMinResolution(minResolution);
            wfsLayer.setMaxResolution(maxResolution);
        }
    }, [map, geoservice, wfsLayer]);

    if (geoservice.extent) {
        const extent = geoservice.extent.split(",")?.map((extent) => parseFloat(extent));
        wfsLayer.setExtent(transformExtent(extent, mapProjCode, geoProjCode));
    }
    return wfsLayer;
}

const { i18n } = declareComponentKeys<"loading_report_layer_error" | { K: "loading_layer_error"; P: { layerTitle: string }; R: string }>()(
    "useGetReportsLayer"
);
export type I18n = typeof i18n;

export default useGetWFSLayer;
