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
    shortestPathNetwork: CommunityGeoservice[];
    selectedFeatures: Feature[];
    currentGeoservice: CommunityGeoservice | undefined;
    clearHoverState: () => void;
    hoveredFeatureRef: RefObject<Feature | null>;
    overlayRef: RefObject<Overlay | null>;
    tooltipRef: RefObject<HTMLDivElement | null>;
}

/*
 Handles pointer-move events: cursor style, hover highlight, and tooltip
 */
export const usePointerMoveHandler = (props: UsePointerMoveHandlerProps) => {
    const {
        map,
        isNotClickable,
        mapWorkingLayer,
        clickableSource,
        shortestPathNetwork,
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

            // Tooltip suppression
            const tooltipSuppressedTools = [InteractionType.MODIFY, InteractionType.TRANSLATE_OBJECT];
            const disabledByTool = !!clickedControl && tooltipSuppressedTools.includes(clickedControl.interaction as InteractionType);
            const disabledByInteraction = activeInteractions?.some(
                (interaction) => interaction.get("type") !== undefined && interaction.get("disablesTooltip") === true
            );
            const tooltipDisabled = evt.dragging || disabledByTool || disabledByInteraction;

            if (tooltipDisabled) {
                clearHoverState();
                return;
            }
            const getHoveredFeature = (): { feature: Feature; layerName: string } | undefined => {
                const shortestPathNetworkLayerNames = shortestPathNetwork.map((gs) => gs.layer);
                const isShortestPath = clickedControl?.interaction === InteractionType.SHORTEST_PATH && shortestPathNetworkLayerNames.length > 0;

                let result: { feature: Feature; layerName: string } | undefined;
                map?.forEachFeatureAtPixel(
                    evt.pixel,
                    (f, layer) => {
                        //Stop after first match
                        if (result) return true;
                        const layerName: string = layer?.get("name") ?? "";
                        if (mapWorkingLayer === REPORTS_LAYER_TYPE) {
                            const fCluster = f.get("features");
                            if (fCluster?.length > 1) {
                                return false;
                            } else {
                                const inner = fCluster?.find((fc: Feature) => fc.get("reportData") || fc.get("new"));
                                if (inner) result = { feature: inner as Feature, layerName };
                            }
                            return !!result;
                        }
                        if (isShortestPath) {
                            result = { feature: f as Feature, layerName };
                            return true;
                        }
                        if (clickableSource?.hasFeature(f as Feature)) {
                            result = { feature: f as Feature, layerName };
                            return true;
                        }
                        return false;
                    },
                    {
                        layerFilter: (layer) => {
                            if (isShortestPath) return shortestPathNetworkLayerNames.includes(layer.get("name"));
                            return layer.get("name") === mapWorkingLayer || layer.get("type") === mapWorkingLayer;
                        },
                        hitTolerance: HIT_DETECTION_TOLERENCE,
                    }
                );
                return result;
            };

            const targetElement = map?.getTargetElement();
            const hovered = getHoveredFeature();
            const hoveredFeature = hovered?.feature;

            if (targetElement) {
                // Modify cursor style base on interaction
                if (hoveredFeature) {
                    switch (clickedControl?.interaction) {
                        case InteractionType.COPY_OBJECT:
                            targetElement.style.cursor = "copy";
                            break;
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
                        const reportData = hoveredFeature.get("reportData");
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
                    } else if (currentGeoservice) {
                        const matchedGs = shortestPathNetwork.find((gs) => gs.layer === hovered?.layerName);
                        const tooltipGeoservice = matchedGs ?? currentGeoservice;
                        const data = hoveredFeature.get(FEATURE_TYPE_DATA_PROPERTY) as Record<string, unknown> | undefined;
                        const idName = tooltipGeoservice.idName;
                        const featureId = data && idName ? data[idName] : (data?.id ?? "");
                        const titleDiv = document.createElement("div");
                        titleDiv.className = "map-hover-tooltip-title";
                        titleDiv.textContent = tooltipGeoservice.layer;
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
            shortestPathNetwork,
            selectedFeatures,
            currentGeoservice,
            clearHoverState,
            hoveredFeatureRef,
            overlayRef,
            tooltipRef,
        ]
    );
};
