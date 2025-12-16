import ModaleComponent from "@/components/ModaleComponent";
import { FeatureTypeFormActionMode } from "@/constants/contributions/types";
import { useTranslation } from "@/i18n";
import { useContributionStore, useModalStore } from "@/store";
import { useCallback } from "react";

interface Props {
    action: FeatureTypeFormActionMode;
    onConfirm: () => void;
}

const ConfirmMultipleObjectsActionModal: React.FC<Props> = ({ action, onConfirm }) => {
    const { confirmMultipleObjectsActionModal } = useModalStore();
    const { selectedObjects } = useContributionStore();

    const { t } = useTranslation({ ConfirmMultipleObjectsActionModal });

    const onClose = useCallback(() => {
        confirmMultipleObjectsActionModal.close();
    }, [confirmMultipleObjectsActionModal]);

    return (
        <ModaleComponent
            modal={confirmMultipleObjectsActionModal}
            title={t("title")}
            onConfirm={onConfirm}
            onClose={onClose}
            cancelText={t("no")}
            confirmText={t("yes")}
        >
            <p className="modal-text">{t("message", { objectsCount: selectedObjects.length, action })}</p>
        </ModaleComponent>
    );
};

export default ConfirmMultipleObjectsActionModal;
