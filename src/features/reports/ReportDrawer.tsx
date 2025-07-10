import DrawerComponent from "@/components/DrawerComponent";
import { ParamsReport, toolNames } from "@/constants/reports/types";
import { useMapStore, useReportStore } from "@/store";
import { Feature, MapBrowserEvent } from "ol";
import { Style } from "ol/style";
import { useCallback, useEffect, useState } from "react";
import CreateReport from "./CreateReport";
import Layer from "ol/layer/Layer";
import VectorSource from "ol/source/Vector";
import ShowReport from "./ShowReport";
import { getReportSketchFeatures } from "@/constants/reports/utils";

const ReportDrawer = () => {
    const [drawerOpened, setDrawerOpened] = useState<boolean>(false);

    const { reports, selectedReport, editReport, selectedFeatures, setEditReport, setSelectedReport, setSelectedFeatures } = useReportStore();
    const { map } = useMapStore();

    const clusterLayer = map?.getAllLayers().find((layer) => layer.get("title") === "Signalements");
    const clusterSource = clusterLayer?.getSource() as VectorSource;

    const handleSingleClick = useCallback(
        (evt: MapBrowserEvent) => {
            if (selectedFeatures.find((f) => f.get("new"))) return;
            if (editReport) return;
            const features: { feature: Feature; zIndex: number }[] = [];

            map?.forEachFeatureAtPixel(evt.pixel, function (feature) {
                let currentFeature = feature as Feature;
                const currentFeatures = currentFeature.get("features");
                if (currentFeatures?.length === 1) {
                    currentFeature = currentFeatures[0];
                } else {
                    return;
                }
                const currentFeatureStyle = currentFeature.getStyle() as Style;
                const currentZIndex = currentFeatureStyle && "getStyle" in currentFeatureStyle ? (currentFeatureStyle?.getZIndex() ?? 1) : 1;
                if (currentFeature.get("new") && currentFeature.get("main")) {
                    features.push({
                        feature: currentFeature,
                        zIndex: currentZIndex,
                    });
                    return;
                }
                if (currentFeature.get("reportData") && currentFeature.get("main")) {
                    features.push({
                        feature: currentFeature,
                        zIndex: currentZIndex,
                    });
                    return;
                }
            });
            const topFeature = features[0];
            if (topFeature) {
                if (selectedReport) {
                    const reportFeatures = clusterSource.getFeatures().filter((f) => f.get("reportData").id === selectedReport.id);
                    clusterSource.removeFeatures(reportFeatures?.filter((f) => !f.get("main")));
                }
                const report = topFeature.feature.get("reportData");
                if (report) {
                    const selectedReportFeatures = getReportSketchFeatures(report);
                    clusterSource?.addFeatures(selectedReportFeatures);
                    setSelectedFeatures(clusterSource?.getFeatures().filter((f) => f.get("reportData").id === report.id) || []);

                    setSelectedReport(report);
                }
            }
        },
        [map, clusterSource, selectedReport, selectedFeatures, editReport, setSelectedReport, setSelectedFeatures]
    );

    const handlePointerMove = useCallback(
        (evt: MapBrowserEvent) => {
            const features = map?.getFeaturesAtPixel(evt.pixel);

            const feature = features?.find((f) => {
                const fCluster = f.get("features");
                if (fCluster?.length > 1) return null;
                return fCluster?.find((fc: Feature) => fc.get("reportData") || fc.get("new"));
            }) as Feature;

            const targetElement = map?.getTargetElement();
            if (targetElement && feature) {
                if (selectedFeatures.length && !selectedFeatures.includes(feature) && selectedFeatures.find((f) => f.get("new"))) {
                    targetElement.style.cursor = "";
                    return;
                }
                if (feature) {
                    const geomType = feature.getGeometry()?.getType();
                    if (geomType === "Point") {
                        targetElement.style.cursor = "pointer";
                    } else if (geomType === "LineString") {
                        targetElement.style.cursor = "crosshair";
                    } else if (geomType === "Polygon") {
                        targetElement.style.cursor = "grab";
                    }

                    return;
                }
                targetElement.style.cursor = "";
                return;
            }
        },
        [map, selectedFeatures]
    );

    const handleClusterChange = useCallback(() => {
        if (!selectedReport || !drawerOpened) return;
        console.log("hello");
        console.log(clusterSource, selectedFeatures);
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
        [drawerOpened, setDrawerOpened]
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

    const handleCloseDrawer = () => {
        if (!selectedReport) {
            const drawingLayer = map?.getAllLayers().find((layer: Layer & { gpResultLayerId?: string }) => layer.gpResultLayerId === "drawing");
            const drawingSource = drawingLayer?.getSource() as VectorSource;
            if (drawingSource) {
                const newFeatures = drawingSource?.getFeatures()?.filter((f) => f.get("new")) || [];
                drawingSource.removeFeatures(newFeatures);
            }
        } else {
            const reportLayer = map?.getAllLayers().find((layer) => layer.get("title") === "Signalements");
            const reportSource = reportLayer?.getSource() as VectorSource;
            const clusterFeatures = reportSource
                ?.getFeatures()
                .map((f) => f.get("features") || f)
                .flat();

            const reportFeatures = clusterFeatures.filter((fc) => fc && !fc.get("main") && fc.get("reportData")?.id === selectedReport.id);
            reportSource?.removeFeatures(reportFeatures);
        }
        setDrawerOpened(false);
        setEditReport(false);
        setSelectedReport(null);
        setSelectedFeatures([]);
    };

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
