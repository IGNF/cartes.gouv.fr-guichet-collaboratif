import { useEffect, useState } from "react";
import { useCommunityStore, useMapStore } from "@/store";

import "./report.css";
import { CommunityTheme, StatusMessage } from "@/constants/communities/types";
import { postCommunityReport } from "@/api/reportsData";
import DrawerComponent from "@/components/DrawerComponent";
import { ParamsReport, PostReport, PostThemeReport } from "@/constants/reports/types";
import VectorSource from "ol/source/Vector";
import { getLonLatFromFeature, refreshReportLayer } from "@/constants/utils";
import FormReport from "./ReportForm";
import { postCommunityReportAttachments } from "@/api/attachmentData";

const CreateReportDrawer = () => {
    const [drawerOpened, setDrawerOpened] = useState<boolean>(false);
    const [params, setParams] = useState<ParamsReport | null>(null);

    const { community, addAlertMessage } = useCommunityStore();
    const { map } = useMapStore();

    const openDrawer = (event: Event) => {
        const customEvent = event as CustomEvent;
        setParams(customEvent.detail);
        setDrawerOpened(true);
    };

    useEffect(() => {
        document.addEventListener("create-report-event", openDrawer);

        return () => {
            document.removeEventListener("create-report-event", openDrawer);
        };
    });

    const handleSubmit = async (selectedTheme: CommunityTheme, themeAttributes: PostThemeReport, description: string, filesUpload: File[]) => {
        if (!community) return;
        const newReport: PostReport = {
            community: community?.id,
            geometry: `POINT(${getLonLatFromFeature(params?.feature).join(" ")})`,
            comment: description,
            attributes: { community: community?.id, theme: selectedTheme.theme, attributes: themeAttributes },
        };

        const reportCreated = await postCommunityReport(newReport);
        if (!reportCreated) {
            addAlertMessage(StatusMessage.error, "Erreur dans la création du signalement");
            return;
        }
        if (filesUpload.length) {
            const documentUploaded = await postCommunityReportAttachments({ ...reportCreated, id: reportCreated.id }, filesUpload);

            if (!documentUploaded) {
                addAlertMessage(StatusMessage.error, "Erreur dans le chargement de document");
            } else {
                addAlertMessage(StatusMessage.success, "Chargement du document avec succès.");
            }
        }

        addAlertMessage(StatusMessage.success, "Votre signalement a été envoyé avec succès.");
        refreshReportLayer(map);
        handleCloseDrawer();
    };

    const handleCloseDrawer = () => {
        setDrawerOpened(false);
        if (!params) return;
        params.closeFunc();
        const mapCurrentLayers = map?.getAllLayers();
        if (mapCurrentLayers) {
            const drawerLayer = mapCurrentLayers[mapCurrentLayers?.length - 1];
            const source = drawerLayer?.getSource() as VectorSource;
            if (source) {
                source.removeFeature(params.feature);
            }
        }
    };

    return (
        <DrawerComponent anchor="left" isOpen={drawerOpened} onClose={handleCloseDrawer}>
            {params && drawerOpened ? <FormReport handleSubmit={handleSubmit} /> : <></>}
        </DrawerComponent>
    );
};

export default CreateReportDrawer;
