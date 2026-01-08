import { useCallback } from "react";
import { useCommunityStore, useMapStore, useReportStore } from "@/store";
import { useTranslation } from "@/i18n";
import { StatusMessage } from "@/constants/communities/types";
import { deleteCommunityReportAPI } from "@/api/reportsData";
import { clearDrawingLayer } from "@/constants/utils";
import VectorSource from "ol/source/Vector";
import type { CommunityReport } from "@/constants/reports/types";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";

interface UseDeleteReportProps {
    handleCloseDrawer?: () => void; // Optionnel
}

export const useDeleteReport = ({ handleCloseDrawer }: UseDeleteReportProps) => {
    const { addAlertMessage } = useCommunityStore();
    const { t } = useTranslation({ useDeleteReport });
    const { map } = useMapStore();
    const { reports, setReports, setDrawerOpened } = useReportStore();

    const deleteReport = useCallback(
        async (report: CommunityReport) => {
            try {
                const reportDeleted = await deleteCommunityReportAPI(report);
                if (!reportDeleted) {
                    addAlertMessage(StatusMessage.error, t("report_deleted_error"));
                    return false;
                }

                addAlertMessage(StatusMessage.success, t("report_deleted_success", { reportId: report.id }));

                const reportLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE);
                const reportSource = reportLayer?.getSource() as VectorSource;
                if (reportSource) {
                    const filteredFeatures = reportSource.getFeatures().filter((f) => {
                        const reportData = f.get("reportData") as CommunityReport | undefined;
                        return reportData?.id === report.id;
                    });
                    reportSource.removeFeatures(filteredFeatures);
                }

                setReports(
                    reports.filter((r) => r.id !== report.id),
                    true
                );
                handleCloseDrawer?.();
                setDrawerOpened(false);
                clearDrawingLayer(map);
                return true;
            } catch (error) {
                addAlertMessage(StatusMessage.error, t("report_document_deleted_error"));
                console.error("Delete report error:", error);
                return false;
            }
        },
        [addAlertMessage, map, reports, setReports, t, setDrawerOpened]
    );

    return { deleteReport };
};
