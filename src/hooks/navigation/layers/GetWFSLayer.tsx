import { useEffect, useMemo } from "react";
import { CommunityGeoservice, CommunityLayer, useCommunityStore } from "@/store/useCommunityStore";
import useGetFeaturesWFS from "../capabilities/useGetFeaturesWFS";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { transformExtent } from "ol/proj";

const GetWFSLayer: React.FC<CommunityLayer> = (layer: CommunityLayer) => {
    const geoservice = layer.geoservice;
    const { addMapLayers, mapLayers } = useCommunityStore();
    const wfsLayerSource = useGetWFSLayer(geoservice);

    useEffect(() => {
        wfsLayerSource?.setOpacity(layer.opacity);
        wfsLayerSource?.setVisible(layer.visibility);
        if (wfsLayerSource) {
            const wfsLayer = { source: wfsLayerSource, title: geoservice.title, order: layer.order };
            addMapLayers(wfsLayer);
        }
    }, [wfsLayerSource, geoservice, layer, mapLayers, addMapLayers]);

    return null;
};

function useGetWFSLayer(geoservice: CommunityGeoservice) {
    const { data: featuresData } = useGetFeaturesWFS(geoservice);

    const wfsLayer = useMemo(() => {
        const features = featuresData?.data;
        if (!features) return;

        const wfsLayer = new VectorLayer<VectorSource<Feature<Geometry>>>({
            source: undefined,
            visible: false,
            properties: {
                loading: true,
            },
        });

        if (features) {
            const wfsSource = new VectorSource<Feature<Geometry>>({
                features: features,
            });
            wfsLayer.setSource(wfsSource);
            wfsLayer.set("loading", false);
        }

        wfsLayer.set("title", geoservice.title);
        wfsLayer.set("description", geoservice.description);
        wfsLayer.setMinZoom(geoservice.minZoom);
        wfsLayer.setMaxZoom(geoservice.maxZoom);
        const extent = geoservice.extent.split(",")?.map((extent) => parseFloat(extent));
        wfsLayer.setExtent(transformExtent(extent, "EPSG:4326", "EPSG:3857"));
        return wfsLayer;
    }, [featuresData, geoservice]);

    return wfsLayer;
}

export default GetWFSLayer;
