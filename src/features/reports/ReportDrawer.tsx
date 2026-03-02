import { useCallback, useEffect, useMemo } from "react";
import Layer from "ol/layer/Layer";
import VectorSource from "ol/source/Vector";
import { useGetUserProfileAPI } from "@/api/userData";
import { useCommunityStore, useLocalStorageStore, useMapStore, useReportStore, useUserStore } from "@/store";
import { hasReportParams, REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { getCenterReportMessage, handleShowOnMap, showCenterReportButtons, STATUS_NOT_ALLOWED } from "@/constants/utils";
import { clearClusterStyles } from "@/constants/reports/utils/cluster";
import { CommunityReport, ParamsReport, toolNames } from "@/constants/reports/types";
import DrawerComponent from "@/components/DrawerComponent";
import ShowReport from "./ShowReport";
import CreateReport from "./CreateReport";
import TableReportDrawer from "./table/TableReportDrawer";
import OpenReplyReportModal from "./forms/OpenReplyReportModal";
import EditReport from "./EditReport";
import Button from "@codegouvfr/react-dsfr/Button";
import { useTranslation } from "@/i18n";
import MapListnerHandlers from "../navigation/controls/custom-controls/interactions/MapListnerHandlers";
import { getCommunityReportById } from "@/api/reportsData";
import { useSearchParams, useNavigate } from "react-router-dom";

const ReportDrawer = () => {
    const { user } = useUserStore();
    const navigate = useNavigate();

    const {
        reports,
        selectedReport,
        editReport,
        setEditReport,
        setSelectedReport,
        setSelectedFeatures,
        drawerOpened,
        setDrawerOpened,
        tableDrawerOpened,
        responseDrawerOpened,
        setResponseDrawerOpened,
        reportTableWidth,
        setTableDrawerOpened,
    } = useReportStore();

    const { localStorageData } = useLocalStorageStore();

    const { map, setClickedControl } = useMapStore();
    const { alertMessages, removeAlertMessage } = useCommunityStore();

    const reportClusterLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE && layer.getSource() instanceof VectorSource);
    const reportClusterSource = reportClusterLayer?.getSource() as VectorSource;

    const { community } = useCommunityStore();

    const { data: userData } = useGetUserProfileAPI();
    const { t } = useTranslation({ ReportDrawer });
    const [searchParams] = useSearchParams();

    const handleCloseDrawer = useCallback(() => {
        if (!selectedReport) {
            const drawingLayer = map?.getAllLayers().find((layer: Layer & { gpResultLayerId?: string }) => layer.gpResultLayerId === "drawing");
            const drawingSource = drawingLayer?.getSource() as VectorSource;
            if (drawingSource) {
                const newFeatures = drawingSource?.getFeatures()?.filter((f) => f.get("new")) || [];
                drawingSource.removeFeatures(newFeatures);
            }
        } else {
            const reportLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE);
            const reportSource = reportLayer?.getSource() as VectorSource;
            const clusterFeatures = reportSource
                ?.getFeatures()
                .map((f) => f.get("features") || f)
                .flat();
            const reportFeatures = clusterFeatures.filter((fc) => fc && !fc.get("main") && fc.get("reportData")?.id === selectedReport.id);

            reportSource?.removeFeatures(reportFeatures);
        }

        const isNotified = getCenterReportMessage(alertMessages);
        if (isNotified) {
            removeAlertMessage(isNotified.id);
        }

        if (searchParams.has("report")) {
            const newParams = new URLSearchParams(searchParams);
            newParams.delete("report");
            const newSearch = newParams.toString();
            navigate(newSearch ? `?${newSearch}` : window.location.pathname, { replace: true });
        }

        showCenterReportButtons(false);
        setDrawerOpened(false);
        setEditReport(false);
        setTableDrawerOpened(false);
        setSelectedReport(null);
        setSelectedFeatures([]);
    }, [
        selectedReport,
        alertMessages,
        searchParams,
        navigate,
        setDrawerOpened,
        setEditReport,
        editReport,
        setTableDrawerOpened,
        tableDrawerOpened,
        setSelectedReport,
        setSelectedFeatures,
        map,
        removeAlertMessage,
    ]);

    const handleDrawingAdd = useCallback(
        (e: Event) => {
            clearClusterStyles(reportClusterSource);
            const customEvent = e as CustomEvent<ParamsReport>;
            customEvent.detail.feature.set("new", true);
            if (customEvent.detail.geomType === "Point" && !drawerOpened) {
                customEvent.detail.feature.set("main", true);
                const toolButton = document.querySelector(`button[id*="${toolNames.point}"]`) as HTMLButtonElement | null;
                const creatButton = document.querySelector(`button[id^="GPshowDrawingPicto-"]`) as HTMLButtonElement | null;
                if (creatButton && creatButton.classList.contains("active")) {
                    creatButton.classList.remove("active");
                }

                if (toolButton && toolButton.classList.contains("drawing-tool-active")) {
                    setClickedControl(null);
                }
                setDrawerOpened(true);
            }
        },
        [drawerOpened, reportClusterSource, setDrawerOpened, setClickedControl]
    );

    useEffect(() => {
        if (!drawerOpened) {
            document.addEventListener("create-report-event", handleDrawingAdd);
            if (selectedReport) {
                setDrawerOpened(true);
            }
        } else {
            document.removeEventListener("create-report-event", handleDrawingAdd);
        }

        return () => {
            document.removeEventListener("create-report-event", handleDrawingAdd);
        };
    }, [drawerOpened, selectedReport, handleDrawingAdd, setDrawerOpened]);

    useEffect(() => {
        if (drawerOpened) {
            setTableDrawerOpened(false);
            setResponseDrawerOpened(false);
        } else if (responseDrawerOpened) {
            setDrawerOpened(false);
            setTableDrawerOpened(false);
        } else if (tableDrawerOpened) {
            setDrawerOpened(false);
            setResponseDrawerOpened(false);
        }
    }, [drawerOpened, responseDrawerOpened, setDrawerOpened, setResponseDrawerOpened, setTableDrawerOpened, tableDrawerOpened]);

    const isAdmin = useMemo(() => {
        const currentUser = userData?.communitiesMember?.filter((cm) => cm.communityId === String(community?.id));
        return Array.isArray(currentUser) ? currentUser.some((role) => role.role === "admin") : false;
    }, [userData, community?.id]);

    const isOwner = Number(user?.id) === Number(selectedReport?.author?.id);

    useEffect(() => {
        if (drawerOpened && selectedReport && (isAdmin || isOwner)) {
            setEditReport(true);
        } else {
            setEditReport(false);
        }
    }, [drawerOpened, selectedReport, isAdmin, isOwner, setEditReport]);

    const reportIdParam = searchParams.get("report");

    const clusterLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE);
    const clusterSource = clusterLayer?.getSource() as VectorSource;

    const showOnMap = useCallback(
        (report: CommunityReport) => {
            handleShowOnMap(report, map, clusterSource, localStorageData, t, reportTableWidth);
        },
        [map, clusterSource, localStorageData, t, reportTableWidth]
    );

    useEffect(() => {
        if (hasReportParams()) {
            setTableDrawerOpened(true);
        }
    }, [setTableDrawerOpened, setEditReport]);

    useEffect(() => {
        if (!reportIdParam) return;
        setDrawerOpened(false);
        setEditReport(false);
        const id = Number(reportIdParam);
        const local = reports.find((r) => Number(r.id) === id);
        if (local) {
            setSelectedReport(local);
            setDrawerOpened(true);
            return;
        }

        (async () => {
            const report = await getCommunityReportById(id);
            if (report) {
                setSelectedReport(report);
                showOnMap(report);
                setDrawerOpened(true);
            }
        })();
    }, [reportIdParam, reports, setSelectedReport, setEditReport, setDrawerOpened, showOnMap]);

    return (
        <>
            <DrawerComponent
                anchor="left"
                isOpen={drawerOpened || tableDrawerOpened}
                create={!selectedReport}
                onClose={handleCloseDrawer}
                isListingReports={tableDrawerOpened}
            >
                <>
                    {drawerOpened ? (
                        <>
                            <div className="drawer-close">
                                <Button
                                    className="fr-icon--lg"
                                    iconId="ri-close-line"
                                    onClick={handleCloseDrawer}
                                    priority="tertiary no outline"
                                    title="Fermer"
                                    size="medium"
                                >
                                    {t("close")}
                                </Button>
                            </div>
                            {!selectedReport ? (
                                <CreateReport handleCloseDrawer={handleCloseDrawer} />
                            ) : !STATUS_NOT_ALLOWED.includes(selectedReport.status) && (isAdmin || isOwner) ? (
                                <EditReport handleCloseDrawer={handleCloseDrawer} />
                            ) : (
                                <ShowReport handleCloseDrawer={handleCloseDrawer} />
                            )}
                        </>
                    ) : tableDrawerOpened ? (
                        <TableReportDrawer handleCloseDrawer={handleCloseDrawer} />
                    ) : null}
                </>
            </DrawerComponent>
            <OpenReplyReportModal onClose={() => setResponseDrawerOpened(false)} />
            <MapListnerHandlers handleCloseDrawer={handleCloseDrawer} />
        </>
    );
};

export default ReportDrawer;
