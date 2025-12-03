import { useMemo, useState } from "react";
import { Feature } from "ol";
import { useTranslation } from "@/i18n";
import { postCommunityReportAttachments } from "@/api/attachmentData";
import { postCommunityReport } from "@/api/reportsData";
import { useCommunityStore, useMapStore, useReportStore } from "@/store";
import { CommunityReport, PostReport, PostThemeReport } from "@/constants/reports/types";
import { clearDrawingLayer, getFeatureGeometryWKT } from "@/constants/utils";
import { CommunityTheme, StatusMessage } from "@/constants/communities/types";
import { getReportSketch } from "@/constants/reports/utils";
import ReportForm from "./forms/ReportForm";
import CreateReportModifyInteraction from "./CreateReportModifyInteraction";

interface Props {
    handleCloseDrawer: () => void;
}

const CreateReport: React.FC<Props> = ({ handleCloseDrawer }) => {
    const { community, addAlertMessage } = useCommunityStore();
    const { reports, setReports, selectedFeatures } = useReportStore();
    const { map, clickedTool } = useMapStore();

    const [currentReport, setCurrentReport] = useState<CommunityReport | null>(null);

    const { t } = useTranslation({ CreateReport });

    const mainFeature = useMemo(() => selectedFeatures.find((f) => f.get("main")), [selectedFeatures]);

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
            addAlertMessage(StatusMessage.error, t("report_created_error"));
            throw Error;
        } else {
            setCurrentReport(reportCreated);
        }

        if (filesUpload.length) {
            const attachmentsUploaded = await postCommunityReportAttachments({ ...reportCreated, id: reportCreated.id }, filesUpload);

            if (!attachmentsUploaded) {
                addAlertMessage(StatusMessage.error, t("report_document_uploaded_error"));
                throw Error;
            } else {
                reportCreated.attachments = attachmentsUploaded;
                setCurrentReport(null);
            }
        }

        addAlertMessage(StatusMessage.success, t("report_created_success"));

        setReports([...reports, reportCreated]);
        clearDrawingLayer(map);
        handleCloseDrawer();
    };
    return (
        <>
            {mainFeature && !clickedTool.clicked && <CreateReportModifyInteraction />}
            <ReportForm handleSubmit={handleSubmit} handleClose={handleCloseDrawer} />;
        </>
    );
};

export default CreateReport;
