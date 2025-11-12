import React, { useMemo, useRef } from "react";
import { useState } from "react";
import { useTranslation } from "@/i18n";

import { useGetReportReplies } from "@/api/repliesData";
import { useCommunityStore, useReportStore } from "@/store";
import { useReplyStore } from "@/store/useReplyStore";

import RadioButtons from "@codegouvfr/react-dsfr/RadioButtons";

import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import ReportFiltersComponent from "@/components/ReportFiltersComponent";
import AttachmentList from "./forms/AttachmentList";
import EditReport from "./EditReport";
import SketchList from "./forms/SketchList";
import ReportTracking from "./ReportTracking";

interface Props {
    handleCloseDrawer: () => void;
}

const ShowReport: React.FC<Props> = ({ handleCloseDrawer }) => {
    const [openSuivi, setOpenSuivi] = useState(false);
    const [committedStatus, setCommittedStatus] = useState("");

    const accordionRef = useRef<HTMLDivElement>(null);

    const { selectedReport, editReport } = useReportStore();
    const { setReplies } = useReplyStore();

    const { community } = useCommunityStore();

    const { t } = useTranslation({ ShowReport });

    const reportId = selectedReport?.id;
    const { data: repliesData } = useGetReportReplies(reportId);
    const repliesRes = useMemo(() => repliesData?.replies ?? [], [repliesData]);

    if (!community || !selectedReport) return;
    if (editReport) return <EditReport handleCloseDrawer={handleCloseDrawer} />;

    const selectedTheme = selectedReport.themes[0];
    const description = selectedReport.comment || "";
    const reportTheme = community.themes.find((theme) => theme.theme === selectedTheme.theme);

    return (
        <>
            <div className="report-drawer">
                <h2 className="fr-mt-4v fr-mb-1v fr-text--md">
                    <span className="ri-map-pin-add-line fr-pr-1v" />
                    {t("report_title", { reportId: selectedReport.id })}
                </h2>
                <ReportFiltersComponent reportStatus={committedStatus} />
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
