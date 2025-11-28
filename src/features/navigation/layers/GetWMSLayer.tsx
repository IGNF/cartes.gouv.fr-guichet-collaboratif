import { useEffect } from "react";
import { useCommunityStore } from "@/store/useCommunityStore";
import { useLocalStorageStore } from "@/store/useLocalStorageStore";
import useGetWMSLayer from "@/hooks/navigation/layers/useGetWMSLayer";
import { CommunityLayer } from "@/constants/communities/types";
import { LocalLayer } from "@/constants/localStorage/types";

interface Props {
    layer: CommunityLayer;
}

const GetWMSLayer: React.FC<Props> = ({ layer }) => {
    const { addMapLayer, mapLayers } = useCommunityStore();
    const { localStorageData } = useLocalStorageStore();
    const geoservice = layer.geoservice;
    const localLayer: LocalLayer | undefined = localStorageData?.layers.find((l) => l.name === geoservice.title);
    const wmsLayerSource = useGetWMSLayer(geoservice);
    useEffect(() => {
        wmsLayerSource?.setOpacity(localLayer ? localLayer.opacity : layer.opacity);
        wmsLayerSource?.setVisible(localLayer ? localLayer.visibility : layer.visibility);
        wmsLayerSource?.set("type", layer.type);
        if (wmsLayerSource) {
            const wmsLayer = { source: wmsLayerSource, name: geoservice.layer, title: geoservice.title, order: localLayer ? localLayer.order : layer.order };
            addMapLayer(wmsLayer);
        }
    }, [wmsLayerSource, geoservice, layer, mapLayers, localLayer, addMapLayer]);

    return null;
};

export default GetWMSLayer;
