import { useParams } from "react-router-dom";
import NotFound from "./NotFound";
import NotConnected from "./NotConnected";
import { useEffect, useState } from "react";
import { useCommunityStore, useLocalStorageStore, useUserStore } from "@/store";
import { isDigital, useGetCommunityByIdAPI } from "@/api/communityData";
import { useGetUserProfileAPI } from "@/api/userData";
import MainMap from "@/features/navigation/MainMap";
import AlertComponent from "@/components/AlertComponent";
import { StatusMessage } from "@/constants/communities/types";
import { useIsI18nFetching, useTranslation } from "@/i18n";
import ClickableFeaturesModal from "@/features/working-layer/modal/ClickableFeaturesModal";
import GetFeatureInfoPopup from "@/features/working-layer/popUp/GetFeatureInfoPopUp";

const Carte: React.FC = () => {
    const params = useParams();
    const [communityNotFound, setCommunityNotFound] = useState(false);

    const { community, communityLayers, isLoadingCommunity, setCommunity, setCommunityLayers, setIsLoadingCommunity, addAlertMessage } = useCommunityStore();
    const { user, isLoadingUser, setUser, setIsLoadingUser } = useUserStore();
    const { initLocalStorage } = useLocalStorageStore();

    const communityId = params.communityId || "";

    const { data: userData, error: userError, isLoading: userIsLoading } = useGetUserProfileAPI();

    const { data: communityData, error: communityError, isLoading: communityIsLoading } = useGetCommunityByIdAPI(communityId);

    const { t } = useTranslation({ Carte });

    const isTranslationFetching = useIsI18nFetching();

    useEffect(() => {
        if (userData) {
            setUser(userData);
        }
        if (userError) {
            setUser(null);
            setCommunity(null);
            addAlertMessage(StatusMessage.error, userError.message);
        }
        setIsLoadingUser(userIsLoading);

        return () => setUser(null);
    }, [userData, userError, userIsLoading, setCommunity, setUser, setIsLoadingUser, addAlertMessage]);

    useEffect(() => {
        if (communityData) {
            const community = communityData[0];
            const layers = communityData[1];
            setCommunity(community);
            setCommunityLayers(layers);
            initLocalStorage(community.name);
        }
        if (communityError) {
            setCommunityNotFound(true);
            setCommunity(null);
            addAlertMessage(StatusMessage.error, communityError.message);
        }
        setIsLoadingCommunity(communityIsLoading);

        return () => setCommunity(null);
    }, [communityData, communityError, communityIsLoading, setCommunity, setCommunityLayers, setIsLoadingCommunity, initLocalStorage, addAlertMessage]);

    if (!isDigital(communityId) || communityNotFound) {
        return <NotFound />;
    } else if (!isLoadingUser && !user) {
        return <NotConnected />;
    } else if (isLoadingUser) {
        return <div className="container">{t("loading_user")}</div>;
    } else if (isLoadingCommunity || isTranslationFetching) {
        return <div className="container">{t("loading_community")}</div>;
    }

    return (
        <>
            <ClickableFeaturesModal />
            <GetFeatureInfoPopup />
            <AlertComponent />
            {community && communityLayers && <MainMap />}
        </>
    );
};

export default Carte;
