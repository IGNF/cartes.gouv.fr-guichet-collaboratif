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

            {communityLayers.map((layer: CommunityLayer, index: number) => {
                const geoservice = layer.geoservice;
                switch (geoservice?.type) {
                    case "WMTS":
                        return <GetWMTSLayer key={`GetWMTS_${index}`} layer={layer} />;
                    case "WMS":
                        return <GetWMSLayer key={`GetWMS_${index}`} layer={layer} />;

                    case "WFS":
                        return <GetWFSLayer key={`GetWFS_${index}`} layer={layer} />;

                    default:
                        return;
                }
            })}
        </>
    );
};

export default GetAllLayers;
