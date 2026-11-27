import { useCallback } from "react";
import { useModalStore, useReportStore } from "@/store";

export default function useSketchDiscardGuard() {
    const { confirmDiscardSketchModal } = useModalStore();
    const setPendingSketchDiscard = useReportStore((state) => state.setPendingSketchDiscard);

    return useCallback(
        (action: () => void) => {
            if (!useReportStore.getState().sketchUnsaved) {
                action();
                return;
            }
            setPendingSketchDiscard(() => action);
            confirmDiscardSketchModal.open();
        },
        [confirmDiscardSketchModal, setPendingSketchDiscard]
    );
}
