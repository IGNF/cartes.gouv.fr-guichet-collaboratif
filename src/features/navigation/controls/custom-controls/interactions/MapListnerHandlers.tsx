import { useCallback, useEffect, useMemo } from "react";
import { useCommunityStore, useMapStore, useReportStore } from "@/store";
import VectorSource from "ol/source/Vector";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { CommunityGeoservice, InteractionType } from "@/constants/communities/types";
import { useSingleClickHandler } from "./handlers/useSingleClickHandler";
import { usePointerMoveHandler } from "./handlers/usePointerMoveHandler";
import { useClusterClickHandler } from "./handlers/useClusterClickHandler";

interface Props {
    handleCloseDrawer: () => void;
}

const MapListnerHandlers: React.FC<Props> = ({ handleCloseDrawer }) => {
    const { map, mapWorkingLayer, clickedControl, setClickableFeatures, setClickedMapFeature, setFeatureInfo } = useMapStore();
    const { communityLayers } = useCommunityStore();

    const { reports, selectedReport, editReport, selectedFeatures, setSelectedReport, setSelectedFeatures, drawerOpened } = useReportStore();

    const reportClusterLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE && layer.getSource() instanceof VectorSource);
    const reportClusterSource = reportClusterLayer?.getSource() as VectorSource;

    const clickableLayer = map?.getAllLayers().find((layer) => layer.get("name") === mapWorkingLayer && layer.getSource() instanceof VectorSource);
    const clickableSource = mapWorkingLayer === REPORTS_LAYER_TYPE ? reportClusterSource : (clickableLayer?.getSource() as VectorSource);

    const handleClusterClick = useClusterClickHandler({
        map,
        reportClusterSource,
    });

    const currentGeoservice: CommunityGeoservice | undefined = useMemo(
        () => communityLayers?.find((layer) => layer?.geoservice?.layer === mapWorkingLayer)?.geoservice,
        [communityLayers, mapWorkingLayer]
    );

    const isRasterLayer = useMemo(
        () => !!(currentGeoservice && (currentGeoservice.type === "WMS" || currentGeoservice.type === "WMTS" || currentGeoservice.type === "WFS")),
        [currentGeoservice]
    );

    const isNotClickable = useMemo(
        () =>
            !!(
                (clickedControl && clickedControl.interaction !== InteractionType.SELECT) ||
                editReport ||
                selectedFeatures?.find((f) => f?.get("new")) ||
                (!currentGeoservice?.featureType && !isRasterLayer && mapWorkingLayer !== REPORTS_LAYER_TYPE)
            ),
        [clickedControl, editReport, selectedFeatures, currentGeoservice, isRasterLayer, mapWorkingLayer]
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
    });

    const handlePointerMove = usePointerMoveHandler({
        map,
        isNotClickable,
        mapWorkingLayer,
        clickableSource,
        selectedFeatures,
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
