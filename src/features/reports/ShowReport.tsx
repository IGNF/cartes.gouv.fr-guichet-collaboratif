import { useTranslation } from "@/i18n";
import { useCommunityStore, useReportStore, useUserStore } from "@/store";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import SketchList from "./forms/SketchList";
import EditReport from "./EditReport";
import ReportFiltersComponent from "@/components/ReportFiltersComponent";
import { useState } from "react";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { getReportReplies } from "@/api/reportsData";
import { useQuery } from "@tanstack/react-query";
import { Replies, Severity, StatusKey } from "@/constants/reports/types";
import "./ShowReport.css";
import { reportImgStatus } from "@/constants/utils";
import React from "react";
import Select from "@codegouvfr/react-dsfr/Select";
import Input from "@codegouvfr/react-dsfr/Input";
import FormAttachments from "./forms/FormAttachments";

interface Props {
    handleCloseDrawer: () => void;
}

const ShowReport: React.FC<Props> = ({ handleCloseDrawer }) => {
    const [openSuivi, setOpenSuivi] = useState(false);
    const [status, setStatus] = useState("");
    const [content, setContent] = useState("");

    const { user } = useUserStore();
    const { selectedReport, editReport, setEditReport } = useReportStore();

    const { community } = useCommunityStore();

    const { t } = useTranslation({ ShowReport });

    const reportId = selectedReport?.id;
    const { data } = useQuery<Replies>({
        queryKey: reportId ? ["report", reportId] : ["report"],
        queryFn: () => getReportReplies(reportId!),
        enabled: !!reportId,
    });

    if (!community || !selectedReport) return;
    if (editReport) return <EditReport handleCloseDrawer={handleCloseDrawer} />;

    const selectedTheme = selectedReport.themes[0];
    const description = selectedReport.comment || "";
    const reportTheme = community.themes.find((theme) => theme.theme === selectedTheme.theme);

    return (
        <div className="report-drawer">
            <h2 className="fr-mt-4v fr-mb-1v fr-text--md">
                <span className="ri-map-pin-add-line fr-pr-1v" />
                {t("report_title", { reportId: selectedReport.id })}
            </h2>
            <ReportFiltersComponent />
            <Button onClick={() => setOpenSuivi(true)}>Répondre</Button>

            <div className="fr-mt-12v">
                <Accordion label={t("report_theme")} defaultExpanded={false}>
                    <RadioButtons
                        legend={t("report_theme")}
                        options={[
                            {
                                label: reportTheme?.theme,
                                nativeInputProps: {
                                    checked: true,
                                },
                            },
                        ]}
                        state="default"
                        stateRelatedMessage=""
                        orientation="vertical"
                        small
                        disabled={true}
                        className="theme-radio fr-mt-4v fr-mb-1v fr-text--md"
                    />
                </Accordion>
                <Accordion label={t("report_sketch_list")} defaultExpanded={false}>
                    <SketchList />
                </Accordion>
                {description && (
                    <Accordion label={t("report_description")} defaultExpanded={false}>
                        <p>{description}</p>
                    </Accordion>
                )}

                <Accordion label={t("report_document_list") + " (" + selectedReport?.attachments.length + ")"}>
                    <div>
                        <FormAttachments />
                        {/* <AttachmentList /> */}
                    </div>
                </Accordion>

                <Accordion label={t("report_tracking")} onExpandedChange={(expanded: boolean) => setOpenSuivi(expanded)} expanded={openSuivi}>
                    <div className="report-drawer_tracking fr-mx-3v">
                        {data?.replies.map((reply) => {
                            const hideIcon = reportImgStatus[reply.status as StatusKey].text !== "test";
                            return (
                                <div
                                    key={reply.id}
                                    className={`report-drawer_trackingItem  ${reply.author.username === user?.name ? "report-drawer_trackingItem--right" : ""}`}
                                >
                                    {reply.author.username === user?.name ? (
                                        <p>
                                            {reply.author.username}
                                            <span className="fr-icon-account-fill fr-ml-1v" aria-hidden="true"></span>
                                        </p>
                                    ) : (
                                        <p>
                                            <span className="fr-icon-account-line fr-mr-1v" aria-hidden="true"></span> {reply.author.username}
                                        </p>
                                    )}

                                    <p className="report-drawer_trackingItem_date"> {reply.date}</p>
                                    <p> {reply.content}</p>
                                    <div className="report-drawer_trackingItem_status">
                                        Statut:
                                        <Badge
                                            noIcon={hideIcon}
                                            severity={reportImgStatus[reply.status as StatusKey].colorType as Severity}
                                            className="fr-ml-2v"
                                        >
                                            {reply.status}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div>
                        <form className="report-drawer_status fr-mt-6v">
                            <Select
                                label={t("report_status")}
                                nativeSelectProps={{
                                    onChange: (event) => setStatus(event.target.value),
                                    value: status,
                                }}
                            >
                                <React.Fragment key=".0">
                                    <option value={-1}>{reportImgStatus[selectedReport.status].text || ""}</option>

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
                            <Button onClick={() => null} className="fr-mt-4v">
                                {t("report_send")}
                            </Button>
                        </form>
                    </div>
                </Accordion>
            </div>

            <div className="buttons">
                <Button onClick={() => setEditReport(true)}>{t("report_document_modify")}</Button>
            </div>
        </div>
    );
};

export default ShowReport;
