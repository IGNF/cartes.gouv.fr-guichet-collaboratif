import { useTranslation } from "@/i18n";
import { createModal } from "@codegouvfr/react-dsfr/Modal";

interface Props {
    modal: ReturnType<typeof createModal>;
    onClose: () => void;
}

const ConfirmCancelModal: React.FC<Props> = ({ modal, onClose }) => {
    const { t } = useTranslation({ ConfirmCancelModal });

    return (
        <modal.Component
            title={` ${t("cancel_title")}`}
            iconId="fr-icon-info-fill"
            buttons={[
                {
                    iconId: "ri-close-line",
                    children: t("cancel_no"),
                },
                {
                    iconId: "ri-check-line",
                    onClick: onClose,
                    children: t("cancel_yes"),
                },
            ]}
        >
            <p>{t("cancel_message")}</p>
        </modal.Component>
    );
};

export default ConfirmCancelModal;
