import { useTranslation } from "@/i18n";
import { useModalStore } from "@/store";

import ModaleComponent from "@/components/ModaleComponent";
interface Props {
    handleDelete: () => void;
}
const ConfirmDeleteShareReportModal = ({ handleDelete }: Props) => {
    const { t } = useTranslation({ ConfirmDeleteShareReportModal });

    const { deleteShareReportModal } = useModalStore();

    return (
        <ModaleComponent
            modal={deleteShareReportModal}
            title={t("deleteReports_title")}
            onClose={() => null}
            onConfirm={() => handleDelete()}
            cancelText={t("cancel_btn")}
            confirmText={t("delete_btn")}
        >
            <p>{t("deleteReport_message")}</p>
        </ModaleComponent>
    );
};

export default ConfirmDeleteShareReportModal;
