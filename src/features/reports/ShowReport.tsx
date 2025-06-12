import { deleteCommunityReportAPI, updateCommunityReport } from "@/api/reportsData";
import { CommunityTheme, StatusMessage } from "@/constants/communities/types";
import { CommunityReport, PostReport, PostThemeReport } from "@/constants/reports/types";
import { useCommunityStore, useMapStore } from "@/store";
import FormReport from "./ReportForm";
import { deleteCommunityReportAllAttachments, postCommunityReportAttachments } from "@/api/attachmentData";
import { clearDrawingLayer, getLonLatFromFeature, getReportAllFeatures, getReportSketch } from "@/constants/utils";
import { Feature } from "ol";
import VectorSource from "ol/source/Vector";

interface Props {
    selectedReport: CommunityReport | undefined;
    handleCloseDrawer: () => void;
}

const ShowReport: React.FC<Props> = ({ selectedReport, handleCloseDrawer }) => {
    const { community, reports, setCommunityReports, addAlertMessage } = useCommunityStore();

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
            const reportFeatures = getReportAllFeatures(selectedReport);
            reportSource.removeFeatures(reportFeatures);
            setCommunityReports([...reports.filter((report) => report.id !== selectedReport.id)], true);
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
        const newReport: PostReport = {
            community: community?.id,
            geometry: `POINT(${getLonLatFromFeature(mainFeature)?.join(" ")})`,
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
                    addAlertMessage(StatusMessage.success, "Chargement du document avec succès.");
                }
            }
            addAlertMessage(StatusMessage.success, `Le signalement ${selectedReport.id} a été mis à jour avec succès.`);

            setCommunityReports([...reports.filter((report) => report.id !== selectedReport.id), reportUpdated], true);
            clearDrawingLayer(map);
        } catch {
            addAlertMessage(StatusMessage.error, "Erreur dans la mise à jour du signalement");
            throw new Error();
        }
    };

    return <FormReport selectedReport={selectedReport} handleClose={handleCloseDrawer} handleDelete={handleDeleteReport} handleSubmit={handleUpdateReport} />;
};

export default ShowReport;
