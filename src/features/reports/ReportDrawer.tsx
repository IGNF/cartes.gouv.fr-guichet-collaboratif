import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "@/i18n";
import { Feature, MapBrowserEvent } from "ol";
import Layer from "ol/layer/Layer";
import VectorSource from "ol/source/Vector";
import { Style } from "ol/style";
import { useGetUserProfileAPI } from "@/api/userData";
import { useCommunityStore, useMapStore, useReportStore, useUserStore } from "@/store";
import { HIT_DETECTION_TOLERENCE, FEATURE_TYPE_GEOSERVICE_PROPERTY } from "@/constants";
import { getClickedMapReport, getReportSketchFeatures, REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { getCenterReportMessage, showCenterReportButtons } from "@/constants/utils";
import { clearClusterStyles } from "@/constants/reports/utils/cluster";
import { ParamsReport, toolNames } from "@/constants/reports/types";
import Button from "@codegouvfr/react-dsfr/Button";
import DrawerComponent from "@/components/DrawerComponent";
import ShowReport from "./ShowReport";
import CreateReport from "./CreateReport";
import TableReportDrawer from "./table/TableReportDrawer";
import OpenReplyReportModal from "./forms/OpenReplyReportModal";
import EditReport from "./EditReport";
import { InteractionType } from "@/constants/communities/types";

const ReportDrawer = () => {
    const { t } = useTranslation({ ShowReport });
    const { mapWorkingLayer } = useMapStore();
    const { user } = useUserStore();

    const {
        reports,
        selectedReport,
        editReport,
        selectedFeatures,
        setEditReport,
        setSelectedReport,
        setSelectedFeatures,
        drawerOpened,
        setDrawerOpened,
        tableDrawerOpened,
        responseDrawerOpened,
        setTableDrawerOpened,
        setResponseDrawerOpened,
    } = useReportStore();

    const { map, setClickedMapFeature, setClickableFeatures, setClickedControl } = useMapStore();
    const { alertMessages, removeAlertMessage } = useCommunityStore();

    const reportClusterLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE && layer.getSource() instanceof VectorSource);
    const reportClusterSource = reportClusterLayer?.getSource() as VectorSource;

    const clickableLayer = map?.getAllLayers().find((layer) => layer.get("name") === mapWorkingLayer && layer.getSource() instanceof VectorSource);
    const clickableSource = clickableLayer?.getSource() as VectorSource;

    const { community } = useCommunityStore();

    const { data: userData } = useGetUserProfileAPI();

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

        showCenterReportButtons(false);

        setDrawerOpened(false);
        setEditReport(false);
        setTableDrawerOpened(!tableDrawerOpened && true);
        setSelectedReport(null);
        setSelectedFeatures([]);
    }, [
        map,
        selectedReport,
        alertMessages,
        removeAlertMessage,
        setEditReport,
        setSelectedFeatures,
        setSelectedReport,
        setDrawerOpened,
        setTableDrawerOpened,
        tableDrawerOpened,
    ]);

    const handleSingleClick = useCallback(
        (evt: MapBrowserEvent) => {
            if (!map) return;
            if (selectedFeatures?.find((f) => f?.get("new"))) return;
            if (editReport) return;
            const features: { feature: Feature; zIndex: number }[] = [];

            const coordinate = map?.getCoordinateFromPixel(evt.pixel);
            const resolution = map?.getView().getResolution();
            const buffer = (resolution || 0) * HIT_DETECTION_TOLERENCE;
            const extent = [coordinate![0] - buffer, coordinate![1] - buffer, coordinate![0] + buffer, coordinate![1] + buffer];

            const featuresAtPixel = map?.getFeaturesAtPixel(evt.pixel);
            if (!featuresAtPixel?.length) return;

            const selectInteraction = map
                ?.getInteractions()
                .getArray()
                .find((i) => i.get("type") === InteractionType.SELECT || i.get("type") === InteractionType.REMOVE);

            if (clickableSource && "getFeaturesInExtent" in clickableSource) {
                const featuresAt = clickableSource?.getFeaturesInExtent!(extent);

                if (featuresAt && featuresAt.length && !selectInteraction) {
                    setClickableFeatures(featuresAt);
                    if (featuresAt.length > 1) return;
                }
            }

            featuresAtPixel?.forEach((feature) => {
                const clickedFeature = feature as Feature;
                if (clickedFeature.get(FEATURE_TYPE_GEOSERVICE_PROPERTY)?.layer !== mapWorkingLayer && mapWorkingLayer !== REPORTS_LAYER_TYPE) return;
                if (mapWorkingLayer === REPORTS_LAYER_TYPE && clickedFeature.get("features")) {
                    getClickedMapReport({ feature: clickedFeature, map, pixel: evt.pixel, clusterSource: reportClusterSource, features, handleCloseDrawer });
                } else {
                    const currentFeatureStyle = clickedFeature.getStyle() as Style;
                    const currentZIndex = currentFeatureStyle && "getStyle" in currentFeatureStyle ? (currentFeatureStyle?.getZIndex() ?? 1) : 1;

                    features.push({
                        feature: clickedFeature,
                        zIndex: currentZIndex,
                    });
                }
            });

            const topFeature = features[0];
            if (topFeature) {
                if (mapWorkingLayer === REPORTS_LAYER_TYPE) {
                    if (selectedReport) {
                        const reportFeatures = reportClusterSource.getFeatures().filter((f) => f.get("reportData")?.id === selectedReport.id);
                        reportClusterSource.removeFeatures(reportFeatures?.filter((f) => !f.get("main")));
                    }
                    const report = topFeature.feature.get("reportData");
                    if (report) {
                        const selectedReportFeatures = getReportSketchFeatures(report);
                        reportClusterSource?.addFeatures(selectedReportFeatures);
                        setSelectedFeatures([topFeature.feature, ...selectedReportFeatures]);
                        setSelectedReport(report);
                    }
                } else {
                    if (!selectInteraction) setClickedMapFeature(topFeature.feature);
                }
            }
        },
        [
            map,
            reportClusterSource,
            selectedReport,
            selectedFeatures,
            editReport,
            mapWorkingLayer,
            clickableSource,
            setSelectedReport,
            setSelectedFeatures,
            handleCloseDrawer,
            setClickedMapFeature,
            setClickableFeatures,
        ]
    );

    const handlePointerMove = useCallback(
        (evt: MapBrowserEvent) => {
            const features = map?.getFeaturesAtPixel(evt.pixel);

            const feature = features?.find((f) => {
                if (mapWorkingLayer === REPORTS_LAYER_TYPE) {
                    const fCluster = f.get("features");
                    if (fCluster?.length > 1) return fCluster[0];
                    return fCluster?.find((fc: Feature) => fc.get("reportData") || fc.get("new"));
                } else if (clickableSource?.hasFeature(f as Feature)) {
                    return f;
                }
                return null;
            }) as Feature;

            const targetElement = map?.getTargetElement();
            if (targetElement) {
                if (feature) {
                    if (selectedFeatures.length && !selectedFeatures.includes(feature) && selectedFeatures.find((f) => f.get("new"))) {
                        targetElement.style.cursor = "";
                        return;
                    }
                    targetElement.style.cursor = "pointer";
                    return;
                } else {
                    targetElement.style.cursor = "";
                    return;
                }
            }
        },
        [map, selectedFeatures, mapWorkingLayer, clickableSource]
    );

    const handleClusterChange = useCallback(() => {
        if (!selectedReport || !drawerOpened) return;
        const clusterFeatures = reportClusterSource?.getFeatures();
        if (clusterFeatures) {
            const allFeatures = clusterFeatures.map((fc) => fc.get("features") || fc).flat();
            if (selectedFeatures.length > 1) {
                const sketchExist = allFeatures.find((fc) => fc.get("reportData")?.id === selectedReport?.id && !fc.get("main"));
                if (!sketchExist) {
                    reportClusterSource.addFeatures(selectedFeatures.filter((f) => !f.get("main")));
                }
            }
        }
    }, [reportClusterSource, selectedReport, selectedFeatures, drawerOpened]);

    useEffect(() => {
        if (!map) return;
        map.on("singleclick", handleSingleClick);
        map.on("pointermove", handlePointerMove);
        map.getView()?.on("change:resolution", handleClusterChange);
        if (selectedReport) {
            setSelectedReport(reports.find((r) => r.id === selectedReport.id) ?? null);
        }
        return () => {
            map.un("singleclick", handleSingleClick);
            map.un("pointermove", handlePointerMove);
            map.getView().un("change:resolution", handleClusterChange);
        };
    }, [map, reports, selectedReport, drawerOpened, handleSingleClick, handlePointerMove, setSelectedReport, handleClusterChange]);

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
            if (selectedReport && !drawerOpened) {
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
        const currentUser = userData?.communitiesMember?.filter((cm) => cm.communityId === community?.id);
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

    return (
        <>
            <DrawerComponent anchor="left" isOpen={drawerOpened || tableDrawerOpened} create={!selectedReport} onClose={handleCloseDrawer}>
                <>
                    {drawerOpened ? (
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
                            {!selectedReport ? (
                                <CreateReport handleCloseDrawer={handleCloseDrawer} />
                            ) : isAdmin || isOwner ? (
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
        </>
    );
};

export default ReportDrawer;
