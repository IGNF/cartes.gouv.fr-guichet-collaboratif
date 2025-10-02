import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/i18n";
import { useCommunityStore, useModalStore, useReportStore } from "@/store";
import { deleteCommunityReportAPI } from "@/api/reportsData";
import { CommunityReport } from "@/constants/reports/types";
import { StatusMessage } from "@/constants/communities/types";
import TransformReportsToTableData from "@/components/TransformReportsToTableData";
import ModaleComponent from "@/components/ModaleComponent";

const ConfirmDeleteReportModal = () => {
    const { t } = useTranslation({ ConfirmDeleteReportModal });
    const queryClient = useQueryClient();

    const { community, addAlertMessage } = useCommunityStore();
    const { filteredReports, isChecked, reports, setIsChecked } = useReportStore();

    const { deleteReportModal } = useModalStore();

    const reportsToUse = filteredReports.length > 0 ? filteredReports : (reports ?? []);
    const tableData = TransformReportsToTableData(reportsToUse);
    const checkedIds = React.useMemo(() => {
        return tableData.filter((res) => !!isChecked[String(res.id)]).map((res) => res.id);
    }, [tableData, isChecked]);

    const { mutate: deleteReport } = useMutation({
        mutationFn: (report: CommunityReport) => deleteCommunityReportAPI(report),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reports", community?.id] });
            setIsChecked({});
            addAlertMessage(
                StatusMessage.success,
                checkedIds.length === 1 ? `Le signalement ${checkedIds} a été bien supprimé` : "Les signalements séléctionnés ont été bien supprimés",
                3000
            );
        },
    });

    const handleDelete = () => {
        tableData
            .filter((res) => !!isChecked[res.id])
            .forEach((res) => {
                deleteReport(res.original);
            });
    };

    return (
        <ModaleComponent
            modal={deleteReportModal}
            title={checkedIds?.length === 1 ? t("deleteReport_title") : t("deleteReports_title")}
            onClose={() => null}
            onConfirm={() => handleDelete()}
            cancelText={t("cancel_btn")}
            confirmText={t("delete_btn")}
        >
            <p>{checkedIds.length === 1 ? t("deleteReport_message") : t("deleteReports_message", { reportIdCount: checkedIds.length })}</p>
        </ModaleComponent>
    );
};

export default ConfirmDeleteReportModal;
