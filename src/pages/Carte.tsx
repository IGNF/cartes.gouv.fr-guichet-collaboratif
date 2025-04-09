import MainMap from "@/features/navigation/MainMap";
import { useParams } from "react-router-dom";
import NotFound from "./NotFound";
import NotConnected from "./NotConnected";
import { useEffect, useState } from "react";
import { useCommunityStore, useUserStore } from "@/store";
import { isDigital, useGetCommunityById } from "@/api/communityData";

const Carte: React.FC = () => {
    const params = useParams();

    const [communityNotFount, setCommunityNotFount] = useState(false);

    const { community, isLoadingCommunity, setCommunity, setIsLoadingCommunity } = useCommunityStore();
    const { user, isLoadingUser } = useUserStore();

    const communityId = params.communityId || "";

    const { data, error, isLoading } = useGetCommunityById(communityId);

    useEffect(() => {
        if (data) {
            setCommunity(data);
        }
        if (error) {
            setCommunityNotFount(true);
            setCommunity(null);
        }
        setIsLoadingCommunity(isLoading);
    }, [data, error, isLoading]);

    console.log("isLoadingUser", isLoadingUser, user);
    if (!isLoadingUser && !user) {
        return <NotConnected />;
    } else if (isLoadingCommunity || isLoadingUser) {
        return <div className="container">Chargements...</div>;
    } else if (communityNotFount || !isDigital(communityId)) {
        return <NotFound />;
    }

    return community && <MainMap />;
};

export default Carte;
