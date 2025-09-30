import React, { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/i18n";
import { useCommunityStore, useReportStore } from "@/store";
import { deleteCommunityReportAPI } from "@/api/reportsData";
import { CommunityReport } from "@/constants/reports/types";
import { StatusMessage } from "@/constants/communities/types";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import TransformReportsToTableData from "@/components/TransformReportsToTableData";

interface Props {
    modal: ReturnType<typeof createModal>;
    onClose: () => void;
}

const ConfirmDeleteReportModal: React.FC<Props> = ({ modal, onClose }) => {
    const { t } = useTranslation({ ConfirmDeleteReportModal });
    const queryClient = useQueryClient();

    const { community, addAlertMessage } = useCommunityStore();
    const { filteredReports, isChecked, reports, setIsChecked } = useReportStore();

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
        onError: () => {},
    });

    const handleDelete = () => {
        tableData
            .filter((res) => !!isChecked[res.id])
            .forEach((res) => {
                deleteReport(res.original);
            });
    };

    useEffect(() => {
        console.log("checkedIds : ", checkedIds);

        return () => {};
    }, [checkedIds]);
    return (
        <modal.Component
            title={checkedIds?.length === 1 ? t("deleteReport_title") : t("deleteReports_title")}
            buttons={[
                {
                    iconId: "ri-check-line",
                    children: t("delete_btn"),
                    onClick: () => handleDelete(),
                },
                {
                    iconId: "ri-check-line",
                    onClick: onClose,
                    children: t("cancel_btn"),
                },
            ]}
        >
            <p>{checkedIds.length === 1 ? t("deleteReport_message") : t("deleteReports_message", { reportIdCount: checkedIds.length })}</p>

            {/* <p>{t("deleteReport_message")} </p> */}
        </modal.Component>
    );
};

export default ConfirmDeleteReportModal;
