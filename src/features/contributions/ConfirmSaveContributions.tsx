import ModaleComponent from "@/components/ModaleComponent";
import { useTranslation } from "@/i18n";
import { useModalStore } from "@/store";

interface Props {
    onConfirm: () => void;
}

const ConfirmSaveContributions: React.FC<Props> = ({ onConfirm }) => {
    const { confirmSaveContributionModal } = useModalStore();
    const { t } = useTranslation({ ConfirmSaveContributions });
    return (
        <ModaleComponent modal={confirmSaveContributionModal} title={t("confirm_title")} onConfirm={onConfirm} cancelText={t("no")} confirmText={t("yes")}>
            {t("confirm_description")}
        </ModaleComponent>
    );
};

export default ConfirmSaveContributions;
