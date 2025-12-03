import { Button } from "@codegouvfr/react-dsfr/Button";
import { useMemo } from "react";
import { useCommunityStore, useUserStore } from "@/store";
import { useTranslation } from "@/i18n";
import { ADMIN_ROLE } from "@/constants";
import ContributionsCount from "../../features/contributions/ContributionsCount";

const MapToolbar: React.FC = () => {
    const { community } = useCommunityStore();
    const { user } = useUserStore();

    const { t } = useTranslation({ MapToolbar });

    const userCommunityMember = useMemo(() => user?.communitiesMember.find((cm) => cm.communityId === community?.id), [user, community]);

    if (!community) return null;

    return (
        <div id="map-toolbar-header" className="map-toolbar-container">
            <div className="map-toolbar-title">
                <img
                    src={
                        community.logoUrl ||
                        "https://media.istockphoto.com/id/528909900/photo/sunbeams-rays-of-light-shining-through-green-foliage-into-forest.webp?a=1&b=1&s=612x612&w=0&k=20&c=XvEKcyRQSLGgeTULTqy53TTuno_IevpN9VVUg3nXkjA="
                    }
                    alt="Icône Guichet"
                    className="map-toolbar-avatar"
                />
                <span className="map-toolbar-label">{t("community_title", { communityName: community.name })}</span>
            </div>
            <div>
                <ContributionsCount t={t} />

                {userCommunityMember?.role === ADMIN_ROLE && (
                    <Button iconId="fr-icon-settings-5-fill" priority="secondary" linkProps={{ href: "#" }} className="map-toolbar-manage">
                        {t("manage")}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default MapToolbar;
