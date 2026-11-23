import { fr } from "@codegouvfr/react-dsfr";

import { FEEDBACK_FORM_URL } from "@/constants/urls";
import { useTranslation } from "@/i18n";

export default function FeedbackLink() {
    const { t } = useTranslation({ FeedbackLink });

    return (
        <a className="feedback-link" href={FEEDBACK_FORM_URL} target="_blank" rel="noopener noreferrer">
            <span className={`${fr.cx("fr-icon-message-2-line", "fr-icon--sm")} feedback-link-icon`} aria-hidden="true" />
            <span className="feedback-link-label">
                {t("feedback_label")}
                <span className={fr.cx("fr-sr-only")}> - {t("new_window")}</span>
            </span>
        </a>
    );
}
