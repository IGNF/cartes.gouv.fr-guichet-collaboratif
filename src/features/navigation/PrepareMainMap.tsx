import useGetLayersHook from "@/hooks/navigation/layers";
import MainMap from "./MainMap";
import { useCommunityStore } from "@/store";

const PrepareMainMap: React.FC = () => {
    const { errorCommunity } = useCommunityStore();
    useGetLayersHook();

    if (errorCommunity) console.error(errorCommunity);

    return <MainMap />;
};

export default PrepareMainMap;
