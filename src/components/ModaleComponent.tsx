import { createModal } from "@codegouvfr/react-dsfr/Modal";
import React from "react";
type ModaleProps = {
    modal: ReturnType<typeof createModal>;
    title: string;
    children: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onClose?: () => void;
};

const ModaleComponent: React.FC<ModaleProps> = ({ title, children, modal, onConfirm, onClose, confirmText = "Confirmer", cancelText = "Annuler" }) => {
    return (
        <modal.Component
            title={title}
            buttons={[
                {
                    onClick: onClose,
                    children: cancelText,
                },
                {
                    onClick: onConfirm,
                    children: confirmText,
                },
            ]}
        >
            {children}
        </modal.Component>
    );
};

export default ModaleComponent;
