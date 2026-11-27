import { useEffect } from "react";

export default function useReleaseModalFocusTrap(modalId: string, isOpen: boolean) {
    useEffect(() => {
        if (!isOpen) return;

        const isOutsideModal = (target: EventTarget | null) => !(target instanceof Node && document.getElementById(modalId)?.contains(target));

        const handleFocus = (e: FocusEvent) => {
            if (isOutsideModal(e.target)) e.stopPropagation();
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Tab" && isOutsideModal(document.activeElement)) e.stopPropagation();
        };

        document.addEventListener("focus", handleFocus, true);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("focus", handleFocus, true);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [modalId, isOpen]);
}
