import { useEffect, useMemo } from "react";
import { useCommunityStore } from "@/store/useCommunityStore";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { transformExtent } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import { tile as tileStrategy } from "ol/loadingstrategy";
import { CommunityGeoservice, StatusMessage } from "@/constants/communities/types";
import { useQueryClient } from "@tanstack/react-query";
import { useMapStore } from "@/store";
import { declareComponentKeys, useTranslation } from "@/i18n";
import { changeFeatureTypeStyle, featureExists, getGeoserviceFeatureTypeGeometries } from "@/constants/utils";
import { createXYZ } from "ol/tilegrid";

function useGetWFSLayer(geoservice: CommunityGeoservice) {
    const { addAlertMessage } = useCommunityStore();
    const { map, featureTypeSelectedStyle } = useMapStore();

    const queryClient = useQueryClient();

    const { t } = useTranslation({ useGetWFSLayer });

    const wfsSource = useMemo(() => {
        const wfsSource = new VectorSource<Feature<Geometry>>({
            loader: async function (extent) {
                const url =
                    `${geoservice.url}${geoservice.url.includes("?") ? "" : "?"}service=WFS` +
                    (geoservice.version ? `&version=${geoservice.version}` : "") +
                    `&request=GetFeature` +
                    `&typename=${geoservice.layer}` +
                    `&outputFormat=application/json` +
                    `&srsname=EPSG:3857` +
                    `&maxFeatures=5000` +
                    `&bbox=${extent.join(",")},EPSG:3857`;

                const queryKey = [`GET_WFS_GET_FEATURES_${geoservice.url}_${geoservice.version}_${geoservice.layer}_${extent.join(",")}`];

                try {
                    let data = queryClient.getQueryData([queryKey]);
                    if (!data) {
                        data = await queryClient.fetchQuery({
                            queryKey: queryKey,
                            queryFn: () => fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } }).then((response) => response.json()),
                        });
                    }
                    let features: Feature[];
                    if (Array.isArray(data)) {
                        features = getGeoserviceFeatureTypeGeometries(data, geoservice);
                    } else {
                        features = new GeoJSON().readFeatures(data, {
                            dataProjection: "EPSG:3857",
                            featureProjection: "EPSG:3857",
                        });
                    }

                    features.forEach((feat) => {
                        if (!featureExists(feat, wfsSource)) wfsSource.addFeature(feat);
                    });
                } catch (error) {
                    console.error(error);
                    addAlertMessage(StatusMessage.error, t("loading_layer_error", { layerTitle: geoservice.title }));
                }
            },
            strategy: tileStrategy(createXYZ({ tileSize: 512, minZoom: geoservice.tileZoom, maxZoom: geoservice.maxZoom })),
        });

        return wfsSource;
    }, [geoservice, queryClient, addAlertMessage, t]);

    const wfsLayer = useMemo(
        () =>
            new VectorLayer<VectorSource<Feature<Geometry>>>({
                source: wfsSource,
            }),
        [wfsSource]
    );

    useEffect(() => {
        const layerStyle = featureTypeSelectedStyle.find((type) => type.layer === geoservice.layer);

        if (layerStyle) changeFeatureTypeStyle(wfsSource.getFeatures(), layerStyle?.selectedStyle);
    }, [featureTypeSelectedStyle, geoservice, wfsSource]);

    useEffect(() => {
        wfsLayer.set("title", geoservice.title);

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
