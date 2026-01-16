import { createModal, ModalProps } from "@codegouvfr/react-dsfr/Modal";
import React from "react";
type ModaleProps = {
    modal: ReturnType<typeof createModal>;
    title: string;
    size?: "small" | "medium" | "large" | undefined;
    children: React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    className?: string;
    onConfirm?: () => void;
    onClose?: () => void;
};

type ButtonProps = ModalProps.ActionAreaButtonProps;

const ModaleComponent: React.FC<ModaleProps> = ({
    title,
    children,
    size,
    modal,
    onConfirm,
    onClose,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    className = "",
}) => {
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
        <modal.Component className={className} size={size} title={title} {...(buttons !== undefined && { buttons })}>
            {children}
        </modal.Component>
    );
};
export default ModaleComponent;
