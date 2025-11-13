import ModaleComponent from "@/components/ModaleComponent";
import { useModalStore } from "@/store";

interface Props {
    onConfirm: () => void;
}

const ContributionsConfirmReset: React.FC<Props> = ({ onConfirm }) => {
    const { confirmResetContributionModal } = useModalStore();

    return (
        <ModaleComponent modal={confirmResetContributionModal} title="Attention" onConfirm={onConfirm} cancelText={"Non"} confirmText={"Oui"}>
            <p>Les modifications ne seront pas enregistrées, voulez-vous continuer ?</p>
        </ModaleComponent>
    );
};

export default ContributionsConfirmReset;
