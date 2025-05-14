import { useEffect } from "react";
import { useCommunityStore } from "@/store/useCommunityStore";
import { useLocalStorageStore } from "@/store/useLocalStorageStore";
import useGetWMTSLayer from "@/hooks/navigation/layers/useGetWMTSLayer";
import { CommunityLayer } from "@/constants/communities/types";
import { LocalLayer } from "@/constants/localStorage/types";

interface Props {
    layer: CommunityLayer;
}

const GetWMTSLayer: React.FC<Props> = ({ layer }) => {
    const { addMapLayer, mapLayers } = useCommunityStore();
    const { localStorageData } = useLocalStorageStore();
    const geoservice = layer.geoservice;
    const localLayer: LocalLayer | undefined = localStorageData?.layers.find((l) => l.name === geoservice.title);

    const wmtsLayerSource = useGetWMTSLayer(geoservice);

    useEffect(() => {
        wmtsLayerSource?.setOpacity(localLayer ? localLayer.opacity : layer.opacity);
        wmtsLayerSource?.setVisible(localLayer ? localLayer.visibility : layer.visibility);
        wmtsLayerSource?.set("type", layer.type);
        if (wmtsLayerSource) {
            const wmtsLayer = { source: wmtsLayerSource, title: geoservice.title, order: localLayer ? localLayer.order : layer.order };
            addMapLayer(wmtsLayer);
        }
    }, [wmtsLayerSource, geoservice, layer, mapLayers, localLayer, addMapLayer]);

    return null;
};

export default GetWMTSLayer;
