import { useParams } from "react-router-dom";
import NotFound from "./NotFound";
import NotConnected from "./NotConnected";
import { useEffect, useState } from "react";
import { useCommunityStore, useUserStore } from "@/store";
import { isDigital, useGetCommunityByIdAPI } from "@/api/communityData";
import { useGetUserProfileAPI } from "@/api/userData";
import MainMap from "@/features/navigation/MainMap";
import { LIST_COMMUNITIES_URL } from "@/constants/urls";

const Carte: React.FC = () => {
    const params = useParams();
    const [communityNotFound, setCommunityNotFound] = useState(false);

    const { community, isLoadingCommunity, setCommunity, setCommunityLayers, setIsLoadingCommunity } = useCommunityStore();
    const { user, isLoadingUser, setUser, setIsLoadingUser } = useUserStore();

    const communityId = params.communityId || "";

    const { data: userData, error: userError, isLoading: userIsLoading } = useGetUserProfileAPI();

    const { data: communityData, error: communityError, isLoading: communityIsLoading } = useGetCommunityByIdAPI(communityId);

    useEffect(() => {
        if (userData) {
            setUser(userData);
        }
        if (userError) {
            setCommunityNotFound(true);
            setCommunity(null);
        }
        setIsLoadingUser(userIsLoading);

        return () => setCommunity(null);
    }, [userData, userError, userIsLoading, setCommunity, setUser, setIsLoadingUser]);

    useEffect(() => {
        if (communityData) {
            setCommunity(communityData[0]);
            setCommunityLayers(communityData[1]);
        }
        if (communityError) {
            setCommunityNotFound(true);
            setCommunity(null);
        }
        setIsLoadingCommunity(communityIsLoading);

        return () => setCommunity(null);
    }, [communityData, communityError, communityIsLoading, setCommunity, setCommunityLayers, setIsLoadingCommunity]);

    if (!isLoadingUser && !user) {
        return <NotConnected />;
    } else if (isLoadingCommunity || isLoadingUser) {
        return <div className="container">Chargement...</div>;
    } else if (!isDigital(communityId)) {
        return <NotFound />;
    } else if (communityNotFound) {
        window.location.href = LIST_COMMUNITIES_URL;
    }

    return (
        community && (
            <>
                <MainMap />
            </>
        )
    );
};

export default Carte;
