import React, { useMemo } from "react";
import { useState } from "react";
import { useTranslation } from "@/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postReportsReply } from "@/api/reportsData";
import { useGetReportReplies } from "@/api/repliesData";
import { useCommunityStore, useReportStore, useUserStore } from "@/store";
import { useReplyStore } from "@/store/useReplyStore";
import { MutationReportParams, Reply, StatusKey } from "@/constants/reports/types";
import { formatFrenchDateWithCapitalMonth, getStatusSeverity, reportImgStatus, STATUS_NOT_ALLOWED } from "@/constants/utils";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Select from "@codegouvfr/react-dsfr/Select";
import Input from "@codegouvfr/react-dsfr/Input";
import Button from "@codegouvfr/react-dsfr/Button";

interface ReportTrackingProps {
    setCommittedStatus: React.Dispatch<React.SetStateAction<string>>;
}

const ReportTracking: React.FC<ReportTrackingProps> = ({ setCommittedStatus }) => {
    const [status, setStatus] = useState("");
    const [content, setContent] = useState("");

    const { user } = useUserStore();
    const { setIsChecked, setSelectedReport, selectedReport } = useReportStore();
    const { setReplies } = useReplyStore();

    const queryClient = useQueryClient();

    const { t } = useTranslation({ ReportTracking });

    const reportId = selectedReport?.id;
    const { data: repliesData } = useGetReportReplies(reportId);
    const repliesRes = useMemo(() => repliesData?.replies ?? [], [repliesData]);

    const mutation = useMutation<Reply[] | null, Error, MutationReportParams>({
        mutationFn: ({ reportId, body }) => postReportsReply(reportId, body),
        onSuccess: (newReplies) => {
            queryClient.invalidateQueries({ queryKey: ["reportReplies", reportId] });
            setContent("");
            setIsChecked({});
            setSelectedReport(selectedReport);
            if (newReplies && newReplies.length > 0) {
                setReplies([...(repliesData?.replies ?? []), ...newReplies]);
            }
        },
    });

    const onSubmitReply = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (reportId) {
            setCommittedStatus(status);
            mutation.mutate({ reportId, body: { title: "", content, status } });
        }
    };

    const { community } = useCommunityStore();
    if (!community || !selectedReport) return;

    return (
        <>
            {!STATUS_NOT_ALLOWED.includes(selectedReport?.status) && (
                <>
                    <form className="report-drawer_status">
                        <Select
                            label={t("report_status")}
                            nativeSelectProps={{
                                onChange: (event) => setStatus(event.target.value),
                                value: status,
                            }}
                        >
                            <React.Fragment key=".0">
                                <option value={-1}>{reportImgStatus[selectedReport?.status]?.text || ""}</option>

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
                        <Input
                            label={t("report_content")}
                            textArea
                            nativeTextAreaProps={{
                                onChange: (event) => setContent(event.target.value),
                                value: content,
                            }}
                        />
                        <Button
                            disabled={!status || reportImgStatus[status as StatusKey]?.text === reportImgStatus[selectedReport?.status as StatusKey]?.text}
                            onClick={onSubmitReply}
                            className="fr-mt-4v"
                        >
                            {t("report_send")}
                        </Button>
                    </form>
                </>
            )}
            <div className="report-drawer_tracking fr-mx-7v">
                {repliesRes.length > 0 ? (
                    repliesRes.map((reply) => {
                        const hideIcon = reportImgStatus[reply.status as StatusKey].text !== "test";

                        const formattedDate = reply.date ? formatFrenchDateWithCapitalMonth(reply.date) : "-";

                        return (
                            <div
                                key={reply.id}
                                className={`report-drawer_trackingItem  ${reply.author?.username === user?.username ? "report-drawer_trackingItem--right" : ""}`}
                            >
                                {reply.author?.username === user?.username ? (
                                    <p>
                                        {reply.author?.username}
                                        <span className="fr-icon-account-fill fr-ml-1v" aria-hidden="true"></span>
                                    </p>
                                ) : (
                                    <p>
                                        <span className="fr-icon-account-line fr-mr-1v" aria-hidden="true"></span> {reply.author?.username}
                                    </p>
                                )}

                                <p className="report-drawer_trackingItem_date"> {formattedDate}</p>
                                <p> {reply.content}</p>
                                <div className="report-drawer_trackingItem_status">
                                    {t("report_status")}:
                                    <Badge noIcon={hideIcon} severity={getStatusSeverity(reply.status)} className="fr-ml-2v">
                                        {reportImgStatus[reply.status as StatusKey].text}
                                    </Badge>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p> {t("no_reply")}</p>
                )}
            </div>
        </>
    );
};

export default ReportTracking;
