import { useCommunityStore } from "@/store";
import GetWMTSLayer from "./GetWMTSLayer";
import GetWFSLayer from "./GetWFSLayer";
import GetWMSLayer from "./GetWMSLayer";
import { CommunityLayer } from "@/store/useCommunityStore";

const useGetLayersHook = () => {
    const { communityLayers } = useCommunityStore();

    if (communityLayers) {
        communityLayers.forEach((layer: CommunityLayer) => {
            const geoservice = layer.geoservice;
            switch (geoservice.type) {
                case "WMTS":
                    GetWMTSLayer(layer);
                    break;
                case "WMS":
                    GetWMSLayer(layer);
                    break;
                case "WFS":
                    GetWFSLayer(layer);
                    break;
                default:
                    break;
            }
        });
    }

    return null;
};
export default useGetLayersHook;
