import { useEffect } from "react";
import { useCommunityStore } from "@/store/useCommunityStore";
import useGetWMSLayer from "@/hooks/navigation/layers/useGetWMSLayer";
import { CommunityLayer } from "@/constants/communities/types";
import { LocalLayer } from "@/constants/localStorage/types";

interface Props {
    layer: CommunityLayer;
    localLayer: LocalLayer | undefined;
}

const GetWMSLayer: React.FC<Props> = ({ layer, localLayer }) => {
    const geoservice = layer.geoservice;
    const { addMapLayer, mapLayers } = useCommunityStore();
    const wmsLayerSource = useGetWMSLayer(geoservice);
    useEffect(() => {
        wmsLayerSource?.setOpacity(localLayer ? localLayer.opacity : layer.opacity);
        wmsLayerSource?.setVisible(localLayer ? localLayer.visibility : layer.visibility);
        wmsLayerSource?.set("type", layer.type);
        if (wmsLayerSource) {
            const wmsLayer = { source: wmsLayerSource, title: geoservice.title, order: localLayer ? localLayer.order : layer.order };
            addMapLayer(wmsLayer);
        }
    }, [wmsLayerSource, geoservice, layer, mapLayers, localLayer, addMapLayer]);

    return null;
};

export default GetWMSLayer;
