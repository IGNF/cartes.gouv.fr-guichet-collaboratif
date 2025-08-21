import { useMemo } from "react";
import { useCommunityStore } from "@/store/useCommunityStore";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { transformExtent } from "ol/proj";
import GeoJSON from "ol/format/GeoJSON";
import { bbox as bboxStrategy } from "ol/loadingstrategy";
import { CommunityGeoservice, StatusMessage } from "@/constants/communities/types";
import { useQueryClient } from "@tanstack/react-query";
import { useMapStore } from "@/store";
import { declareComponentKeys, useTranslation } from "@/i18n";

function useGetWFSLayer(geoservice: CommunityGeoservice) {
    const { addAlertMessage } = useCommunityStore();
    const { map } = useMapStore();

    const queryClient = useQueryClient();

    const { t } = useTranslation({ useGetWFSLayer });

    const wfsLayer = useMemo(() => {
        const wfsSource = new VectorSource<Feature<Geometry>>({
            loader: async function (extent) {
                const url =
                    `${geoservice.url}${geoservice.url.includes("?") ? "" : "?"}service=WFS` +
                    `&version=${geoservice.version}` +
                    `&request=GetFeature` +
                    `&typename=${geoservice.layer}` +
                    `&outputFormat=application/json` +
                    `&srsname=EPSG:3857` +
                    `&bbox=${extent.join(",")},EPSG:3857`;

                const queryKey = `GET_WFS_GET_FEATURES_${geoservice.url}_${geoservice.version}_${geoservice.layer}_${extent.join(",")}`;

                try {
                    const data = await queryClient.fetchQuery({
                        queryKey: [queryKey],
                        queryFn: () => fetch(url).then((response) => response.json()),
                    });
                    const features = new GeoJSON().readFeatures(data, {
                        dataProjection: "EPSG:3857",
                        featureProjection: "EPSG:3857",
                    });
                    wfsSource.addFeatures(features);
                } catch (error) {
                    console.error(error);
                    addAlertMessage(StatusMessage.error, t("loading_layer_error", { layerTitle: geoservice.title }));
                }
            },
            strategy: bboxStrategy,
        });

        const wfsLayer = new VectorLayer<VectorSource<Feature<Geometry>>>({
            source: wfsSource,
        });

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
        const extent = geoservice.extent.split(",")?.map((extent) => parseFloat(extent));
        wfsLayer.setExtent(transformExtent(extent, "EPSG:4326", "EPSG:3857"));
        return wfsLayer;
    }, [geoservice, queryClient, map, addAlertMessage, t]);

    return wfsLayer;
}

const { i18n } = declareComponentKeys<"loading_report_layer_error" | { K: "loading_layer_error"; P: { layerTitle: string }; R: string }>()(
    "useGetReportsLayer"
);
export type I18n = typeof i18n;

export default useGetWFSLayer;
