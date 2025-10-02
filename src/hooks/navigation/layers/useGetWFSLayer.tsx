import { useCallback, useEffect, useMemo } from "react";
import { useCommunityStore } from "@/store/useCommunityStore";
import VectorSource from "ol/source/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import { Feature } from "ol";
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

const TILE_SIZE = 256;

function useGetWFSLayer(geoservice: CommunityGeoservice) {
    const { addAlertMessage } = useCommunityStore();
    const { map, featureTypeSelectedStyle } = useMapStore();

    const queryClient = useQueryClient();

    const { t } = useTranslation({ useGetWFSLayer });

    const mapProjCode = useMemo(() => map?.getView()?.getProjection().getCode() ?? "EPSG:3857", [map]);
    const geoProjCode = useMemo(() => geoservice.columns?.find((c) => c.name === geoservice.geometryName)?.crs ?? "EPSG:3857", [geoservice]);
    const filterDetruit = useMemo(() => geoservice.columns?.find((c) => c.name === "detruit"), [geoservice]);

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
        async function (extent: Extent, wfsSource: VectorSource) {
            try {
                const transformedExtent = transformExtent(extent, mapProjCode, geoProjCode);
                const url =
                    `${geoservice.url}${geoservice.url.includes("?") ? "" : "?"}service=WFS` +
                    (geoservice.version ? `&version=${geoservice.version || "1.1.0"}` : "") +
                    `&request=GetFeature` +
                    `&typename=${geoservice.layer}` +
                    `&outputFormat=${geoservice.featureType ? "GeoJSON" : "application/json"}` + //
                    `&srsname=${geoProjCode}` +
                    `&maxFeatures=5000` +
                    (filterDetruit ? `&filter={"detruit":false}` : "") +
                    `&bbox=${transformedExtent.join(",")},${geoProjCode}`;

                const queryKey = [`GET_WFS_GET_FEATURES_${geoservice.url}_${geoservice.version}_${geoservice.layer}_${transformedExtent.join(",")}`];

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
            } catch {
                addAlertMessage(StatusMessage.error, t("loading_layer_error", { layerTitle: geoservice.title }));
            }
        },
        [addAlertMessage, addFeaturesToSource, filterDetruit, geoProjCode, geoservice, mapProjCode, queryClient, t]
    );

    const wfsSource = useMemo(() => {
        const wfsSource = new VectorSource<Feature<Geometry>>({
            format: new GeoJSON(),
            loader: (extent) => wfsLoader(extent, wfsSource),
            strategy: tileStrategy(createXYZ({ tileSize: TILE_SIZE, minZoom: geoservice.tileZoom, maxZoom: geoservice.maxZoom })),
        });

        return wfsSource;
    }, [geoservice, wfsLoader]);

    const wfsLayer = useMemo(() => {
        return new WebGLVectorLayer<VectorSource<Feature<Geometry>>>({
            source: wfsSource,
            style: getWebGLStyle(geoservice),
        });
    }, [wfsSource, geoservice]);

    useEffect(() => {
        wfsLayer.setStyle(getWebGLStyle(geoservice, featureTypeSelectedStyle));
        wfsLayer.changed();
    }, [wfsLayer, featureTypeSelectedStyle, geoservice]);

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
        wfsLayer.setExtent(transformExtent(extent, "EPSG:4326", mapProjCode));
    }
    return wfsLayer;
}

const { i18n } = declareComponentKeys<"loading_report_layer_error" | { K: "loading_layer_error"; P: { layerTitle: string }; R: string }>()(
    "useGetReportsLayer"
);
export type I18n = typeof i18n;

export default useGetWFSLayer;
