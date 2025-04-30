import TileLayer from "ol/layer/Tile";
import { TileWMS } from "ol/source";
import { useEffect, useMemo } from "react";
import { CommunityGeoservice, CommunityLayer, useCommunityStore } from "@/store/useCommunityStore";
import useGetCapabilitiesWMS from "../capabilities/useGetCapabilitiesWMS";
import { transformExtent } from "ol/proj";

type CapabilityLayer = {
    Name: string;
};

const GetWMSLayer: React.FC<CommunityLayer> = (layer: CommunityLayer) => {
    const geoservice = layer.geoservice;
    const { addMapLayers, mapLayers } = useCommunityStore();
    const wmsLayerSource = useGetWMSLayer(geoservice);
    useEffect(() => {
        wmsLayerSource?.setOpacity(layer.opacity);
        wmsLayerSource?.setVisible(layer.visibility);
        if (wmsLayerSource) {
            const wmsLayer = { source: wmsLayerSource, title: geoservice.title, order: layer.order };
            addMapLayers(wmsLayer);
        }
    }, [wmsLayerSource, geoservice, layer, mapLayers, addMapLayers]);

    return null;
};

function useGetWMSLayer(geoservice: CommunityGeoservice) {
    const { data: capabilities } = useGetCapabilitiesWMS(geoservice);

    const wmsLayer = useMemo(() => {
        if (!capabilities) return;
        const wmsLayer: TileLayer = new TileLayer({
            source: undefined,
            visible: false,
            properties: {
                loading: true,
            },
        });
        if (capabilities) {
            let wmsLayerOption = capabilities.Capability.Layer;
            if (wmsLayerOption && wmsLayerOption.Name !== geoservice.layer) {
                wmsLayerOption = capabilities.Capability.Layer.Layer.find((l: CapabilityLayer) => l.Name === geoservice.layer);
            }
            if (wmsLayerOption) {
                const wmsSource = new TileWMS({
                    url: geoservice.url,
                    params: {
                        LAYERS: wmsLayerOption.Name,
                        TILED: true,
                        VERSION: geoservice.version,
                    },
                    serverType: "geoserver",
                });
                wmsSource.setUrl(geoservice.url);
                wmsLayer.setSource(wmsSource);
                wmsLayer.set("loading", false);
            }
        }

        wmsLayer.set("title", geoservice.title);
        wmsLayer.set("description", geoservice.description);
        wmsLayer.setMinZoom(geoservice.minZoom);
        wmsLayer.setMaxZoom(geoservice.maxZoom);
        const extent = geoservice.extent.split(",")?.map((extent) => parseFloat(extent));
        wmsLayer.setExtent(transformExtent(extent, "EPSG:4326", "EPSG:3857"));
        return wmsLayer;
    }, [capabilities, geoservice]);

    return wmsLayer;
}

export default GetWMSLayer;
