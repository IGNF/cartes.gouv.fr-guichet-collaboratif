import ModaleComponent from "@/components/ModaleComponent";
import { FeatureTypeFormActionMode } from "@/constants/contributions/types";
import { useContributionStore, useModalStore } from "@/store";
import { useMemo } from "react";

interface Props {
    action: FeatureTypeFormActionMode;
    onConfirm: () => void;
}

const ConfirmMultipleObjectsActionModal: React.FC<Props> = ({ action, onConfirm }) => {
    const { confirmMultipleObjectsActionModal } = useModalStore();
    const { selectedObjects } = useContributionStore();

    const actionMessage = useMemo(() => {
        switch (action) {
            case FeatureTypeFormActionMode.CANCEL:
                return "désélectionnés";

            case FeatureTypeFormActionMode.MODIFY:
                return "modifiés";
            case FeatureTypeFormActionMode.DELETE:
                return "supprimés";
        }
    }, [action]);
    return (
        <ModaleComponent modal={confirmMultipleObjectsActionModal} title={"Attentions"} onConfirm={onConfirm} cancelText={"Non"} confirmText={"Oui"}>
            <p className="modal-text">
                Tous les {selectedObjects.length} objets seront {actionMessage}, est ce vous étes sûr ?
            </p>
        </ModaleComponent>
    );
};

export default ConfirmMultipleObjectsActionModal;
