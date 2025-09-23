import { useEffect } from "react";
import { useCommunityStore } from "@/store/useCommunityStore";
import { useLocalStorageStore } from "@/store/useLocalStorageStore";
import useGetWFSLayer from "@/hooks/navigation/layers/useGetWFSLayer";
import { CommunityLayer } from "@/constants/communities/types";
import { LocalLayer } from "@/constants/localStorage/types";

interface Props {
    layer: CommunityLayer;
}

const GetWFSLayer: React.FC<Props> = ({ layer }) => {
    const { addMapLayer, mapLayers } = useCommunityStore();
    const { localStorageData } = useLocalStorageStore();

    const geoservice = layer.geoservice;
    const localLayer: LocalLayer | undefined = localStorageData?.layers.find((l) => l.name === geoservice.title);

    const wfsLayerSource = useGetWFSLayer(geoservice);

    useEffect(() => {
        wfsLayerSource?.setOpacity(localLayer ? localLayer.opacity : layer.opacity);
        wfsLayerSource?.setVisible(localLayer ? localLayer.visibility : layer.visibility);
        wfsLayerSource?.set("type", layer.type);
        if (layer.type === "feature-type") {
            wfsLayerSource?.set("description", `<div id="feature-type-style"></div>`);
        }
        if (wfsLayerSource) {
            const wfsLayer = { source: wfsLayerSource, name: geoservice.layer, title: geoservice.title, order: localLayer ? localLayer.order : layer.order };
            addMapLayer(wfsLayer);
        }
    }, [wfsLayerSource, geoservice, layer, mapLayers, localLayer, addMapLayer]);

    return null;
};

export default GetWFSLayer;
