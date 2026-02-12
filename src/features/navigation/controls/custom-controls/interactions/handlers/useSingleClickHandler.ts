import { useCallback } from "react";
import { Feature, MapBrowserEvent } from "ol";
import { Map } from "ol";
import VectorSource from "ol/source/Vector";
import { Style } from "ol/style";
import { FEATURE_TYPE_GEOSERVICE_PROPERTY, HIT_DETECTION_TOLERENCE } from "@/constants";
import { InteractionType } from "@/constants/communities/types";
import { getFeaturesInPixelBySource } from "@/constants/communities/utils";
import { getClickedMapReport, getReportSketchFeatures, REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { CommunityReport } from "@/constants/reports/types";

interface UseSingleClickHandlerProps {
    map: Map | null;
    isNotClickable: boolean;
    mapWorkingLayer: string;
    clickableSource: VectorSource;
    reportClusterSource: VectorSource;
    selectedReport: CommunityReport | null;
    selectedFeatures: Feature[];
    setClickableFeatures: (features: Feature[]) => void;
    setClickedMapFeature: (feature: Feature | null) => void;
    setSelectedReport: (report: CommunityReport | null) => void;
    setSelectedFeatures: (features: Feature[]) => void;
    handleCloseDrawer: () => void;
    handleClusterClick: (clusterFeature: Feature) => boolean;
}

export const useSingleClickHandler = (props: UseSingleClickHandlerProps) => {
    const {
        map,
        isNotClickable,
        mapWorkingLayer,
        clickableSource,
        reportClusterSource,
        selectedReport,
        selectedFeatures,
        setClickableFeatures,
        setClickedMapFeature,
        setSelectedReport,
        setSelectedFeatures,
        handleCloseDrawer,
        handleClusterClick,
    } = props;

    return useCallback(
        (evt: MapBrowserEvent) => {
            if (!map || isNotClickable) return;
            if (selectedFeatures?.find((f) => f?.get("new"))) return;

            const features: { feature: Feature; zIndex: number }[] = [];
            const selectInteraction = map
                ?.getInteractions()
                .getArray()
                .find((i) => i.get("type") === InteractionType.SELECT || i.get("type") === InteractionType.REMOVE);

            const featuresAtPixel = map?.getFeaturesAtPixel(evt.pixel);
            if (!featuresAtPixel?.length) return;

            const featuresAt = getFeaturesInPixelBySource(map!, clickableSource, evt.pixel, HIT_DETECTION_TOLERENCE);

            if (featuresAt && featuresAt.length && mapWorkingLayer !== REPORTS_LAYER_TYPE) {
                setClickableFeatures(featuresAt);
                if (featuresAt.length > 1) {
                    return;
                }
            }

            if (selectInteraction) return;

            featuresAtPixel?.forEach((feature) => {
                const clickedFeature = feature as Feature;

                if (clickedFeature.get(FEATURE_TYPE_GEOSERVICE_PROPERTY)?.layer !== mapWorkingLayer && mapWorkingLayer !== REPORTS_LAYER_TYPE) return;

                if (mapWorkingLayer === REPORTS_LAYER_TYPE && clickedFeature.get("features")) {
                    const featureStyle = clickedFeature.getStyle();

                    const isPopOut = Array.isArray(featureStyle) && featureStyle.length > 1;

                    if (isPopOut) {
                        getClickedMapReport({
                            feature: clickedFeature,
                            map,
                            pixel: evt.pixel,
                            clusterSource: reportClusterSource,
                            features,
                            handleCloseDrawer,
                        });
                        return;
                    }

                    const handled = handleClusterClick(clickedFeature);
                    if (handled) {
                        return;
                    }
                    getClickedMapReport({
                        feature: clickedFeature,
                        map,
                        pixel: evt.pixel,
                        clusterSource: reportClusterSource,
                        features,
                        handleCloseDrawer,
                    });
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
            mapWorkingLayer,
            clickableSource,
            isNotClickable,
            handleCloseDrawer,
            handleClusterClick,
            setSelectedReport,
            setSelectedFeatures,
            setClickedMapFeature,
            setClickableFeatures,
        ]
    );
};
