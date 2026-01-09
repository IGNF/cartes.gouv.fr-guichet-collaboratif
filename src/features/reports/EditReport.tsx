import { useTranslation } from "@/i18n";
import { Feature } from "ol";
import { updateCommunityReport } from "@/api/reportsData";
import { postCommunityReportAttachments } from "@/api/attachmentData";
import { useCommunityStore, useMapStore, useReportStore } from "@/store";
import { CommunityTheme, StatusMessage } from "@/constants/communities/types";
import { PostReport, PostThemeReport } from "@/constants/reports/types";
import { getFeatureGeometryWKT } from "@/constants/utils";
import { getReportSketch } from "@/constants/reports/utils";
import ReportForm from "./forms/ReportForm";
import { useCallback } from "react";
import Button from "@codegouvfr/react-dsfr/Button";
import { useDeleteReport } from "@/hooks/reports/useDeleteReport";

interface Props {
    handleCloseDrawer: () => void;
}

const EditReport: React.FC<Props> = ({ handleCloseDrawer }) => {
    const { community, addAlertMessage } = useCommunityStore();
    const { reports, selectedReport, setReports, setTableDrawerOpened, setDrawerOpened } = useReportStore();

    const { map } = useMapStore();

    const { t } = useTranslation({ EditReport });

    const updateReport = useCallback(
        async (reportPatch: PostReport, filesUploaded: File[] = []) => {
            if (!community || !selectedReport) return;

            try {
                const reportUpdated = await updateCommunityReport(reportPatch, selectedReport.id);

                if (!reportUpdated) {
                    addAlertMessage(StatusMessage.error, t("report_updated_error"));
                    return;
                }

                if (filesUploaded.length) {
                    const attachmentsUploaded = await postCommunityReportAttachments({ ...reportUpdated, id: selectedReport.id }, filesUploaded);
                    if (!attachmentsUploaded || !attachmentsUploaded.length) {
                        addAlertMessage(StatusMessage.error, t("report_document_uploaded_error"));
                    } else {
                        reportUpdated.attachments = attachmentsUploaded;
                    }
                }

                addAlertMessage(StatusMessage.success, t("report_updated_success", { reportId: selectedReport.id }));

                const filtered = reports.filter((r) => r.id !== selectedReport.id);
                const original = reports.find((r) => r.id === selectedReport.id) || {};
                const mergedReport = { ...original, ...reportUpdated };
                setReports([...filtered, mergedReport], true);
            } catch {
                addAlertMessage(StatusMessage.error, t("report_updated_error"));
                throw new Error();
            }
        },
        [community, selectedReport, reports, addAlertMessage, t, setReports]
    );

    const { deleteReport } = useDeleteReport({ handleCloseDrawer });

    if (!community || !map || !selectedReport) return null;

    const handleUpdateReport = async (
        selectedTheme: CommunityTheme,
        themeAttributes: PostThemeReport,
        description: string,
        filesUploaded: File[],
        features: Feature[]
    ) => {
        if (!community || !map) return;

        const mainFeature = features.find((f) => f.get("reportData") && f.get("main"));
        if (!mainFeature) return;

        const patch: PostReport = {
            community: community.id,
            comment: description,
            attributes: {
                community: community.id,
                theme: selectedTheme.theme,
                attributes: themeAttributes,
            },
            geometry: getFeatureGeometryWKT(mainFeature),
        };

        if (features.length > 1) {
            patch.sketch = getReportSketch(features, map, true);
        }

        return updateReport(patch, filesUploaded);
    };

    const handleUpdateReportSketch = async (features: Feature[]) => {
        if (!community || !map) return;

        const mainFeature = features.find((f) => f.get("reportData") && f.get("main"));
        if (!mainFeature) return;

        const patch: PostReport = {
            community: community.id,
            geometry: getFeatureGeometryWKT(mainFeature),
        };

        if (features.length > 1) {
            patch.sketch = getReportSketch(features, map, true);
        }

        return updateReport(patch);
    };

    const handleUpdateReportTheme = async (selectedTheme: CommunityTheme, themeAttributes?: PostThemeReport) => {
        const patch: PostReport = {
            community: community!.id,
            attributes: {
                community: community!.id,
                theme: selectedTheme.theme,
                attributes: themeAttributes,
            },
        };
        return updateReport(patch);
    };

    const handleUpdateReportDescription = async (description: string) => {
        const patch: PostReport = {
            community: community!.id,
            comment: description,
        };
        return updateReport(patch);
    };
    const handleUpdateReportDocument = async (filesUploaded: File[]) => {
        const patch: PostReport = {
            community: community!.id,
        };
        return updateReport(patch, filesUploaded);
    };
    const handleCloseEditReportDrawer = () => {
        handleCloseDrawer();
        setTableDrawerOpened(true);
    };

    return (
        <>
            <Button
                iconId="fr-icon-arrow-left-line"
                className="fr-icon--sm fr-mr-7v"
                priority="tertiary no outline"
                title="Afficher le signalement"
                onClick={() => {
                    setTableDrawerOpened(true);
                    setDrawerOpened(false);
                }}
            >
                {t("report_back")}
            </Button>
            <ReportForm
                handleClose={handleCloseEditReportDrawer}
                handleDelete={() => deleteReport(selectedReport!)}
                handleSubmit={handleUpdateReport}
                handleSubmitSketch={handleUpdateReportSketch}
                handleSubmitTheme={handleUpdateReportTheme}
                handleSubmitDescription={handleUpdateReportDescription}
                handleSubmitDocument={handleUpdateReportDocument}
            />
        </>
    );
};

export default EditReport;
