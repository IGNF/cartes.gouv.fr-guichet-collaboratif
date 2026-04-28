import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { FEATURE_TYPE_HOVER_PROPERTY } from "@/constants";
import { CommunityGeoservice, InteractionType } from "@/constants/communities/types";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { useCommunityStore, useMapStore, useReportStore } from "@/store";
import { Feature, Overlay } from "ol";
import VectorSource from "ol/source/Vector";
import { useSingleClickHandler } from "./handlers/useSingleClickHandler";
import { usePointerMoveHandler } from "./handlers/usePointerMoveHandler";
import { useRasterWorkingLayer } from "@/hooks/working-layer/useRasterWorkingLayer";
import { useClusterClickHandler } from "./handlers/useClusterClickHandler";

interface Props {
    handleCloseDrawer: () => void;
}

const MapListnerHandlers: React.FC<Props> = ({ handleCloseDrawer }) => {
    const { map, mapWorkingLayer, clickedControl, setClickableFeatures, setClickedMapFeature, setFeatureInfo } = useMapStore();
    const { communityLayers } = useCommunityStore();
    const { reports, selectedReport, editReport, selectedFeatures, setSelectedReport, setSelectedFeatures, drawerOpened } = useReportStore();

    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const overlayRef = useRef<Overlay | null>(null);
    const hoveredFeatureRef = useRef<Feature | null>(null);

    const { isRasterLayer, isRasterLayerQueryable } = useRasterWorkingLayer();

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
            hoveredFeatureRef.current.changed();
            hoveredFeatureRef.current = null;
        }

        if (overlayRef.current) {
            overlayRef.current.setPosition(undefined);
        }

        if (tooltipRef.current) {
            tooltipRef.current.innerHTML = "";
        }
    }, []);

    const handleClusterClick = useClusterClickHandler({
        map,
        reportClusterSource,
    });

    const currentGeoservice: CommunityGeoservice | undefined = useMemo(
        () => communityLayers?.find((layer) => layer?.geoservice?.layer === mapWorkingLayer)?.geoservice,
        [communityLayers, mapWorkingLayer]
    );

    const isNotClickable = useMemo(
        () =>
            !!(
                (clickedControl &&
                    clickedControl.interaction !== InteractionType.SELECT &&
                    clickedControl.interaction !== InteractionType.REMOVE &&
                    clickedControl.interaction !== InteractionType.MODIFY &&
                    clickedControl.interaction !== InteractionType.TRANSLATE_OBJECT &&
                    clickedControl.interaction !== InteractionType.COPY_OBJECT) ||
                editReport ||
                selectedFeatures?.find((f) => f?.get("new")) ||
                (!currentGeoservice?.featureType && !isRasterLayerQueryable && mapWorkingLayer !== REPORTS_LAYER_TYPE)
            ),
        [clickedControl, editReport, selectedFeatures, currentGeoservice, isRasterLayerQueryable, mapWorkingLayer]
    );

    const handleSingleClick = useSingleClickHandler({
        map,
        isNotClickable,
        isRasterLayer,
        clickedControl,
        currentGeoservice,
        mapWorkingLayer,
        clickableSource,
        reportClusterSource,
        selectedReport,
        selectedFeatures,
        setClickableFeatures,
        setClickedMapFeature,
        setFeatureInfo,
        setSelectedReport,
        setSelectedFeatures,
        handleCloseDrawer,
        handleClusterClick,
        clearHoverState,
    });

    const handlePointerMove = usePointerMoveHandler({
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
    });

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
