import { createModal, ModalProps } from "@codegouvfr/react-dsfr/Modal";
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

type ButtonProps = ModalProps.ActionAreaButtonProps;

const ModaleComponent: React.FC<ModaleProps> = ({ title, children, modal, onConfirm, onClose, confirmText = "Confirmer", cancelText = "Annuler" }) => {
    const cancelButton: ButtonProps | null = onClose
        ? {
              onClick: onClose,
              children: cancelText,
          }
        : null;

    const confirmButton: ButtonProps | null = onConfirm
        ? {
              onClick: onConfirm,
              children: confirmText,
          }
        : null;

    let buttons: ModalProps["buttons"] = undefined;

    if (confirmButton && cancelButton) {
        buttons = [cancelButton, confirmButton] as [ButtonProps, ...ButtonProps[]];
    } else if (confirmButton) {
        buttons = confirmButton;
    } else if (cancelButton) {
        buttons = cancelButton;
    }

    return (
        <modal.Component title={title} {...(buttons !== undefined && { buttons })}>
            {children}
        </modal.Component>
    );
};
export default ModaleComponent;
