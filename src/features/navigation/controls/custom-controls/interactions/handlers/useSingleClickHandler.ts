import { useCallback, useEffect, useRef } from "react";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { Feature, MapBrowserEvent } from "ol";
import TileLayer from "ol/layer/Tile";
import VectorSource from "ol/source/Vector";
import { WMTS } from "ol/source";
import { Style } from "ol/style";
import { FEATURE_TYPE_GEOSERVICE_PROPERTY } from "@/constants";
import { CommunityGeoservice, CustomControlItem, InteractionType } from "@/constants/communities/types";
import { getClickedMapReport, getReportSketchFeatures, REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { getWMSFeatureInfo, getWMTSFeatureInfo } from "@/api/featureTypesData";
import { Map } from "ol";
import { CommunityReport } from "@/constants/reports/types";
import { useContributionStore } from "@/store/useContributionStore";
import { useModalStore } from "@/store/useModalStore";

interface UseSingleClickHandlerProps {
    map: Map | null;
    isNotClickable: boolean;
    isRasterLayer: boolean;
    clickedControl: CustomControlItem | null;
    currentGeoservice: CommunityGeoservice | undefined;
    mapWorkingLayer: string;
    reportClusterSource: VectorSource;
    selectedReport: CommunityReport | null;
    selectedFeatures: Feature[];
    editReport: boolean;
    setClickableFeatures: (features: Feature[]) => void;
    setClickedMapFeature: (feature: Feature | null) => void;
    setFeatureInfo: (content: string | null, title: string | null, position?: [number, number]) => void;
    setSelectedReport: (report: CommunityReport | null) => void;
    setSelectedFeatures: (features: Feature[]) => void;
    handleCloseDrawer: () => void;
    handleClusterClick: (clusterFeature: Feature) => boolean;
    clearHoverState: () => void;
}

export const useSingleClickHandler = (props: UseSingleClickHandlerProps) => {
    const {
        map,
        isNotClickable,
        isRasterLayer,
        clickedControl,
        currentGeoservice,
        mapWorkingLayer,
        reportClusterSource,
        selectedReport,
        selectedFeatures,
        editReport,
        setClickableFeatures,
        setClickedMapFeature,
        setFeatureInfo,
        setSelectedReport,
        setSelectedFeatures,
        handleCloseDrawer,
        handleClusterClick,
        clearHoverState,
    } = props;

    const { selectedObjects } = useContributionStore();
    const { confirmMultipleDeselectionModal } = useModalStore();
    const pendingSingleClickEvent = useRef<MapBrowserEvent | null>(null);

    const handleSingleClick = useCallback(
        async (evt: MapBrowserEvent) => {
            if (!map || isNotClickable) return;
            if (mapWorkingLayer !== REPORTS_LAYER_TYPE && (editReport || selectedFeatures?.find((f) => f?.get("new")))) return;
            clearHoverState();

            if (isRasterLayer && clickedControl?.interaction === InteractionType.SELECT && currentGeoservice) {
                if (currentGeoservice.queryable === false) {
                    return;
                }

                try {
                    const view = map.getView();
                    const viewResolution = view.getResolution();
                    const projection = view.getProjection();
                    const coordinate = map.getCoordinateFromPixel(evt.pixel);

                    if (!viewResolution || !coordinate || coordinate.length < 2) return;

                    const geoserviceType = currentGeoservice.type;
                    let featureInfoHtml: string = "";

                    if (geoserviceType === "WMS") {
                        const viewSize = map.getSize();

                        if (viewSize && viewSize.length >= 2) {
                            featureInfoHtml = await getWMSFeatureInfo(currentGeoservice, [coordinate[0], coordinate[1]], viewResolution, projection.getCode(), [
                                viewSize[0],
                                viewSize[1],
                            ]);
                        }
                    } else if (geoserviceType === "WMTS") {
                        const wmtsLayer = map.getAllLayers().find((l) => l.get("name") === mapWorkingLayer && l instanceof TileLayer) as
                            TileLayer<WMTS> | undefined;
                        const wmtsSource = wmtsLayer?.getSource();

                        if (!wmtsSource) return;

                        const tileGrid = wmtsSource.getTileGrid();
                        if (!tileGrid) return;

                        const tileCoord = tileGrid.getTileCoordForCoordAndResolution(coordinate, viewResolution);
                        if (!tileCoord || tileCoord.length < 3) return;

                        const tileExtent = tileGrid.getTileCoordExtent(tileCoord);
                        if (!tileExtent || tileExtent.length < 4) return;

                        const extentWidth = tileExtent[2] - tileExtent[0];
                        const extentHeight = tileExtent[3] - tileExtent[1];

                        if (extentWidth === 0 || extentHeight === 0) return;

                        const tileSize = 256;
                        const pixelX = ((coordinate[0] - tileExtent[0]) / extentWidth) * tileSize;
                        const pixelY = ((tileExtent[3] - coordinate[1]) / extentHeight) * tileSize;

                        if (pixelX < 0 || pixelX > tileSize || pixelY < 0 || pixelY > tileSize) return;

                        featureInfoHtml = await getWMTSFeatureInfo(
                            currentGeoservice,
                            [tileCoord[0], tileCoord[1], tileCoord[2]],
                            [pixelX, pixelY],
                            wmtsSource.getMatrixSet() || "PM"
                        );
                    }

                    if (featureInfoHtml) {
                        setFeatureInfo(featureInfoHtml, currentGeoservice.title, [coordinate[0], coordinate[1]]);
                    }
                } catch {
                    return;
                }
            }

            const features: { feature: Feature; zIndex: number }[] = [];
            const activeInteraction = map
                ?.getInteractions()
                .getArray()
                .find((i) => i.get("type") !== undefined);

            if (activeInteraction) return;

            const featuresAtPixel = map?.getFeaturesAtPixel(evt.pixel);
            if (!featuresAtPixel?.length) {
                if (selectedObjects.length > 1) {
                    pendingSingleClickEvent.current = evt;
                    confirmMultipleDeselectionModal.open();
                }
                return;
            }

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
                    if (features.length > 1) {
                        setClickableFeatures(features.map((f) => f.feature));
                        return;
                    }
                    if (!activeInteraction) setClickedMapFeature(topFeature.feature);
                }
            }
        },
        [
            map,
            isNotClickable,
            isRasterLayer,
            clickedControl,
            currentGeoservice,
            mapWorkingLayer,
            reportClusterSource,
            selectedReport,
            selectedFeatures,
            editReport,
            setClickableFeatures,
            setClickedMapFeature,
            setFeatureInfo,
            setSelectedReport,
            setSelectedFeatures,
            handleCloseDrawer,
            handleClusterClick,
            clearHoverState,
            selectedObjects,
            confirmMultipleDeselectionModal,
        ]
    );

    useEffect(() => {
        if (!pendingSingleClickEvent.current || selectedObjects.length !== 0) return;
        const pendingEvent = pendingSingleClickEvent.current;
        pendingSingleClickEvent.current = null;
        void handleSingleClick(pendingEvent);
    }, [selectedObjects.length, handleSingleClick]);

    useIsModalOpen(confirmMultipleDeselectionModal, {
        onConceal: () => {
            if (pendingSingleClickEvent.current && selectedObjects.length > 0) {
                pendingSingleClickEvent.current = null;
            }
        },
    });

    return handleSingleClick;
};
