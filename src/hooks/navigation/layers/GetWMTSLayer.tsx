import TileLayer from "ol/layer/Tile";
import { WMTS } from "ol/source";
import { useEffect, useMemo } from "react";
import { optionsFromCapabilities } from "ol/source/WMTS";
import useGetCapabilitiesWMTS from "@/hooks/navigation/capabilities/useGetCapabilitiesWMTS";
import { CommunityGeoservice, CommunityLayer, useCommunityStore } from "@/store/useCommunityStore";
import { transformExtent } from "ol/proj";

const GetWMTSLayer: React.FC<CommunityLayer> = (layer) => {
    const geoservice = layer.geoservice;
    const { addMapLayers, mapLayers } = useCommunityStore();
    const wmtsLayerSource = useGetWMTSLayer(geoservice);

    useEffect(() => {
        wmtsLayerSource?.setOpacity(layer.opacity);
        wmtsLayerSource?.setVisible(layer.visibility);
        if (wmtsLayerSource) {
            const wmtsLayer = { source: wmtsLayerSource, title: geoservice.title, order: layer.order };
            addMapLayers(wmtsLayer);
        }
    }, [wmtsLayerSource, geoservice, layer, mapLayers, addMapLayers]);

    return null;
};

function useGetWMTSLayer(geoservice: CommunityGeoservice) {
    const { data: capabilities } = useGetCapabilitiesWMTS(geoservice);

    const wmtsLayer = useMemo(() => {
        if (!capabilities) return;
        const wmtsLayer: TileLayer = new TileLayer({
            source: undefined,
            visible: false,
            properties: {
                loading: true,
            },
        });
        if (capabilities) {
            const wmtsOptions = optionsFromCapabilities(capabilities, {
                layer: geoservice.layer,
            });

            if (wmtsOptions) {
                const wmtsSource = new WMTS(wmtsOptions);
                wmtsSource.setUrl(geoservice.url);
                wmtsLayer.setSource(wmtsSource);
                wmtsLayer.set("loading", false);
            }
        }

        wmtsLayer.set("title", geoservice.title);
        wmtsLayer.set("description", geoservice.description);
        wmtsLayer.setMinZoom(geoservice.minZoom);
        wmtsLayer.setMaxZoom(geoservice.maxZoom);
        const extent = geoservice.extent.split(",")?.map((extent) => parseFloat(extent));
        wmtsLayer.setExtent(transformExtent(extent, "EPSG:4326", "EPSG:3857"));
        return wmtsLayer;
    }, [capabilities, geoservice]);

    return wmtsLayer;
}

export default GetWMTSLayer;
