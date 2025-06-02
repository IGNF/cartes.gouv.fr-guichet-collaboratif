import DrawerComponent from "@/components/DrawerComponent";
import { CommunityReport } from "@/constants/reports/types";
import { useCommunityStore, useMapStore } from "@/store";
import { Feature } from "ol";
import { Style } from "ol/style";
import { useEffect, useState } from "react";
import ShowReport from "./ShowReport";
import CreateReport from "./CreateReport";

const ReportDrawer = () => {
    const [drawerOpened, setDrawerOpened] = useState<boolean>(false);
    const [selectedReport, setSelectedReport] = useState<CommunityReport | undefined>(undefined);

    const { reports } = useCommunityStore();
    const { map, clickedFeature, setClickedFeature } = useMapStore();

    useEffect(() => {
        map?.on("singleclick", function (evt) {
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
                if (!topFeature.feature.get("new")) {
                    setSelectedReport(topFeature.feature.get("reportData"));
                }
                setClickedFeature(topFeature.feature);
            }
        });
        map?.on("pointermove", function (evt) {
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
        });
        if (selectedReport) {
            setSelectedReport(reports.find((r) => r.id === selectedReport.id));
        }
    }, [map, reports, selectedReport, setClickedFeature]);

    useEffect(() => {
        const createReportButton = document.querySelector(`button[id*="GPshowDrawingPicto"]`) as HTMLButtonElement | null;

        if (createReportButton) {
            createReportButton.onclick = () => {
                if (createReportButton.getAttribute("aria-pressed") === "true") {
                    setDrawerOpened(true);
                }
            };
            if (clickedFeature) {
                setDrawerOpened(true);
                if (createReportButton.getAttribute("aria-pressed") === "false") {
                    createReportButton.click();
                }
            }
            if (!drawerOpened) {
                if (createReportButton.getAttribute("aria-pressed") === "true") {
                    createReportButton.click();
                }
            }
        }
    }, [clickedFeature, drawerOpened]);

    const handleCloseDrawer = () => {
        setSelectedReport(undefined);
        setDrawerOpened(false);
        setClickedFeature(null);
    };

    return (
        <DrawerComponent anchor="left" isOpen={drawerOpened} onClose={handleCloseDrawer}>
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
