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

    const { reports, selectedReport, setEditReport, setSelectedReport, setSelectedFeatures } = useReportStore();
    const { map } = useMapStore();

    const reportLayer = map?.getAllLayers().find((layer) => layer.get("title") === "Signalements");
    const reportSource = reportLayer?.getSource() as VectorSource;

    const handleSingleClick = useCallback(
        (evt: MapBrowserEvent) => {
            const features: { feature: Feature; zIndex: number }[] = [];

            map?.forEachFeatureAtPixel(evt.pixel, function (feature) {
                const currentFeature = feature as Feature;
                const currentFeatureStyle = currentFeature.getStyle() as Style;
                const cuurentZIndex = "getStyle" in currentFeatureStyle ? (currentFeatureStyle?.getZIndex() ?? 1) : 1;
                if (currentFeature.get("new") && currentFeature.get("main")) {
                    features.push({
                        feature: currentFeature,
                        zIndex: cuurentZIndex,
                    });
                    return;
                }
                if (currentFeature.get("reportData") && currentFeature.get("main")) {
                    features.push({
                        feature: currentFeature,
                        zIndex: cuurentZIndex,
                    });
                    return;
                }
            });
            const topFeature = features[0];
            if (topFeature) {
                if (selectedReport) {
                    const reportFeatures = reportSource.getFeatures().filter((f) => f.get("reportData").id === selectedReport.id);
                    reportSource.removeFeatures(reportFeatures?.filter((f) => !f.get("main")));
                }
                const report = topFeature.feature.get("reportData");
                if (report) {
                    const selectedReportFeatures = getReportSketchFeatures(report);
                    reportSource?.addFeatures(selectedReportFeatures);
                    setSelectedFeatures(reportSource?.getFeatures().filter((f) => f.get("reportData").id === report.id) || []);
                    setEditReport(false);
                    setSelectedReport(report);
                }
            }
        },
        [map, reportSource, selectedReport, setSelectedReport, setSelectedFeatures, setEditReport]
    );

    const handlePointerMove = useCallback(
        (evt: MapBrowserEvent) => {
            const features = map?.getFeaturesAtPixel(evt.pixel);
            const feature = features?.find((f) => f.get("reportData") || f.get("new"));

            const targetElement = map?.getTargetElement();
            if (targetElement) {
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
        [map]
    );

    useEffect(() => {
        map?.on("singleclick", handleSingleClick);
        map?.on("pointermove", handlePointerMove);
        if (selectedReport) {
            setSelectedReport(reports.find((r) => r.id === selectedReport.id) ?? null);
        }
        return () => {
            map?.un("singleclick", handleSingleClick);
            map?.un("pointermove", handlePointerMove);
        };
    }, [map, reports, selectedReport, drawerOpened, handleSingleClick, handlePointerMove, setSelectedReport]);

    const handleDrawingAdd = useCallback(
        (e: Event) => {
            const customEvent = e as CustomEvent<ParamsReport>;
            customEvent.detail.feature.set("new", true);
            if (customEvent.detail.geomType === "Point" && !drawerOpened) {
                customEvent.detail.feature.set("main", true);
                const toolButton = document.querySelector(`button[id*="${toolNames.point}"]`) as HTMLButtonElement | null;

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
            const reportFeatures = reportSource.getFeatures().filter((f) => f.get("reportData").id === selectedReport.id);
            reportSource.removeFeatures(reportFeatures?.filter((f) => !f.get("main")));
        }
        setSelectedReport(null);
        setDrawerOpened(false);
        setEditReport(false);
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
