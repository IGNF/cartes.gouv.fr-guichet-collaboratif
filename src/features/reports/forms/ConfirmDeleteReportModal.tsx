import React, { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/i18n";
import { useCommunityStore, useMapStore, useModalStore, useReportStore } from "@/store";
import { deleteCommunityReportAPI } from "@/api/reportsData";
import { CommunityReport } from "@/constants/reports/types";
import { StatusMessage } from "@/constants/communities/types";
import ModaleComponent from "@/components/ModaleComponent";
import CreateTableData from "../table/CreateTableData";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";

const ConfirmDeleteReportModal = () => {
    const { t } = useTranslation({ ConfirmDeleteReportModal });
    const queryClient = useQueryClient();

    const { community, addAlertMessage } = useCommunityStore();
    const { filteredReports, isChecked, reports, setIsChecked } = useReportStore();

    const { deleteReportModal } = useModalStore();
    const { map } = useMapStore();

    const reportsToUse = useMemo(() => {
        return filteredReports.length > 0 ? filteredReports : (reports ?? []);
    }, [filteredReports, reports]);
    const tableData = useMemo(() => CreateTableData(reportsToUse, isChecked), [reportsToUse, isChecked]);
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
                checkedIds.length === 1 ? t("delete_one_report_message", { checkedIds: checkedIds }) : t("delete_reports_message"),
                3000
            );

            if (!map) return;
            const mapCurrentLayers = map?.getAllLayers();
            const reportLayer = mapCurrentLayers?.find((l) => l.get("type") === REPORTS_LAYER_TYPE);
            if (reportLayer) {
                reportLayer.getSource()?.refresh();
            }
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
