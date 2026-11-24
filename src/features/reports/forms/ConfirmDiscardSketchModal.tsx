import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import ModaleComponent from "@/components/ModaleComponent";
import { useTranslation } from "@/i18n";
import { useModalStore, useReportStore } from "@/store";

export default function ConfirmDiscardSketchModal() {
    const { confirmDiscardSketchModal } = useModalStore();
    const setPendingSketchDiscard = useReportStore((state) => state.setPendingSketchDiscard);
    const { t } = useTranslation({ ConfirmDiscardSketchModal });

    useIsModalOpen(confirmDiscardSketchModal, {
        onConceal: () => setPendingSketchDiscard(null),
    });

    return (
        <ModaleComponent
            modal={confirmDiscardSketchModal}
            title={t("title")}
            onConfirm={() => {
                const action = useReportStore.getState().pendingSketchDiscard;
                setPendingSketchDiscard(null);
                confirmDiscardSketchModal.close();
                action?.();
            }}
            onClose={() => confirmDiscardSketchModal.close()}
            confirmText={t("confirm")}
            cancelText={t("cancel")}
        >
            <p>{t("message")}</p>
        </ModaleComponent>
    );
}
