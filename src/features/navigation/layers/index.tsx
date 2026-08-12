import { useCommunityStore, useMapStore } from "@/store";
import GetWMTSLayer from "./GetWMTSLayer";
import GetWMSLayer from "./GetWMSLayer";
import GetWFSLayer from "./GetWFSLayer";
import { CommunityLayer } from "@/constants/communities/types";
import GetReportsLayer from "./GetReportsLayer";

const GetAllLayers = () => {
    const { communityLayers } = useCommunityStore();

    const { map } = useMapStore();
    if (!communityLayers || !map) return null;

    return (
        <>
            <GetReportsLayer />

            {communityLayers.map((layer: CommunityLayer) => {
                const geoservice = layer.geoservice;
                // Keys must be stable and unique per layer type — never use index, was breaking on edges
                switch (geoservice?.type) {
                    case "WMTS":
                        return <GetWMTSLayer key={`WMTS_${geoservice.layer}`} layer={layer} />;
                    case "WMS":
                        return <GetWMSLayer key={`WMS_${geoservice.layer}`} layer={layer} />;
                    case "WFS":
                        return <GetWFSLayer key={`WFS_${geoservice.layer}`} layer={layer} />;
                    default:
                        return null;
                }
            })}
        </>
    );
};

export default GetAllLayers;
