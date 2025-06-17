import { createModal } from "@codegouvfr/react-dsfr/Modal";

interface Props {
    modal: ReturnType<typeof createModal>;
    onClose: () => void;
}

const ConfirmCancelModal: React.FC<Props> = ({ modal, onClose }) => {
    return (
        <modal.Component
            title=" Confirmation"
            iconId="fr-icon-info-fill"
            buttons={[
                {
                    iconId: "ri-close-line",
                    children: "Non, continuer la saisie",
                },
                {
                    iconId: "ri-check-line",
                    onClick: onClose,
                    children: "Oui, annuler",
                },
            ]}
        >
            <p>En annulant la création de ce signalement vous supprimerez les éventuels documents et croquis associés. Voulez-vous continuer ?</p>
        </modal.Component>
    );
};

export default ConfirmCancelModal;
