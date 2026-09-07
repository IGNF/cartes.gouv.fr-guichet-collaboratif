import { useMemo, useState } from "react";
import { isAxiosError } from "axios";
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

const getApiErrorMessage = (error: unknown, fallback: string): string => {
    if (!isAxiosError(error)) return fallback;

    const data: unknown = error.response?.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
        const apiError = data as Record<string, unknown>;
        const message = apiError.message ?? apiError.detail;
        if (typeof message === "string") return message;
    }

    return error.message || fallback;
};

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

        if (!mainFeature) {
            addAlertMessage(StatusMessage.error, t("report_created_error"));
            throw new Error("Cannot create a report without a location");
        }
        const newReport: PostReport = {
            community: community?.id,
            geometry: getFeatureGeometryWKT(mainFeature),
            comment: description,
            attributes: { community: community?.id, theme: selectedTheme.theme, attributes: themeAttributes },
        };

        if (features.length > 1) {
            newReport.sketch = getReportSketch(features, map);
        }

        let reportCreated: CommunityReport | null;
        try {
            reportCreated = currentReport ?? (await postCommunityReport(newReport));
        } catch (error) {
            addAlertMessage(StatusMessage.error, getApiErrorMessage(error, t("report_created_error")), 5000);
            return;
        }

        if (!reportCreated) {
            addAlertMessage(StatusMessage.error, t("report_created_error"));
            return;
        } else {
            setCurrentReport(reportCreated);
        }

        if (filesUpload.length) {
            let attachmentsUploaded: Awaited<ReturnType<typeof postCommunityReportAttachments>>;
            try {
                attachmentsUploaded = await postCommunityReportAttachments({ ...reportCreated, id: reportCreated.id }, filesUpload);
            } catch (error) {
                addAlertMessage(StatusMessage.error, getApiErrorMessage(error, t("report_document_uploaded_error")), 5000);
                return;
            }

            if (!attachmentsUploaded) {
                addAlertMessage(StatusMessage.error, t("report_document_uploaded_error"));
                return;
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
