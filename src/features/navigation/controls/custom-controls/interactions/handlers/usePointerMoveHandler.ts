import { useCallback, RefObject } from "react";
import { Feature, MapBrowserEvent, Map, Overlay } from "ol";
import VectorSource from "ol/source/Vector";
import { HIT_DETECTION_TOLERENCE, FEATURE_TYPE_HOVER_PROPERTY, FEATURE_TYPE_DATA_PROPERTY } from "@/constants";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { CommunityGeoservice, InteractionType } from "@/constants/communities/types";
import { useMapStore } from "@/store";

interface UsePointerMoveHandlerProps {
    map: Map | null;
    isNotClickable: boolean;
    mapWorkingLayer: string;
    clickableSource: VectorSource;
    selectedFeatures: Feature[];
    currentGeoservice: CommunityGeoservice | undefined;
    clearHoverState: () => void;
    hoveredFeatureRef: RefObject<Feature | null>;
    overlayRef: RefObject<Overlay | null>;
    tooltipRef: RefObject<HTMLDivElement | null>;
}

export const usePointerMoveHandler = (props: UsePointerMoveHandlerProps) => {
    const {
        map,
        isNotClickable,
        mapWorkingLayer,
        clickableSource,
        selectedFeatures,
        currentGeoservice,
        clearHoverState,
        hoveredFeatureRef,
        overlayRef,
        tooltipRef,
    } = props;
    const { clickedControl } = useMapStore();

    return useCallback(
        (evt: MapBrowserEvent) => {
            if (isNotClickable) {
                clearHoverState();
                return;
            }
            const activeInteractions = map?.getInteractions().getArray();
            // Check if any active interaction disables the tooltip
            // Defined in useGetInteraction

            const tooltipDisabled = activeInteractions?.some(
                (interaction) => interaction.get("type") !== undefined && interaction.get("disablesTooltip") === true
            );
            if (tooltipDisabled) {
                clearHoverState();
                return;
            }
            const getHoveredFeature = () => {
                const featuresAtPixel = map?.getFeaturesAtPixel(evt.pixel, {
                    layerFilter: (layer) => {
                        return layer.get("name") === mapWorkingLayer || layer.get("type") === mapWorkingLayer;
                    },
                    hitTolerance: HIT_DETECTION_TOLERENCE,
                });

                return featuresAtPixel?.find((f) => {
                    if (mapWorkingLayer === REPORTS_LAYER_TYPE) {
                        const fCluster = f.get("features");
                        if (fCluster?.length > 1) return fCluster[0];
                        return fCluster?.find((fc: Feature) => fc.get("reportData") || fc.get("new"));
                    }
                    if (clickableSource?.hasFeature(f as Feature)) {
                        return f;
                    }
                    return null;
                }) as Feature | undefined;
            };

            const targetElement = map?.getTargetElement();
            const hoveredFeature = getHoveredFeature();

            if (targetElement) {
                // Modify cursor style base on interaction
                if (hoveredFeature) {
                    switch (clickedControl?.interaction) {
                        case InteractionType.COPY_OBJECT:
                            targetElement.style.cursor = "copy";
                            break;
                        case InteractionType.SHORTEST_PATH:
                        case InteractionType.SPLIT_LINE:
                            targetElement.style.cursor = "crosshair";
                            break;
                        case InteractionType.TRANSLATE_OBJECT:
                            targetElement.style.cursor = "move";
                            break;
                        case InteractionType.REMOVE:
                            targetElement.style.cursor = "not-allowed";
                            break;
                        default:
                            targetElement.style.cursor = "pointer";
                    }
                } else {
                    targetElement.style.cursor = "";
                }
            }

            if (!hoveredFeature) {
                clearHoverState();
                if (targetElement) targetElement.style.cursor = "";
                return;
            }
            if (selectedFeatures.length && !selectedFeatures.includes(hoveredFeature) && selectedFeatures.find((f) => f.get("new"))) {
                clearHoverState();
                if (targetElement) targetElement.style.cursor = "";
                return;
            }

            if (hoveredFeatureRef.current !== hoveredFeature) {
                if (hoveredFeatureRef.current) {
                    hoveredFeatureRef.current.unset(FEATURE_TYPE_HOVER_PROPERTY);
                    hoveredFeatureRef.current.changed();
                }

                hoveredFeature.set(FEATURE_TYPE_HOVER_PROPERTY, true);
                hoveredFeature.changed();
                hoveredFeatureRef.current = hoveredFeature;

                if (tooltipRef.current) {
                    tooltipRef.current.innerHTML = "";

                    if (mapWorkingLayer === REPORTS_LAYER_TYPE) {
                        const innerFeatures: Feature[] = hoveredFeature.get("features") ?? [];
                        if (innerFeatures.length > 1) {
                            clearHoverState();
                            return;
                        } else {
                            const reportData = innerFeatures[0]?.get("reportData");
                            if (reportData) {
                                const titleDiv = document.createElement("div");
                                titleDiv.className = "map-hover-tooltip-title";
                                titleDiv.textContent = "Signalement";
                                tooltipRef.current.appendChild(titleDiv);

                                if (reportData.id != null) {
                                    const fieldDiv = document.createElement("div");
                                    fieldDiv.className = "map-hover-tooltip-field";

                                    const parts: string[] = [`#${reportData.id}`];

                                    const theme = reportData?.themes?.[0]?.theme;
                                    if (theme) parts.push(`Theme: ${theme}`);

                                    fieldDiv.innerHTML = parts.join("<br/>");
                                    tooltipRef.current.appendChild(fieldDiv);

                                    const comment = reportData?.comment;

                                    if (comment) {
                                        const commentDiv = document.createElement("div");
                                        commentDiv.className = "map-hover-tooltip-comment";
                                        commentDiv.textContent = comment;
                                        tooltipRef.current.appendChild(commentDiv);
                                    }
                                }
                            }
                        }
                    } else if (currentGeoservice) {
                        const data = hoveredFeature.get(FEATURE_TYPE_DATA_PROPERTY) as Record<string, unknown> | undefined;
                        const idName = currentGeoservice.idName;
                        const featureId = data && idName ? data[idName] : (data?.id ?? "");
                        const titleDiv = document.createElement("div");
                        titleDiv.className = "map-hover-tooltip-title";
                        titleDiv.textContent = currentGeoservice.layer;
                        tooltipRef.current.appendChild(titleDiv);

                        if (featureId != null && featureId !== "") {
                            const fieldDiv = document.createElement("div");

                            fieldDiv.className = "map-hover-tooltip-field";
                            fieldDiv.textContent = `#${featureId}`;
                            const infoSupp = data?.toponyme ?? data?.nature ?? data?.nom ?? data?.type;
                            if (infoSupp) {
                                fieldDiv.textContent += ` - ${infoSupp}`;
                            }
                            tooltipRef.current.appendChild(fieldDiv);
                        }
                    }
                }
            }

            if (overlayRef.current) {
                overlayRef.current.setPosition(evt.coordinate);
            }
        },
        [
            map,
            isNotClickable,
            clickedControl,
            mapWorkingLayer,
            clickableSource,
            selectedFeatures,
            currentGeoservice,
            clearHoverState,
            hoveredFeatureRef,
            overlayRef,
            tooltipRef,
        ]
    );
};
