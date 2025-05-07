import { useEffect } from "react";
import { useCommunityStore } from "@/store/useCommunityStore";
import useGetWFSLayer from "@/hooks/navigation/layers/useGetWFSLayer";
import { CommunityLayer } from "@/constants/communities/types";
import { LocalLayer } from "@/constants/localStorage/types";

interface Props {
    layer: CommunityLayer;
    localLayer: LocalLayer | undefined;
}

const GetWFSLayer: React.FC<Props> = ({ layer, localLayer }) => {
    const geoservice = layer?.geoservice;
    const { addMapLayer, mapLayers } = useCommunityStore();
    const wfsLayerSource = useGetWFSLayer(geoservice);

    useEffect(() => {
        wfsLayerSource?.setOpacity(localLayer ? localLayer.opacity : layer.opacity);
        wfsLayerSource?.setVisible(localLayer ? localLayer.visibility : layer.visibility);
        wfsLayerSource?.set("type", layer.type);
        if (wfsLayerSource) {
            const wfsLayer = { source: wfsLayerSource, title: geoservice.title, order: localLayer ? localLayer.order : layer.order };
            addMapLayer(wfsLayer);
        }
    }, [wfsLayerSource, geoservice, layer, mapLayers, localLayer, addMapLayer]);

    return null;
};

export default GetWFSLayer;
