import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/i18n";
import { postReportsReply } from "@/api/reportsData";
import { useReportStore } from "@/store";
import { PostReply } from "@/constants/reports/types";
import { statusLabels } from "@/constants/utils";
import Input from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Select from "@codegouvfr/react-dsfr/Select";
import TransformReportsToTableData from "@/components/TransformReportsToTableData";

interface Props {
    modal: ReturnType<typeof createModal>;
    onClose: () => void;
}

const OpenReplyReportModal: React.FC<Props> = ({ modal, onClose }) => {
    const { filteredReports, isChecked, reports, setIsChecked } = useReportStore();
    const queryClient = useQueryClient();

    const { t } = useTranslation({ OpenReplyReportModal });
    const [selectedReport, setSelectedReport] = useState<number[]>();

    const [status, setStatus] = useState("");
    const [content, setContent] = useState("");

    const reportsToUse = filteredReports.length > 0 ? filteredReports : (reports ?? []);
    const tableData = TransformReportsToTableData(reportsToUse);

    const checkedIds = React.useMemo(() => {
        return tableData.filter((res) => !!isChecked[String(res.id)]).map((res) => res.id);
    }, [tableData, isChecked]);

    const CheckedIdStatus = React.useMemo(() => {
        return tableData.filter((res) => !!isChecked[String(res.id)]).map((checkedStatus) => checkedStatus.exportData.status);
    }, [tableData, isChecked]);

    type MutationParams = {
        reportsId: number[];
        body: PostReply;
    };

    const mutation = useMutation<PostReply[] | null, Error, MutationParams>({
        mutationFn: ({ reportsId, body }) => postReportsReply(reportsId, body),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reports"] });
            setContent("");
            setStatus("");
            setIsChecked({});
        },
        onError: (error) => {
            console.error("Erreur d'ajout :", error);
        },
    });

    useEffect(() => {
        if (checkedIds.length > 0 && (selectedReport?.length !== checkedIds.length || !checkedIds.every((id, index) => id === selectedReport[index]))) {
            setSelectedReport(checkedIds);
        }
    }, [checkedIds, selectedReport]);

    return (
        <modal.Component
            title={` ${t("open_title")} ${selectedReport?.length === 1 ? "au " + selectedReport : ["aux signalements sélectionnés"]}`}
            iconId="fr-icon-info-fill"
            buttons={[
                {
                    iconId: "ri-check-line",
                    children: t("send_report"),
                    onClick: async () => {
                        mutation.mutate({ reportsId: selectedReport || [], body: { title: "should not be empty !", content, status } });
                    },
                },
                {
                    iconId: "ri-check-line",
                    onClick: onClose,
                    children: t("back_to_reports"),
                },
            ]}
        >
            <Input
                label={t("open_title")}
                textArea
                nativeTextAreaProps={{
                    onChange: (event) => setContent(event.target.value),
                    value: content,
                }}
            />
            <Select
                label="Label pour liste déroulante"
                nativeSelectProps={{
                    onChange: (event) => setStatus(event.target.value),
                    value: status,
                }}
            >
                <React.Fragment key=".0">
                    {CheckedIdStatus.length === 1 ? (
                        <option value={-1}>{statusLabels[CheckedIdStatus[0]]}</option>
                    ) : (
                        <option disabled hidden value="">
                            Selectionnez un status
                        </option>
                    )}

                    {Object.entries(statusLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </React.Fragment>
            </Select>
        </modal.Component>
    );
};

export default OpenReplyReportModal;
