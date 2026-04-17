import React, { useState, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "@/i18n";
import { useGetReportReplies } from "@/api/repliesData";
import { useCommunityStore, useMapStore, useReportStore } from "@/store";
import { useReplyStore } from "@/store/useReplyStore";
import { ReportTool } from "@/constants/reports/types";
import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import ReportFiltersComponent from "@/components/ReportFiltersComponent";
import AttachmentList from "./forms/AttachmentList";
import ReportTracking from "./ReportTracking";
import DrawingForm from "./forms/DrawingForm";
import { STATUS_NOT_ALLOWED } from "@/constants/utils";
import DeleteShareReportComponent from "./DeleteShareReportComponent";
import LoaderComponent from "@/components/LoaderComponent";

import { useDeleteReport } from "@/hooks/reports/useDeleteReport";
interface Props {
    handleCloseDrawer: () => void;
}

const ShowReport: React.FC<Props> = ({ handleCloseDrawer }) => {
    const [openSuivi, setOpenSuivi] = useState(false);
    const [committedStatus, setCommittedStatus] = useState("");

    const [loading] = useState<boolean>(false);
    const { selectedReport, setTableDrawerOpened, setDrawerOpened } = useReportStore();
    const { clickedTool, setClickedTool } = useMapStore();
    const { community } = useCommunityStore();
    const { setReplies } = useReplyStore();

    const accordionRef = useRef<HTMLDivElement>(null);

    const { t } = useTranslation({ ShowReport });

    const reportId = selectedReport?.id;
    const { data: repliesData } = useGetReportReplies(reportId);
    const repliesRes = useMemo(() => repliesData?.replies ?? [], [repliesData]);

    const handleToolClick = useCallback(
        (tool: ReportTool | undefined) => {
            if (!tool) return;
            const toolButton = document.querySelector(`button[id*="${tool.name}"]`) as HTMLButtonElement | null;
            if (toolButton) {
                toolButton.click();
                setClickedTool({
                    name: tool.name,
                    clicked: clickedTool?.name === tool.name ? !clickedTool.clicked : true,
                });
            }
        },
        [clickedTool, setClickedTool]
    );

    const { deleteReport } = useDeleteReport({ handleCloseDrawer });
    if (!community || !selectedReport) return null;

    const selectedTheme = selectedReport.themes[0];
    const description = selectedReport.comment || "";
    const reportTheme = community.themes.find((theme) => theme.theme === selectedTheme.theme);

    return (
        <>
            <Button
                iconId="fr-icon-arrow-left-line"
                className="fr-icon--sm fr-mr-7v"
                priority="tertiary no outline"
                title={t("report_back")}
                onClick={() => {
                    setTableDrawerOpened(true);
                    setDrawerOpened(false);
                }}
            >
                {t("report_back")}
            </Button>
            <div className="report-drawer">
                {loading && <LoaderComponent />}
                <div className="report-drawer__container">
                    <h2 className="fr-mt-4v fr-mb-1v fr-text--md">
                        <span className="ri-map-pin-add-line fr-pr-1v" />
                        {t("report_title", { reportId: selectedReport.id })}
                    </h2>
                    <DeleteShareReportComponent handleDelete={() => deleteReport(selectedReport!)} />
                </div>
                <ReportFiltersComponent reportStatus={committedStatus} />
                {!STATUS_NOT_ALLOWED.includes(selectedReport.status) && (
                    <Button
                        onClick={() => {
                            setOpenSuivi(true);
                            setTimeout(() => {
                                accordionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                            }, 100);
                        }}
                    >
                        {t("report_reply")}
                    </Button>
                )}
                <div className="fr-mt-12v">
                    <Accordion label={t("report_theme")} defaultExpanded={false}>
                        <RadioButtons
                            legend={t("report_theme")}
                            options={[
                                {
                                    label: reportTheme?.theme,
                                    nativeInputProps: {
                                        checked: true,
                                        readOnly: true,
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
                        <DrawingForm handleToolClick={handleToolClick} hideToolsDiv={true} />
                    </Accordion>
                    {description && (
                        <Accordion label={t("report_description")} defaultExpanded={false}>
                            <p>{description}</p>
                        </Accordion>
                    )}

                    <Accordion label={t("report_document_list") + " (" + selectedReport?.attachments.length + ")"}>
                        <div>
                            <AttachmentList />
                        </div>
                    </Accordion>

                    <Accordion
                        ref={accordionRef}
                        label={t("report_tracking")}
                        onExpandedChange={(expanded: boolean) => {
                            setOpenSuivi(expanded);
                            if (expanded) {
                                setReplies(repliesRes);
                            }
                        }}
                        expanded={openSuivi}
                    >
                        <ReportTracking setCommittedStatus={setCommittedStatus} />
                    </Accordion>
                </div>
            </div>
        </>
    );
};

export default ShowReport;
