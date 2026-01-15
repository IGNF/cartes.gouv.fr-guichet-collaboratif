import {
    FEATURE_TYPE_GEOSERVICE_PROPERTY,
    FEATURE_TYPE_SELECTED_PROPERTY,
    FEATURE_TYPE_NEW_PROPERTY,
    HIT_DETECTION_TOLERENCE,
    FEATURE_TYPE_HOVER_PROPERTY,
} from "@/constants";
import { InteractionType } from "@/constants/communities/types";
import { getFeaturesInPixelBySource } from "@/constants/communities/utils";
import { getClickedMapReport, getReportSketchFeatures, REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { showClusterFeatures } from "@/constants/reports/utils/cluster";
import { useContributionStore, useMapStore, useReportStore } from "@/store";
import { Feature, MapBrowserEvent, Overlay } from "ol";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import { Style } from "ol/style";
import { useCallback, useEffect, useRef } from "react";
import { createEmpty, extend } from "ol/extent";
import { getSelectedFeatureTypeStyle } from "@/constants/styles";

interface Props {
    handleCloseDrawer: () => void;
}

const MapListnerHandlers: React.FC<Props> = ({ handleCloseDrawer }) => {
    const { map, mapWorkingLayer, setClickableFeatures, setClickedMapFeature } = useMapStore();
    const { reports, selectedReport, editReport, selectedFeatures, setSelectedReport, setSelectedFeatures, drawerOpened } = useReportStore();
    const { selectedObjects } = useContributionStore();

    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const overlayRef = useRef<Overlay | null>(null);
    const hoveredFeatureRef = useRef<Feature | null>(null);

    const reportClusterLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE && layer.getSource() instanceof VectorSource);
    const reportClusterSource = reportClusterLayer?.getSource() as VectorSource;

    const clickableLayer = map?.getAllLayers().find((layer) => layer.get("name") === mapWorkingLayer && layer.getSource() instanceof VectorSource);
    const clickableSource = mapWorkingLayer === REPORTS_LAYER_TYPE ? reportClusterSource : (clickableLayer?.getSource() as VectorSource);

    useEffect(() => {
        if (!map) return;

        const tooltipElement: HTMLDivElement = document.createElement("div");
        tooltipElement.className = "map-hover-tooltip";
        tooltipRef.current = tooltipElement;

        const overlay = new Overlay({
            element: tooltipElement,
            offset: [15, -15],
            positioning: "bottom-left",
            stopEvent: false,
        });
        overlayRef.current = overlay;
        map.addOverlay(overlay);

        return () => {
            if (overlayRef.current) {
                map.removeOverlay(overlayRef.current);
            }
            if (tooltipRef.current) {
                tooltipRef.current.remove();
            }
        };
    }, [map]);

    const clearHoverState = useCallback(() => {
        if (hoveredFeatureRef.current) {
            hoveredFeatureRef.current.unset(FEATURE_TYPE_HOVER_PROPERTY);
            hoveredFeatureRef.current.unset(FEATURE_TYPE_SELECTED_PROPERTY);
            hoveredFeatureRef.current.changed();
            hoveredFeatureRef.current = null;
        }

        if (overlayRef.current) {
            overlayRef.current.setPosition(undefined);
        }
    }, []);

    const isTooltipDisabled = useCallback(() => {
        if (!map) return false;

        const activeInteractions = map.getInteractions().getArray();
        return activeInteractions.some((interaction) => interaction.get("disablesTooltip") === true);
    }, [map]);

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

    const handleSingleClick = useCallback(
        (evt: MapBrowserEvent) => {
            if (!map) return;
            if (selectedFeatures?.find((f) => f?.get("new"))) return;

            clearHoverState();

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
            editReport,
            mapWorkingLayer,
            clickableSource,
            handleCloseDrawer,
            handleClusterClick,
            setSelectedReport,
            setSelectedFeatures,
            setClickedMapFeature,
            setClickableFeatures,
            clearHoverState,
        ]
    );

    const handlePointerMove = useCallback(
        (evt: MapBrowserEvent) => {
            if (!map) return;

            const features = map.getFeaturesAtPixel(evt.pixel, {
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

            const targetElement = map.getTargetElement();
            if (targetElement) {
                if (feature) {
                    if (selectedFeatures.length && !selectedFeatures.includes(feature) && selectedFeatures.find((f) => f.get("new"))) {
                        targetElement.style.cursor = "";
                    } else {
                        targetElement.style.cursor = "pointer";
                    }
                } else {
                    targetElement.style.cursor = "";
                }
            }

            if (isTooltipDisabled()) {
                clearHoverState();
                return;
            }

            const workingLayer = map
                .getAllLayers()
                .find(
                    (layer) =>
                        (layer.get("name") === mapWorkingLayer || layer.get("type") === mapWorkingLayer) &&
                        (layer instanceof VectorLayer || layer instanceof WebGLVectorLayer)
                );

            if (!workingLayer) {
                clearHoverState();
                return;
            }

            const source = workingLayer.getSource() as VectorSource;
            const featuresAt = getFeaturesInPixelBySource(map, source, evt.pixel, HIT_DETECTION_TOLERENCE);

            if (!featuresAt || featuresAt.length === 0) {
                clearHoverState();
                return;
            }

            let hoverFeature = featuresAt[0];

            if (mapWorkingLayer === REPORTS_LAYER_TYPE && hoverFeature.get("features")) {
                const clusterMembers = hoverFeature.get("features");
                if (clusterMembers && clusterMembers.length === 1) {
                    hoverFeature = clusterMembers[0];
                } else if (clusterMembers && clusterMembers.length > 1) {
                    clearHoverState();
                    return;
                }
            }

            if (hoverFeature.get(FEATURE_TYPE_NEW_PROPERTY) || selectedObjects.some((obj) => obj === hoverFeature)) {
                clearHoverState();
                return;
            }
            if (hoveredFeatureRef.current && hoveredFeatureRef.current !== hoverFeature) {
                clearHoverState();
            }

            if (hoveredFeatureRef.current !== hoverFeature) {
                hoveredFeatureRef.current = hoverFeature;

                const geoservice = hoverFeature.get(FEATURE_TYPE_GEOSERVICE_PROPERTY);
                const featureType = geoservice?.featureType || hoverFeature.get("featureType");

                if (featureType) {
                    const selectedStyle = getSelectedFeatureTypeStyle(featureType, geoservice?.styles?.[0] || { name: "default", types: [] });
                    if (selectedStyle) {
                        hoverFeature.set(FEATURE_TYPE_HOVER_PROPERTY, true);
                        hoverFeature.set(FEATURE_TYPE_SELECTED_PROPERTY, true);
                        hoverFeature.setStyle(selectedStyle);
                        hoverFeature.changed();
                    }
                }
            }

            if (tooltipRef.current && overlayRef.current) {
                const featureName =
                    hoverFeature.get("nom") ||
                    hoverFeature.get("name") ||
                    hoverFeature.get("titre") ||
                    hoverFeature.get("title") ||
                    hoverFeature.get("libelle") ||
                    hoverFeature.get("description");

                const featureId = hoverFeature.getId();

                tooltipRef.current.innerHTML = `
            <div class="map-hover-tooltip__title">
                ${featureName}
            </div>
            <div class="map-hover-tooltip__id">
                ID: ${featureId}
            </div>
        `;
                overlayRef.current.setPosition(evt.coordinate);
            }
        },
        [map, selectedFeatures, selectedObjects, mapWorkingLayer, clickableSource, isTooltipDisabled, clearHoverState]
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

        const handlePointerLeave = () => {
            clearHoverState();
        };

        const viewport = map.getViewport();
        viewport.addEventListener("mouseleave", handlePointerLeave);

        return () => {
            viewport.removeEventListener("mouseleave", handlePointerLeave);
        };
    }, [map, clearHoverState]);

    useEffect(() => {
        if (!map) return;
        map.on("singleclick", handleSingleClick);
        map.on("pointermove", handlePointerMove);
        map.getView()?.on("change:resolution", handleClusterChange);

        return () => {
            map.un("singleclick", handleSingleClick);
            map.un("pointermove", handlePointerMove);
            map.getView().un("change:resolution", handleClusterChange);
            clearHoverState();
        };
    }, [map, reports, selectedReport, drawerOpened, handleSingleClick, handlePointerMove, setSelectedReport, handleClusterChange, clearHoverState]);

    return null;
};

export default MapListnerHandlers;
