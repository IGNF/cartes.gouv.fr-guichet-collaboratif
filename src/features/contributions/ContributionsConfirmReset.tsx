import ModaleComponent from "@/components/ModaleComponent";
import { useTranslation } from "@/i18n";
import { useContributionStore, useModalStore } from "@/store";
import { useCallback } from "react";

interface Props {
    onConfirm: () => void;
}

const ContributionsConfirmReset: React.FC<Props> = ({ onConfirm }) => {
    const { confirmResetContributionModal } = useModalStore();

    const { contributions, contrToCancel, setReviewContribution } = useContributionStore();

    const { t } = useTranslation({ ContributionsConfirmReset });

    const onClose = useCallback(() => {
        setReviewContribution(false);
    }, [setReviewContribution]);

    return (
        <ModaleComponent
            modal={confirmResetContributionModal}
            title={t("title")}
            onConfirm={onConfirm}
            onClose={onClose}
            cancelText={t("no")}
            confirmText={t("yes")}
        >
            {t("description", { count: contrToCancel.length === contributions.length ? 1000 : contrToCancel.length })}
        </ModaleComponent>
    );
};

export default ContributionsConfirmReset;
