import { useCommunityStore, useLocalStorageStore, useMapStore } from "@/store";
import GetWMTSLayer from "./GetWMTSLayer";
import GetWMSLayer from "./GetWMSLayer";
import GetWFSLayer from "./GetWFSLayer";
import { CommunityLayer } from "@/constants/communities/types";

const GetAllLayers = () => {
    const { communityLayers } = useCommunityStore();
    const { localStorageData } = useLocalStorageStore();
    const { map } = useMapStore();

    if (communityLayers && map) {
        return communityLayers.map((layer: CommunityLayer, index: number) => {
            const geoservice = layer.geoservice;
            const localLayer = localStorageData?.layers.find((l) => l.name === geoservice.title);
            switch (geoservice.type) {
                case "WMTS":
                    return <GetWMTSLayer key={`GetWMTS_${index}`} layer={layer} localLayer={localLayer} />;
                case "WMS":
                    return <GetWMSLayer key={`GetWMS_${index}`} layer={layer} localLayer={localLayer} />;
                case "WFS":
                    return <GetWFSLayer key={`GetWFS_${index}`} layer={layer} localLayer={localLayer} />;
                default:
                    return;
            }
        });
    }
    return null;
};

export default GetAllLayers;
