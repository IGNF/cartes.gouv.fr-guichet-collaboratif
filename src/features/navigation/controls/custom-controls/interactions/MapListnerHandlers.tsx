import { useCallback, useEffect, useMemo } from "react";
import { createEmpty, extend } from "ol/extent";
import { FEATURE_TYPE_GEOSERVICE_PROPERTY, HIT_DETECTION_TOLERENCE } from "@/constants";
import { CommunityGeoservice, InteractionType } from "@/constants/communities/types";
import { getFeaturesInPixelBySource } from "@/constants/communities/utils";
import { getClickedMapReport, getReportSketchFeatures, REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { showClusterFeatures } from "@/constants/reports/utils/cluster";
import { useCommunityStore, useMapStore, useReportStore } from "@/store";
import { Feature, MapBrowserEvent } from "ol";
import VectorSource from "ol/source/Vector";
import { Style } from "ol/style";

interface Props {
    handleCloseDrawer: () => void;
}

const MapListnerHandlers: React.FC<Props> = ({ handleCloseDrawer }) => {
    const { map, mapWorkingLayer, clickedControl, setClickableFeatures, setClickedMapFeature } = useMapStore();
    const { communityLayers } = useCommunityStore();

    const { reports, selectedReport, editReport, selectedFeatures, setSelectedReport, setSelectedFeatures, drawerOpened } = useReportStore();

    const reportClusterLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE && layer.getSource() instanceof VectorSource);
    const reportClusterSource = reportClusterLayer?.getSource() as VectorSource;

    const clickableLayer = map?.getAllLayers().find((layer) => layer.get("name") === mapWorkingLayer && layer.getSource() instanceof VectorSource);
    const clickableSource = mapWorkingLayer === REPORTS_LAYER_TYPE ? reportClusterSource : (clickableLayer?.getSource() as VectorSource);

    const handleClusterClick = useCallback(
        (clusterFeature: Feature): boolean => {
            if (!map) return false;

            const clusterMembers = clusterFeature.get("features");
            if (!clusterMembers || clusterMembers.length <= 1) return false;

            const view = map.getView();
            const currentZoom = view.getZoom();
            const maxZoom = view.getMaxZoom();
            const resolution = view.getResolution();

            if (!currentZoom || !maxZoom || !resolution) return false;

            if (currentZoom >= maxZoom) {
                showClusterFeatures(clusterFeature, resolution, reportClusterSource);
                return true;
            }
            const extent = createEmpty();
            clusterMembers.forEach((feature: Feature) => {
                const geom = feature.getGeometry();
                if (geom) {
                    extend(extent, geom.getExtent());
                }
            });

            const center = view.getCenter();
            if (!center) return false;

            const extentCenter = [(extent[2] + extent[0]) / 2, (extent[3] + extent[1]) / 2];
            const dx = extentCenter[0] - center[0];
            const dy = extentCenter[1] - center[1];
            const distance = Math.sqrt(dx * dx + dy * dy);

            const duration = Math.min(Math.max(distance * 2, 300), 1000);

            const targetZoom = Math.min(currentZoom + 2, maxZoom);

            view.animate({
                center: extentCenter,
                zoom: targetZoom,
                duration,
            });

            return true;
        },
        [map, reportClusterSource]
    );
    const currentGeoservice: CommunityGeoservice | undefined = useMemo(
        () => communityLayers?.find((layer) => layer?.geoservice?.layer === mapWorkingLayer)?.geoservice,
        [communityLayers, mapWorkingLayer]
    );

    const isNotClickable = useMemo(
        () =>
            clickedControl ||
            editReport ||
            selectedFeatures?.find((f) => f?.get("new")) ||
            (!currentGeoservice?.featureType && mapWorkingLayer !== REPORTS_LAYER_TYPE),
        [clickedControl, editReport, selectedFeatures, currentGeoservice, mapWorkingLayer]
    );

    const handleSingleClick = useCallback(
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

    const handlePointerMove = useCallback(
        (evt: MapBrowserEvent) => {
            if (isNotClickable) return;
            const features = map?.getFeaturesAtPixel(evt.pixel, {
                layerFilter: (layer) => {
                    return layer.get("name") === mapWorkingLayer || layer.get("type") === mapWorkingLayer;
                },
                hitTolerance: HIT_DETECTION_TOLERENCE,
            });

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
        [map, selectedFeatures, mapWorkingLayer, clickableSource, isNotClickable]
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
