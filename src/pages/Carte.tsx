import MainMap from "@/features/navigation/MainMap";
import { useNavigate, useParams } from "react-router-dom";
import NotFound from "./NotFound";
import NotConnected from "./NotConnected";
import { useEffect, useState } from "react";
import { useCommunityStore, useUserStore } from "@/store";
import { useGetCommunityById } from "@/api/communityData";
import { PAGE_404_URL } from "@/constants/urls";

const isDigital = (value: string): boolean => {
    const regex = /^[1-9]\d*$/;
    return regex.test(value);
};

const Carte: React.FC = () => {
    const params = useParams();
    const navigate = useNavigate();

    const [communityNotFount, setCommunityNotFount] = useState(false);

    const { community, isLoadingCommunity, setCommunity, setIsLoadingCommunity } = useCommunityStore();
    const { user, isLoadingUser } = useUserStore();

    const communityId = params.communityId || "";
    if (!isDigital(communityId)) {
        navigate(PAGE_404_URL);
    }
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

    if (communityNotFount) return <NotFound />;
    if (isLoadingUser !== null && !isLoadingUser && !user) return <NotConnected />;
    if (isLoadingCommunity) return <div>Chargements...</div>;

    return community && <MainMap />;
};

export default Carte;
