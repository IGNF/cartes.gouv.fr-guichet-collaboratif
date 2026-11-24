import ModaleComponent from "@/components/ModaleComponent";
import { useTranslation } from "@/i18n";
import { useModalStore } from "@/store";

interface ConfirmDiscardSketchModalProps {
    onConfirm: () => void;
}

export default function ConfirmDiscardSketchModal(props: ConfirmDiscardSketchModalProps) {
    const { onConfirm } = props;
    const { confirmDiscardSketchModal } = useModalStore();
    const { t } = useTranslation({ ConfirmDiscardSketchModal });

    return (
        <ModaleComponent
            modal={confirmDiscardSketchModal}
            title={t("title")}
            onConfirm={() => {
                onConfirm();
                confirmDiscardSketchModal.close();
            }}
            onClose={() => confirmDiscardSketchModal.close()}
            confirmText={t("confirm")}
            cancelText={t("cancel")}
        >
            <p>{t("message")}</p>
        </ModaleComponent>
    );
}
