import { useCallback, useEffect, useState } from "react";
import { Feature, MapBrowserEvent } from "ol";
import Layer from "ol/layer/Layer";
import VectorSource from "ol/source/Vector";
import { Style } from "ol/style";
import { getClickedMapReport, getReportSketchFeatures, REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { clearClusterStyles } from "@/constants/reports/utils/cluster";
import { getCenterReportMessage, showCenterReportButtons } from "@/constants/utils";
import { ParamsReport, toolNames } from "@/constants/reports/types";
import { useCommunityStore, useMapStore, useReportStore } from "@/store";
import DrawerComponent from "@/components/DrawerComponent";
import ShowReport from "./ShowReport";
import CreateReport from "./CreateReport";

const ReportDrawer = () => {
    const [drawerOpened, setDrawerOpened] = useState<boolean>(false);
    const { mapWorkingLayer } = useMapStore();

    const { reports, selectedReport, editReport, selectedFeatures, setEditReport, setSelectedReport, setSelectedFeatures } = useReportStore();
    const { map, setClickedMapFeature } = useMapStore();
    const { alertMessages, removeAlertMessage } = useCommunityStore();

    const clusterLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE);
    const clusterSource = clusterLayer?.getSource() as VectorSource;

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
        setSelectedReport(null);
        setSelectedFeatures([]);
    }, [map, selectedReport, alertMessages, removeAlertMessage, setEditReport, setSelectedFeatures, setSelectedReport]);

    const handleSingleClick = useCallback(
        (evt: MapBrowserEvent) => {
            if (selectedFeatures?.find((f) => f?.get("new"))) return;
            if (editReport) return;
            const features: { feature: Feature; zIndex: number }[] = [];

            map?.forEachFeatureAtPixel(evt.pixel, function (feature) {
                const clickedFeature = feature as Feature;
                if (clickedFeature.get("geoservice")?.layer !== mapWorkingLayer && mapWorkingLayer !== REPORTS_LAYER_TYPE) return;
                if (mapWorkingLayer === REPORTS_LAYER_TYPE && clickedFeature.get("features")) {
                    getClickedMapReport({ feature: clickedFeature, map, pixel: evt.pixel, clusterSource, features, handleCloseDrawer });
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
                        const reportFeatures = clusterSource.getFeatures().filter((f) => f.get("reportData")?.id === selectedReport.id);
                        clusterSource.removeFeatures(reportFeatures?.filter((f) => !f.get("main")));
                    }
                    const report = topFeature.feature.get("reportData");
                    if (report) {
                        const selectedReportFeatures = getReportSketchFeatures(report);
                        clusterSource?.addFeatures(selectedReportFeatures);
                        setSelectedFeatures([topFeature.feature, ...selectedReportFeatures]);
                        setSelectedReport(report);
                    }
                } else {
                    setClickedMapFeature(topFeature.feature);
                }
            }
        },
        [
            map,
            clusterSource,
            selectedReport,
            selectedFeatures,
            editReport,
            mapWorkingLayer,
            setSelectedReport,
            setSelectedFeatures,
            handleCloseDrawer,
            setClickedMapFeature,
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
                } else if (f.get("geoservice")?.layer === mapWorkingLayer) {
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
        [map, selectedFeatures, mapWorkingLayer]
    );

    const handleClusterChange = useCallback(() => {
        if (!selectedReport || !drawerOpened) return;
        const clusterFeatures = clusterSource?.getFeatures();
        if (clusterFeatures) {
            const allFeatures = clusterFeatures.map((fc) => fc.get("features") || fc).flat();
            if (selectedFeatures.length > 1) {
                const sketchExist = allFeatures.find((fc) => fc.get("reportData")?.id === selectedReport?.id && !fc.get("main"));
                if (!sketchExist) {
                    clusterSource.addFeatures(selectedFeatures.filter((f) => !f.get("main")));
                }
            }
        }
    }, [clusterSource, selectedReport, selectedFeatures, drawerOpened]);

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
            clearClusterStyles(clusterSource);
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
                    toolButton.click();
                }
                setDrawerOpened(true);
            }
        },
        [drawerOpened, clusterSource, setDrawerOpened]
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
    }, [drawerOpened, selectedReport, handleDrawingAdd]);

    return (
        <DrawerComponent anchor="left" isOpen={drawerOpened} create={!selectedReport} onClose={handleCloseDrawer}>
            <>
                {drawerOpened ? (
                    selectedReport ? (
                        <ShowReport handleCloseDrawer={handleCloseDrawer} />
                    ) : (
                        <CreateReport handleCloseDrawer={handleCloseDrawer} />
                    )
                ) : null}
            </>
        </DrawerComponent>
    );
};

export default ReportDrawer;
