import { useTranslation } from "@/i18n";
import { useCommunityStore, useReportStore } from "@/store";
import Accordion from "@codegouvfr/react-dsfr/Accordion";
import Button from "@codegouvfr/react-dsfr/Button";
import AttachmentList from "./forms/AttachmentList";
import SketchList from "./forms/SketchList";
import EditReport from "./EditReport";
import ReportFilters from "@/components/ReportFilters";

interface Props {
    handleCloseDrawer: () => void;
}

const ShowReport: React.FC<Props> = ({ handleCloseDrawer }) => {
    const { selectedReport, editReport, setEditReport } = useReportStore();
    const { community } = useCommunityStore();

    const { t } = useTranslation({ ShowReport });

    if (!community || !selectedReport) return;
    if (editReport) return <EditReport handleCloseDrawer={handleCloseDrawer} />;

    const description = selectedReport.comment || "";
    return (
        <div className="report-drawer">
            <h2 className="fr-mt-4v fr-mb-1v fr-text--md">
                <span className="ri-map-pin-add-line fr-pr-1v" />
                {t("report_title", { reportId: selectedReport.id })}
            </h2>
            <ReportFilters />

            <Accordion label={t("report_sketch_list")} defaultExpanded={true}>
                <SketchList />
            </Accordion>
            {description && (
                <Accordion label={t("report_description")} defaultExpanded={true}>
                    <p>{description}</p>
                </Accordion>
            )}

            <Accordion label={t("report_document_list")} defaultExpanded={true}>
                <div
                    style={{
                        width: "100%",
                    }}
                >
                    <AttachmentList />
                </div>
            </Accordion>

            <div className="buttons">
                <Button onClick={() => setEditReport(true)}>{t("report_document_modify")}</Button>
            </div>
        </div>
    );
};

export default ShowReport;
