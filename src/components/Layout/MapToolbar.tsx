import { Button } from "@codegouvfr/react-dsfr/Button";
import { useMemo } from "react";
import { useCommunityStore, useUserStore } from "@/store";
import { useTranslation } from "@/i18n";
import { ADMIN_ROLE } from "@/constants";
import ContributionsCount from "../../features/contributions/ContributionsCount";

const MapToolbar: React.FC = () => {
    const { community, hasOneEditableLayer } = useCommunityStore();
    const { user } = useUserStore();

    const { t } = useTranslation({ MapToolbar });

    const userCommunityMember = useMemo(() => user?.communitiesMember.find((cm) => cm.communityId === String(community?.id)), [user, community]);

    if (!community) return null;

    return (
        <div id="map-toolbar-header" className="map-toolbar-container">
            <div className="map-toolbar-title">
                <img
                    src={
                        community.logoUrl || "https://images.freeimages.com/images/large-previews/732/sunset-in-snowy-spruce-forest-1336307.jpg?fmt=webp&h=350"
                    }
                    alt="Icône Guichet"
                    className="map-toolbar-avatar"
                />
                <span className="map-toolbar-label">{t("community_title", { communityName: community.name })}</span>
            </div>
            <div>
                {hasOneEditableLayer && <ContributionsCount t={t} />}

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
