import { useCommunityStore, useMapStore } from "@/store";

import "./report.css";
import { CommunityTheme, StatusMessage } from "@/constants/communities/types";
import { postCommunityReport } from "@/api/reportsData";
import { CommunityReport, PostReport, PostThemeReport } from "@/constants/reports/types";
import { clearDrawingLayer, getFeatureGeometryWKT } from "@/constants/utils";
import ReportForm from "./ReportForm";
import { postCommunityReportAttachments } from "@/api/attachmentData";
import { Feature } from "ol";
import { getReportSketch } from "@/constants/reports/utils";
import { useState } from "react";

interface Props {
    handleCloseDrawer: () => void;
}

const CreateReport: React.FC<Props> = ({ handleCloseDrawer }) => {
    const { community, reports, setCommunityReports, addAlertMessage } = useCommunityStore();
    const { map } = useMapStore();

    const [currentReport, setCurrentReport] = useState<CommunityReport | null>(null);

    if (!community || !map) return;

    const handleSubmit = async (
        selectedTheme: CommunityTheme,
        themeAttributes: PostThemeReport,
        description: string,
        filesUpload: File[],
        features: Feature[]
    ) => {
        const mainFeature = features.find((f) => f.get("main"));
        if (!mainFeature) return;
        const newReport: PostReport = {
            community: community?.id,
            geometry: getFeatureGeometryWKT(mainFeature),
            comment: description,
            attributes: { community: community?.id, theme: selectedTheme.theme, attributes: themeAttributes },
        };

        if (features.length > 1) {
            newReport.sketch = getReportSketch(features, map);
        }
        const reportCreated: CommunityReport | null = currentReport ?? (await postCommunityReport(newReport));
        if (!reportCreated) {
            addAlertMessage(StatusMessage.error, "Erreur dans la création du signalement");
            throw Error;
        } else {
            setCurrentReport(reportCreated);
        }

        if (filesUpload.length) {
            const documentUploaded = await postCommunityReportAttachments({ ...reportCreated, id: reportCreated.id }, filesUpload);
            if (!documentUploaded) {
                addAlertMessage(StatusMessage.error, "Erreur dans le chargement de document");
                throw Error;
            } else {
                addAlertMessage(StatusMessage.success, "Chargement du document avec succès.");
                setCurrentReport(null);
            }
        }

        addAlertMessage(StatusMessage.success, "Votre signalement a été envoyé avec succès.");

        setCommunityReports([...reports, reportCreated]);
        clearDrawingLayer(map);
        handleCloseDrawer();
    };

    return <ReportForm handleSubmit={handleSubmit} handleClose={handleCloseDrawer} />;
};

export default CreateReport;
