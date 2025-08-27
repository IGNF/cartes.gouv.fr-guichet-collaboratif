import { StatusMessage } from "@/constants/communities/types";
import { GeometryFeatueParams } from "@/constants/reports/types";
import { getCenterReportMessage, showCenterReportButtons } from "@/constants/utils";
import useDebounce from "@/hooks/useDebounce";
import { useCommunityStore, useMapStore, useReportStore } from "@/store";
import { getCenter, intersects } from "ol/extent";
import { useCallback, useEffect, useState } from "react";
import CenterMessage from "./CenterMessage";

const CenterReport = () => {
    const { alertMessages, addAlertMessage, removeAlertMessage } = useCommunityStore();
    const { map } = useMapStore();
    const { selectedFeatures } = useReportStore();

    const [center, setCenter] = useState<number[]>([]);
    const debounced = useDebounce(center, 50);

    const mainPointFeature = selectedFeatures?.find((f) => f.get("main"));

    const handleCenterToReport = useCallback(() => {
        const geometry: GeometryFeatueParams = mainPointFeature?.getGeometry() as GeometryFeatueParams;

        const featureCenter = getCenter(geometry?.getExtent() || []);
        map?.getView().setCenter(featureCenter);
    }, [map, mainPointFeature]);

    const handleReportToCenter = useCallback(() => {
        const viewCenter = map?.getView().getCenter();

        if (!viewCenter || !mainPointFeature) return;
        const geometry: GeometryFeatueParams = mainPointFeature?.getGeometry() as GeometryFeatueParams;

        const geomExtent = geometry?.getExtent() || [];
        const geomCenter = getCenter(geomExtent);
        const deltaX = viewCenter[0] - geomCenter[0];
        const deltaY = viewCenter[1] - geomCenter[1];
        geometry?.translate(deltaX, deltaY);
        setCenter(viewCenter);
    }, [map, mainPointFeature]);

    const onCenterChange = useCallback(() => {
        const mapView = map?.getView();
        const viewExtent = mapView?.calculateExtent(map?.getSize());
        if (!mapView || !mainPointFeature || !viewExtent) return;
        const geometry: GeometryFeatueParams = mainPointFeature.getGeometry() as GeometryFeatueParams;

        const isFeatureVisible = intersects(viewExtent, geometry?.getExtent() || []);
        const isNotified = getCenterReportMessage(alertMessages);
        if (!isFeatureVisible) {
            if (mainPointFeature) {
                showCenterReportButtons(true);
            }

            if (!isNotified) {
                addAlertMessage(StatusMessage.info, <CenterMessage onClick={handleReportToCenter} />);
            }
        } else {
            if (isNotified) {
                removeAlertMessage(isNotified.id);
            }

            showCenterReportButtons(false);
        }
        setCenter([]);
    }, [map, mainPointFeature, alertMessages, addAlertMessage, removeAlertMessage, handleReportToCenter]);

    useEffect(() => {
        if (debounced.length) {
            onCenterChange();
        }
    }, [debounced, selectedFeatures, mainPointFeature, onCenterChange]);

    useEffect(() => {
        const mapView = map?.getView();
        mapView?.on("change:center", () => {
            setCenter(mapView.getCenter()?.map((c) => c) || []);
        });

        document.addEventListener("center-to-feature", handleCenterToReport);
        document.addEventListener("feature-to-center", handleReportToCenter);

        return () => {
            mapView?.un("change:center", () => {
                setCenter(mapView.getCenter()?.map((c) => c) || []);
            });
            document.removeEventListener("center-to-feature", handleCenterToReport);
            document.removeEventListener("feature-to-center", handleReportToCenter);
        };
    });
    return null;
};

export default CenterReport;
