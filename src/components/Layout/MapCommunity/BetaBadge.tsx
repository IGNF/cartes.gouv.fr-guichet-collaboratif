import { useTranslation } from "@/i18n";
import Badge from "@codegouvfr/react-dsfr/Badge";

import FeedbackLink from "@/components/Layout/MapCommunity/FeedbackLink";

const BetaBadge = () => {
    const { t } = useTranslation({ BetaBadge });

    return (
        <div className="beta-badge-wrapper">
            <FeedbackLink />
            <Badge className="beta-badge" severity="success" noIcon>
                {t("beta_label")}
            </Badge>
        </div>
    );
};

export default BetaBadge;
