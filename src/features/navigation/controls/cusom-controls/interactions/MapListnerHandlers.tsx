import { FEATURE_TYPE_GEOSERVICE_PROPERTY, HIT_DETECTION_TOLERENCE } from "@/constants";
import { InteractionType } from "@/constants/communities/types";
import { getFeaturesInPixelBySource } from "@/constants/communities/utils";
import { getClickedMapReport, getReportSketchFeatures, REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { useMapStore, useReportStore } from "@/store";
import { Feature, MapBrowserEvent } from "ol";
import VectorSource from "ol/source/Vector";
import { Style } from "ol/style";
import { useCallback, useEffect } from "react";

interface Props {
    handleCloseDrawer: () => void;
}

const MapListnerHandlers: React.FC<Props> = ({ handleCloseDrawer }) => {
    const { map, mapWorkingLayer, setClickableFeatures, setClickedMapFeature } = useMapStore();

    const { reports, selectedReport, editReport, selectedFeatures, setSelectedReport, setSelectedFeatures, drawerOpened } = useReportStore();

    const reportClusterLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE && layer.getSource() instanceof VectorSource);
    const reportClusterSource = reportClusterLayer?.getSource() as VectorSource;

    const clickableLayer = map?.getAllLayers().find((layer) => layer.get("name") === mapWorkingLayer && layer.getSource() instanceof VectorSource);
    const clickableSource = clickableLayer?.getSource() as VectorSource;

    const handleSingleClick = useCallback(
        (evt: MapBrowserEvent) => {
            if (!map) return;
            if (selectedFeatures?.find((f) => f?.get("new"))) return;
            if (editReport) return;
            const features: { feature: Feature; zIndex: number }[] = [];

            const selectInteraction = map
                ?.getInteractions()
                .getArray()
                .find((i) => i.get("type") === InteractionType.SELECT || i.get("type") === InteractionType.REMOVE);

            const featuresAt = getFeaturesInPixelBySource(map!, clickableSource, evt.pixel, HIT_DETECTION_TOLERENCE);

            if (featuresAt && featuresAt.length) {
                setClickableFeatures(featuresAt);
                if (featuresAt.length > 1) {
                    return;
                }
            }

            if (selectInteraction) return;

            featuresAt?.forEach((feature) => {
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
            handleCloseDrawer,
            setSelectedReport,
            setSelectedFeatures,
            setClickedMapFeature,
            setClickableFeatures,
        ]
    );

    const handlePointerMove = useCallback(
        (evt: MapBrowserEvent) => {
            const features = getFeaturesInPixelBySource(map!, clickableSource, evt.pixel, HIT_DETECTION_TOLERENCE);

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

        return () => {
            map.un("singleclick", handleSingleClick);
            map.un("pointermove", handlePointerMove);
            map.getView().un("change:resolution", handleClusterChange);
        };
    }, [map, reports, selectedReport, drawerOpened, handleSingleClick, handlePointerMove, setSelectedReport, handleClusterChange]);

    return null;
};

export default MapListnerHandlers;
