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

function useGetWFSLayer(geoservice: CommunityGeoservice) {
    const { addAlertMessage } = useCommunityStore();
    const wfsLayer = useMemo(() => {
        const wfsSource = new VectorSource<Feature<Geometry>>({
            loader: function (extent) {
                const url =
                    `${geoservice.url}${geoservice.url.includes("?") ? "" : "?"}service=WFS` +
                    `&version=${geoservice.version}` +
                    `&request=GetFeature` +
                    `&typename=${geoservice.layer}` +
                    `&outputFormat=application/json` +
                    `&srsname=EPSG:3857` +
                    `&bbox=${extent.join(",")},EPSG:3857`;

                fetch(url)
                    .then((response) => response.json())
                    .then((data) => {
                        const features = new GeoJSON().readFeatures(data, {
                            dataProjection: "EPSG:3857",
                            featureProjection: "EPSG:3857",
                        });
                        wfsSource.addFeatures(features);
                    })
                    .catch(() => {
                        addAlertMessage(StatusMessage.error, `Erreur dans le chargement de la couche ${geoservice.title}`);
                    });
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
        const extent = geoservice.extent.split(",")?.map((extent) => parseFloat(extent));
        wfsLayer.setExtent(transformExtent(extent, "EPSG:4326", "EPSG:3857"));
        return wfsLayer;
    }, [geoservice, addAlertMessage]);

    return wfsLayer;
}

export default useGetWFSLayer;
