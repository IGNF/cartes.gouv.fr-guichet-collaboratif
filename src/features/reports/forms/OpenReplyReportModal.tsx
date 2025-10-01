import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/i18n";
import { postReportsReply } from "@/api/reportsData";
import { useReportStore } from "@/store";
import { PostReply, StatusKey } from "@/constants/reports/types";
import { reportImgStatus } from "@/constants/utils";
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

    useEffect(() => {
        console.log(" ---> : ", Object.keys(reportImgStatus)[1]);
        console.log(" CheckedIdStatus[0] ---> : ", CheckedIdStatus[0]);
    }, [CheckedIdStatus]);

    const replay_title = `${selectedReport?.length === 1 ? t("openReplay_title") + selectedReport : t("openReplies_title")}`;
    return (
        <modal.Component
            title={replay_title}
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
                label={replay_title}
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
                        <option value={-1}>{reportImgStatus[CheckedIdStatus[0]].text || ""}</option>
                    ) : (
                        <option disabled hidden value="">
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
        </modal.Component>
    );
};

export default OpenReplyReportModal;
