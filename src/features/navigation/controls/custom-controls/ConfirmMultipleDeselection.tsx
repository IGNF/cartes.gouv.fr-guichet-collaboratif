import ModaleComponent from "@/components/ModaleComponent";
import { useTranslation } from "@/i18n";
import { useContributionStore, useModalStore } from "@/store";
import { useCallback } from "react";

interface Props {
    onConfirm: () => void;
}

const ConfirmMultipleDeselection: React.FC<Props> = ({ onConfirm }) => {
    const { confirmMultipleDeselectionModal } = useModalStore();
    const { selectedObjects } = useContributionStore();

    const { t } = useTranslation({ ConfirmMultipleDeselection });

    const onClose = useCallback(() => {
        confirmMultipleDeselectionModal.close();
    }, [confirmMultipleDeselectionModal]);

    return (
        <ModaleComponent
            modal={confirmMultipleDeselectionModal}
            title={t("title")}
            onConfirm={onConfirm}
            onClose={onClose}
            cancelText={t("no")}
            confirmText={t("yes")}
        >
            {t("message", { objectsCount: selectedObjects.length })}
        </ModaleComponent>
    );
};

export default ConfirmMultipleDeselection;
