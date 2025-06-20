import DrawerComponent from "@/components/DrawerComponent";
import { CommunityReport, ParamsReport, toolNames } from "@/constants/reports/types";
import { useCommunityStore, useMapStore } from "@/store";
import { Feature, MapBrowserEvent } from "ol";
import { Style } from "ol/style";
import { useCallback, useEffect, useState } from "react";
import ShowReport from "./ShowReport";
import CreateReport from "./CreateReport";
import Layer from "ol/layer/Layer";
import VectorSource from "ol/source/Vector";

const ReportDrawer = () => {
    const [drawerOpened, setDrawerOpened] = useState<boolean>(false);
    const [selectedReport, setSelectedReport] = useState<CommunityReport | undefined>(undefined);

    const { reports } = useCommunityStore();
    const { map } = useMapStore();

    const handleSingleClick = useCallback(
        (evt: MapBrowserEvent<PointerEvent>) => {
            if (drawerOpened) return;
            const features: { feature: Feature; zIndex: number }[] = [];

            map?.forEachFeatureAtPixel(evt.pixel, function (feature) {
                const currentFeature = feature as Feature;
                const currentFeatureStyle = currentFeature.getStyle() as Style;
                const cuurentZIndex = "getStyle" in currentFeatureStyle ? (currentFeatureStyle?.getZIndex() ?? 1) : 1;
                if (currentFeature.get("new")) {
                    features.push({
                        feature: currentFeature,
                        zIndex: cuurentZIndex,
                    });
                    return;
                }
                if (currentFeature.get("reportData")) {
                    features.push({
                        feature: currentFeature,
                        zIndex: cuurentZIndex,
                    });
                    return;
                }
            });
            const topFeature = features[0];
            if (topFeature) {
                if (topFeature.feature.get("reportData")) {
                    setSelectedReport(topFeature.feature.get("reportData"));
                }
            }
        },
        [map, drawerOpened]
    );

    const handlePointerMove = useCallback(
        (evt: MapBrowserEvent<PointerEvent>) => {
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
            setSelectedReport(reports.find((r) => r.id === selectedReport.id));
        }
        return () => {
            map?.un("singleclick", handleSingleClick);
            map?.un("pointermove", handlePointerMove);
        };
    }, [map, reports, selectedReport, drawerOpened, handleSingleClick, handlePointerMove]);

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
            const createReportButton = document.querySelector(`button[id*="GPshowDrawingPicto"]`) as HTMLButtonElement | null;

            if (createReportButton) {
                if (!drawerOpened) {
                    if (createReportButton.getAttribute("aria-pressed") === "true") {
                        createReportButton.click();
                    }
                }

                if (selectedReport && !drawerOpened) {
                    setDrawerOpened(true);
                    if (createReportButton.getAttribute("aria-pressed") === "false") {
                        createReportButton.click();
                    }
                }
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
        }
        setSelectedReport(undefined);
        setDrawerOpened(false);
    };

    return (
        <DrawerComponent anchor="left" isOpen={drawerOpened} create={!selectedReport} onClose={handleCloseDrawer}>
            {drawerOpened ? (
                <>
                    {selectedReport ? (
                        <ShowReport selectedReport={selectedReport} handleCloseDrawer={handleCloseDrawer} />
                    ) : (
                        <CreateReport handleCloseDrawer={handleCloseDrawer} />
                    )}
                </>
            ) : (
                <></>
            )}
        </DrawerComponent>
    );
};

export default ReportDrawer;
