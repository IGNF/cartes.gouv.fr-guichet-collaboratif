import { useTranslation } from "@/i18n";
import { Feature } from "ol";
import VectorSource from "ol/source/Vector";
import { deleteCommunityReportAPI, updateCommunityReport } from "@/api/reportsData";
import { deleteCommunityReportAllAttachments, postCommunityReportAttachments } from "@/api/attachmentData";
import { useCommunityStore, useMapStore, useReportStore } from "@/store";
import { CommunityTheme, StatusMessage } from "@/constants/communities/types";
import { PostReport, PostThemeReport } from "@/constants/reports/types";
import { clearDrawingLayer, getFeatureGeometryWKT } from "@/constants/utils";
import { getReportSketch, REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import ReportForm from "./forms/ReportForm";
import { useCallback } from "react";

interface Props {
    handleCloseDrawer: () => void;
}

const EditReport: React.FC<Props> = ({ handleCloseDrawer }) => {
    const { community, addAlertMessage } = useCommunityStore();
    const { reports, selectedReport, setReports, setTableDrawerOpened } = useReportStore();

    const { map } = useMapStore();

    const { t } = useTranslation({ EditReport });

    const updateReport = useCallback(
        async ({
            description,
            selectedTheme,
            themeAttributes,
            filesUploaded = [],
            features,
            updateAttachments = false,
        }: {
            description?: string;
            selectedTheme: CommunityTheme;
            themeAttributes: PostThemeReport;
            filesUploaded?: File[];
            features: Feature[];
            updateAttachments?: boolean;
        }) => {
            if (!community || !map || !selectedReport) return;
            const mainFeature = features.find((f) => f.get("reportData") && f.get("main"));
            if (!mainFeature) return;

            const newReport: PostReport = {
                community: community.id,
                geometry: getFeatureGeometryWKT(mainFeature),
                attributes: { community: community.id, theme: selectedTheme.theme, attributes: themeAttributes },
            };

            if (description !== undefined) {
                newReport.comment = description;
            }

            if (features.length > 1) {
                const sketchValue = getReportSketch(features, map, true);
                newReport.sketch = sketchValue;
            }

            try {
                const reportUpdated = await updateCommunityReport(newReport, selectedReport.id);

                if (!reportUpdated) {
                    addAlertMessage(StatusMessage.error, t("report_updated_error"));
                    return;
                }

                if (updateAttachments && filesUploaded.length) {
                    const attachmentsUploaded = await postCommunityReportAttachments({ ...reportUpdated, id: selectedReport.id }, filesUploaded);
                    if (!attachmentsUploaded || !attachmentsUploaded.length) {
                        addAlertMessage(StatusMessage.error, t("report_document_uploaded_error"));
                    } else {
                        reportUpdated.attachments = attachmentsUploaded;
                    }
                }

                addAlertMessage(StatusMessage.success, t("report_updated_success", { reportId: selectedReport.id }));

                const newReports = (() => {
                    const filtered = reports.filter((r) => r.id !== selectedReport.id);
                    const original = reports.find((r) => r.id === selectedReport.id) || {};
                    const mergedReport = { ...original, ...reportUpdated };
                    return [...filtered, mergedReport];
                })();

                setReports(newReports, true);
                clearDrawingLayer(map);
            } catch {
                addAlertMessage(StatusMessage.error, t("report_updated_error"));
                throw new Error();
            }
        },
        [community, map, selectedReport, reports, addAlertMessage, t, setReports]
    );

    if (!community || !map || !selectedReport) return null;

    const handleDeleteReport = async () => {
        try {
            const attachmentsDeleted = await deleteCommunityReportAllAttachments(selectedReport);
            if (!attachmentsDeleted) {
                addAlertMessage(StatusMessage.error, t("report_document_deleted_error"));
                return;
            }

            const reportDeleted = await deleteCommunityReportAPI(selectedReport);
            if (!reportDeleted) {
                addAlertMessage(StatusMessage.error, t("report_deleted_error"));
                return;
            }
            addAlertMessage(StatusMessage.success, t("report_deleted_success", { reportId: selectedReport.id }));
            const reportLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE);
            const reportSource = reportLayer?.getSource() as VectorSource;

            const filteredFeatures = reportSource.getFeatures().filter((f) => {
                const reportData = f.get("reportData");
                return reportData?.id === selectedReport.id;
            });

            reportSource.removeFeatures(filteredFeatures);
            setReports([...reports.filter((report) => report.id !== selectedReport.id)], true);
            handleCloseDrawer();
            clearDrawingLayer(map);
        } catch {
            addAlertMessage(StatusMessage.error, t("report_document_deleted_error"));
            throw new Error();
        }
    };

    const handleUpdateReport = async (
        selectedTheme: CommunityTheme,
        themeAttributes: PostThemeReport,
        description: string,
        filesUploaded: File[],
        features: Feature[]
    ) => {
        return updateReport({ selectedTheme, themeAttributes, description, filesUploaded, features });
    };

    const handleUpdateReportSketch = async (selectedTheme: CommunityTheme, themeAttributes: PostThemeReport, features: Feature[]) => {
        return updateReport({ selectedTheme, themeAttributes, features });
    };

    const handleUpdateReportTheme = async (selectedTheme: CommunityTheme, themeAttributes: PostThemeReport, features: Feature[]) => {
        return updateReport({ selectedTheme, themeAttributes, features });
    };

    const handleUpdateReportDescription = async (selectedTheme: CommunityTheme, themeAttributes: PostThemeReport, description: string, features: Feature[]) => {
        return updateReport({ selectedTheme, themeAttributes, description, features });
    };

    const handleUpdateReportDocument = async (
        selectedTheme: CommunityTheme,
        themeAttributes: PostThemeReport,
        description: string,
        filesUploaded: File[],
        features: Feature[]
    ) => {
        return updateReport({ selectedTheme, themeAttributes, description, features, filesUploaded, updateAttachments: true });
    };

    const handleCloseEditReportDrawer = () => {
        handleCloseDrawer();
        setTableDrawerOpened(true);
    };

    return (
        <>
            <ReportForm
                handleClose={handleCloseEditReportDrawer}
                handleDelete={handleDeleteReport}
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
