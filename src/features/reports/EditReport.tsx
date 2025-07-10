import { deleteCommunityReportAPI, updateCommunityReport } from "@/api/reportsData";
import { CommunityTheme, StatusMessage } from "@/constants/communities/types";
import { PostReport, PostThemeReport } from "@/constants/reports/types";
import { useCommunityStore, useMapStore, useReportStore } from "@/store";
import { deleteCommunityReportAllAttachments, postCommunityReportAttachments } from "@/api/attachmentData";
import { clearDrawingLayer, getFeatureGeometryWKT } from "@/constants/utils";
import { Feature } from "ol";
import VectorSource from "ol/source/Vector";
import { getReportSketch } from "@/constants/reports/utils";
import ReportForm from "./forms/ReportForm";

interface Props {
    handleCloseDrawer: () => void;
}

const EditReport: React.FC<Props> = ({ handleCloseDrawer }) => {
    const { community, addAlertMessage } = useCommunityStore();
    const { reports, selectedReport, setReports } = useReportStore();

    const { map } = useMapStore();

    if (!community || !map || !selectedReport) return null;

    const handleDeleteReport = async () => {
        try {
            const attachmentsDeleted = await deleteCommunityReportAllAttachments(selectedReport);
            if (!attachmentsDeleted) {
                addAlertMessage(StatusMessage.error, `Erreur dans la suppression des documents du signalement !`);
                return;
            }

            const reportDeleted = await deleteCommunityReportAPI(selectedReport);
            if (!reportDeleted) {
                addAlertMessage(StatusMessage.error, "Erreur dans la suppression du signalement !");
                return;
            }
            addAlertMessage(StatusMessage.success, `Le signalement ${selectedReport.id} est supprimé avec succès.`);
            const reportLayer = map?.getAllLayers().find((layer) => layer.get("title") === "Signalements");
            const reportSource = reportLayer?.getSource() as VectorSource;
            reportSource.removeFeatures(reportSource.getFeatures().filter((f) => f.get("reportData").id === selectedReport.id));
            setReports([...reports.filter((report) => report.id !== selectedReport.id)], true);
            handleCloseDrawer();
            clearDrawingLayer(map);
        } catch {
            addAlertMessage(StatusMessage.error, `Erreur dans la suppression des documents du signalement !`);
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
        const mainFeature = features.find((f) => f.get("reportData") && f.get("main"));
        if (!mainFeature) return;
        const newReport: PostReport = {
            community: community?.id,
            geometry: getFeatureGeometryWKT(mainFeature),
            comment: description,
            attributes: { community: community?.id, theme: selectedTheme.theme, attributes: themeAttributes },
        };

        if (features.length > 1) {
            newReport.sketch = getReportSketch(features, map, true);
        }

        try {
            const reportUpdated = await updateCommunityReport(newReport, selectedReport.id);

            if (!reportUpdated) {
                addAlertMessage(StatusMessage.error, "Erreur dans la mise à jour du signalement");
                return;
            }

            if (filesUploaded.length) {
                const attachmentsUploaded = await postCommunityReportAttachments({ ...reportUpdated, id: selectedReport.id }, filesUploaded);

                if (!attachmentsUploaded || !attachmentsUploaded.length) {
                    addAlertMessage(StatusMessage.error, "Erreur dans le chargement de document");
                } else {
                    reportUpdated.attachments = attachmentsUploaded;
                    addAlertMessage(StatusMessage.success, "Chargement du document avec succès.");
                }
            }
            addAlertMessage(StatusMessage.success, `Le signalement ${selectedReport.id} a été mis à jour avec succès.`);

            setReports([...reports.filter((report) => report.id !== selectedReport.id), reportUpdated], true);
            clearDrawingLayer(map);
        } catch {
            addAlertMessage(StatusMessage.error, "Erreur dans la mise à jour du signalement");
            throw new Error();
        }
    };

    return <ReportForm handleClose={handleCloseDrawer} handleDelete={handleDeleteReport} handleSubmit={handleUpdateReport} />;
};

export default EditReport;
