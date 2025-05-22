import { deleteCommunityReport, updateCommunityReport } from "@/api/reportsData";
import DrawerComponent from "@/components/DrawerComponent";
import { CommunityTheme, StatusMessage } from "@/constants/communities/types";
import { CommunityReport, PostReport, PostThemeReport } from "@/constants/reports/types";
import { useCommunityStore, useMapStore } from "@/store";
import { useEffect, useState } from "react";
import FormReport from "./ReportForm";
import { deleteCommunityReportAllAttachments, postCommunityReportAttachments } from "@/api/attachmentData";
import { refreshReportLayer } from "@/constants/utils";

const ShowReportDrawer: React.FC = () => {
    const { community, reports, addAlertMessage } = useCommunityStore();
    const [drawerOpened, setDrawerOpened] = useState<boolean>(false);
    const [selectedReport, setSelectedReport] = useState<CommunityReport | undefined>(undefined);

    const { map } = useMapStore();

    useEffect(() => {
        map?.on("singleclick", function (evt) {
            map?.forEachFeatureAtPixel(evt.pixel, function (feature) {
                const mapReport: CommunityReport = feature.get("reportData");
                if (!mapReport) return;
                const reportData = reports.find((r) => r.id === mapReport.id);

                if (!reportData) return;

                setSelectedReport(reportData);
                setDrawerOpened(true);
            });
        });
        map?.on("pointermove", function (evt) {
            const features = map?.getFeaturesAtPixel(evt.pixel);
            const feature = features?.find((f) => f.get("reportData"));
            const targetElement = map?.getTargetElement();
            if (targetElement) {
                targetElement.style.cursor = feature ? "pointer" : "";
            }
        });
        if (selectedReport) {
            setSelectedReport(reports.find((r) => r.id === selectedReport.id));
        }
    }, [map, reports, selectedReport]);

    if (!community) return null;

    const handleCloseDrawer = () => {
        setDrawerOpened(false);
    };

    const handleDeleteReport = async () => {
        if (!selectedReport) return;

        const attachmentsDeleted = await deleteCommunityReportAllAttachments(selectedReport);
        if (!attachmentsDeleted) {
            addAlertMessage(StatusMessage.error, `Erreur dans la suppression des documents du signalement !`);
            return;
        }

        const reportDeleted = await deleteCommunityReport(selectedReport);
        if (!reportDeleted) {
            addAlertMessage(StatusMessage.error, "Erreur dans la suppression du signalement !");
            return;
        }
        addAlertMessage(StatusMessage.success, `Le signalement ${selectedReport.id} est supprimé avec succès.`);
        const mapCurrentLayers = map?.getAllLayers();
        const reportLayer = mapCurrentLayers?.find((l) => l.get("title") === "Signalements");
        if (reportLayer) {
            reportLayer.getSource()?.refresh();
        }
        handleCloseDrawer();
    };

    const handleUpdateReport = async (selectedTheme: CommunityTheme, themeAttributes: PostThemeReport, description: string, filesUploaded: File[]) => {
        if (!community || !selectedReport) return;

        const newReport: PostReport = {
            community: community?.id,
            geometry: selectedReport.geometry,
            comment: description,
            attributes: { community: community?.id, theme: selectedTheme.theme, attributes: themeAttributes },
        };

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
        refreshReportLayer(map);
    };

    return (
        <DrawerComponent anchor="left" isOpen={drawerOpened} onClose={handleCloseDrawer}>
            {drawerOpened ? (
                <FormReport
                    selectedReport={selectedReport}
                    handleClose={handleCloseDrawer}
                    handleDelete={handleDeleteReport}
                    handleSubmit={handleUpdateReport}
                />
            ) : (
                <></>
            )}
        </DrawerComponent>
    );
};

export default ShowReportDrawer;
