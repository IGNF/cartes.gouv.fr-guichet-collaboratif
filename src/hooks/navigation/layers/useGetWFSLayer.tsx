import { useEffect, useMemo, useState } from "react";
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
import { addFeaturesInBatches, extentEquals, featureExists, getGeoserviceFeatureTypeGeometries } from "@/constants/utils";
import { createXYZ } from "ol/tilegrid";
import { transformExtent } from "ol/proj";
import { Extent } from "ol/extent";

type LoadedExtent = { layer: string; extent: Extent };

const loadedExtents: LoadedExtent[] = [];
const urlRequested: string[] = [];

function useGetWFSLayer(geoservice: CommunityGeoservice) {
    const { addAlertMessage } = useCommunityStore();
    const { map, featureTypeSelectedStyle } = useMapStore();
    const [newData, setNewData] = useState<{ code: number } | unknown>(null);

    const queryClient = useQueryClient();

    const { t } = useTranslation({ useGetWFSLayer });

    const mapProjCode = useMemo(() => map?.getView()?.getProjection().getCode() ?? "EPSG:3857", [map]);
    const geoProjCode = useMemo(() => geoservice.columns?.find((c) => c.name === geoservice.geometryName)?.crs ?? "EPSG:3857", [geoservice]);
    const filterDetruit = useMemo(() => geoservice.columns?.find((c) => c.name === "detruit"), [geoservice]);

    const wfsSource = useMemo(() => {
        const wfsSource = new VectorSource<Feature<Geometry>>({
            loader: async function (extent) {
                if (loadedExtents.some((le: LoadedExtent) => le.layer === geoservice.layer && extentEquals(le.extent, extent))) {
                    return;
                }
                loadedExtents.push({ layer: geoservice.layer, extent });
                const transformedExtent = transformExtent(extent, mapProjCode, geoProjCode);
                const url =
                    `${geoservice.url}${geoservice.url.includes("?") ? "" : "?"}service=WFS` +
                    (geoservice.version ? `&version=${geoservice.version || "1.1.0"}` : "") +
                    `&request=GetFeature` +
                    `&typename=${geoservice.layer}` +
                    `&outputFormat=application/json` +
                    `&srsname=${geoProjCode}` +
                    `&maxFeatures=5000` +
                    (filterDetruit ? `&filter={"detruit":false}` : "") +
                    `&bbox=${transformedExtent.join(",")},${geoProjCode}`;

                if (urlRequested.includes(url)) return;
                urlRequested.push(url);

                const queryKey = [`GET_WFS_GET_FEATURES_${geoservice.url}_${geoservice.version}_${geoservice.layer}_${extent.join(",")}`];

                try {
                    let data: { code: number } | unknown = queryClient.getQueryData([queryKey]);
                    if (!data) {
                        data = await queryClient.fetchQuery({
                            queryKey: queryKey,
                            queryFn: () =>
                                fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
                                    .then((response) => response.json())
                                    .catch(() => {
                                        throw Error;
                                    }),
                            retry: 2,
                        });
                    }

                    if (data && typeof data === "object" && "code" in data && (data as { code: number }).code !== 200) throw Error;

                    setNewData(data);
                } catch {
                    addAlertMessage(StatusMessage.error, t("loading_layer_error", { layerTitle: geoservice.title }));
                }
            },
            strategy: tileStrategy(createXYZ({ tileSize: 1024, minZoom: geoservice.tileZoom, maxZoom: geoservice.maxZoom })),
        });
        return wfsSource;
    }, [geoservice, queryClient, mapProjCode, filterDetruit, geoProjCode, addAlertMessage, t]);

    const wfsLayer = useMemo(
        () =>
            new VectorLayer<VectorSource<Feature<Geometry>>>({
                source: wfsSource,
            }),
        [wfsSource]
    );

    useEffect(() => {
        if (!newData) return;
        if (Array.isArray(newData)) {
            const features = newData.map((item) => {
                const feature = getGeoserviceFeatureTypeGeometries(item, geoservice, featureTypeSelectedStyle, mapProjCode, geoProjCode);
                if (feature && !featureExists(feature, wfsSource)) {
                    return feature;
                }
            });
            addFeaturesInBatches(
                wfsSource,
                features.filter((f) => !!f)
            );
        } else {
            const features = new GeoJSON()
                .readFeatures(newData, {
                    dataProjection: geoProjCode,
                    featureProjection: mapProjCode,
                })
                .filter((f) => f && !featureExists(f, wfsSource));
            addFeaturesInBatches(wfsSource, features);
        }
    }, [newData, featureTypeSelectedStyle, geoProjCode, geoservice, mapProjCode, wfsSource]);

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
        wfsLayer.setExtent(transformExtent(extent, "EPSG:4326", "EPSG:3857"));
    }
    return wfsLayer;
}

const { i18n } = declareComponentKeys<"loading_report_layer_error" | { K: "loading_layer_error"; P: { layerTitle: string }; R: string }>()(
    "useGetReportsLayer"
);
export type I18n = typeof i18n;

export default useGetWFSLayer;
