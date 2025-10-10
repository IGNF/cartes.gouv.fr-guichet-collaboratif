import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/i18n";
import { postReportsReply } from "@/api/reportsData";
import { useModalStore, useReportStore } from "@/store";
import { PostReply, StatusKey } from "@/constants/reports/types";
import { reportImgStatus } from "@/constants/utils";
import Input from "@codegouvfr/react-dsfr/Input";
import Select from "@codegouvfr/react-dsfr/Select";
import ModaleComponent from "@/components/ModaleComponent";
import CreateTableData from "../table/CreateTableData";

interface Props {
    onClose: () => void;
}

const OpenReplyReportModal: React.FC<Props> = ({ onClose }) => {
    const { filteredReports, isChecked, reports, setIsChecked, selectedReport, setSelectedReport } = useReportStore();
    const { replyReportModal } = useModalStore();

    const queryClient = useQueryClient();

    const { t } = useTranslation({ OpenReplyReportModal });
    const [selectedReportId, setSelectedReportId] = useState<number[]>();

    const [status, setStatus] = useState("");
    const [content, setContent] = useState("");

    const reportsToUse = useMemo(() => {
        return filteredReports.length > 0 ? filteredReports : (reports ?? []);
    }, [filteredReports, reports]);
    const tableData = useMemo(() => CreateTableData(reportsToUse, isChecked), [reportsToUse, isChecked]);

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
            setSelectedReport(selectedReport);
        },
    });

    useEffect(() => {
        if (checkedIds.length > 0 && (selectedReportId?.length !== checkedIds.length || !checkedIds.every((id, index) => id === selectedReportId[index]))) {
            setSelectedReportId(checkedIds);
        }
    }, [checkedIds, selectedReportId]);
    useEffect(() => {
        setSelectedReport(selectedReport);
    }, [reports, selectedReport, setSelectedReport]);

    const replay_title = `${selectedReportId?.length === 1 ? t("openReplay_title") + selectedReportId : t("openReplies_title")}`;
    return (
        <ModaleComponent
            modal={replyReportModal}
            title={replay_title}
            onClose={onClose}
            onConfirm={async () => {
                mutation.mutate({ reportsId: selectedReportId || [], body: { title: "Could be empty !", content, status } });
            }}
            cancelText={t("back_to_reports")}
            confirmText={t("send_report")}
        >
            <Input
                label={t("replayStatus_text")}
                textArea
                nativeTextAreaProps={{
                    onChange: (event) => setContent(event.target.value),
                    value: content,
                }}
            />
            <Select
                label={t("replayContent_text")}
                nativeSelectProps={{
                    onChange: (event) => setStatus(event.target.value),
                    value: status,
                }}
            >
                <React.Fragment key=".0">
                    {CheckedIdStatus.length === 1 ? (
                        <option value={-1}>{reportImgStatus[CheckedIdStatus[0]].text || ""}</option>
                    ) : (
                        <option value={-1} disabled hidden>
                            Selectionnez un status
                        </option>
                    )}
                    {Object.keys(reportImgStatus).map((key) => {
                        const statusKey = key as StatusKey;
                        return (
                            <option key={statusKey} value={key}>
                                {reportImgStatus[statusKey].text}
                            </option>
                        );
                    })}
                </React.Fragment>
            </Select>
        </ModaleComponent>
    );
};

export default OpenReplyReportModal;
