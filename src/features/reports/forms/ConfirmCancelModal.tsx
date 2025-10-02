import ModaleComponent from "@/components/ModaleComponent";
import { useTranslation } from "@/i18n";
import { useModalStore } from "@/store";

interface Props {
    onClose: () => void;
}

const ConfirmCancelModal: React.FC<Props> = ({ onClose }) => {
    const { t } = useTranslation({ ConfirmCancelModal });
    const { confirmCancelModal } = useModalStore();

    return (
        <ModaleComponent modal={confirmCancelModal} title={t("cancel_title")} onClose={onClose} cancelText={t("cancel_yes")} confirmText={t("cancel_no")}>
            <p>{t("cancel_message")}</p>
        </ModaleComponent>
    );
};

export default ConfirmCancelModal;
