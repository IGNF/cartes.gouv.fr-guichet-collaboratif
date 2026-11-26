import { useTranslation } from "@/i18n";
import Badge from "@codegouvfr/react-dsfr/Badge";

import FeedbackLink from "@/components/Layout/MapCommunity/FeedbackLink";
import MapOverlayPortal from "@/components/Layout/MapOverlayPortal";
import { MapOverlaySlot } from "@/constants/navigation/mapOverlaySlots";

const BetaBadge = () => {
    const { t } = useTranslation({ BetaBadge });

    return (
        <MapOverlayPortal slot={MapOverlaySlot.BETA_BADGE}>
            <div className="beta-badge-wrapper">
                <FeedbackLink />
                <Badge className="beta-badge" severity="success" noIcon>
                    {t("beta_label")}
                </Badge>
            </div>
        </MapOverlayPortal>
    );
};

export default BetaBadge;
