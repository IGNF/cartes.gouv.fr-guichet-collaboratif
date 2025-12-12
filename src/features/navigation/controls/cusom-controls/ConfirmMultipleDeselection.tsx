import ModaleComponent from "@/components/ModaleComponent";
import { useContributionStore, useModalStore } from "@/store";

interface Props {
    onConfirm: () => void;
}

const ConfirmMultipleDeselection: React.FC<Props> = ({ onConfirm }) => {
    const { confirmMultipleDeselectionModal } = useModalStore();
    const { selectedObjects } = useContributionStore();
    return (
        <ModaleComponent modal={confirmMultipleDeselectionModal} title={"Attentions"} onConfirm={onConfirm} cancelText={"Non"} confirmText={"Oui"}>
            Tous les {selectedObjects.length} objets seront désélectionnés, est ce vous étes sûr ?
        </ModaleComponent>
    );
};

export default ConfirmMultipleDeselection;
