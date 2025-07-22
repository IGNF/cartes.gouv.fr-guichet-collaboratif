import { StatusMessage } from "@/constants/communities/types";
import { GeometryFeatueParams } from "@/constants/reports/types";
import { getCenterFeatureMessage, showCenterFeatureButtons } from "@/constants/utils";
import useDebounce from "@/hooks/useDebounce";
import { useCommunityStore, useMapStore, useReportStore } from "@/store";
import { getCenter, intersects } from "ol/extent";
import React, { useCallback, useEffect, useState } from "react";

const CenterMessage: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    return (
        <p>
            Attention ! Le signalement est en dehors de la carte visible -{" "}
            <a href="#" onClick={onClick}>
                Déplacer le signalement au centre de la carte
            </a>
        </p>
    );
};

const CenterFeature = () => {
    const { alertMessages, addAlertMessage, removeAlertMessage } = useCommunityStore();
    const { map } = useMapStore();
    const { selectedFeatures } = useReportStore();

    const [center, setCenter] = useState<number[]>([]);
    const debounced = useDebounce(center, 50);

    const mainPointFeature = selectedFeatures?.find((f) => f.get("main"));

    const handleCenterToFeature = useCallback(() => {
        const geometry: GeometryFeatueParams = mainPointFeature?.getGeometry() as GeometryFeatueParams;

        const featureCenter = getCenter(geometry?.getExtent() || []);
        map?.getView().setCenter(featureCenter);
    }, [map, mainPointFeature]);

    const handleFeatureToCenter = useCallback(() => {
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
        const isNotified = getCenterFeatureMessage(alertMessages);
        if (!isFeatureVisible) {
            if (mainPointFeature) {
                showCenterFeatureButtons(true);
            }

            if (!isNotified) {
                addAlertMessage(StatusMessage.info, <CenterMessage onClick={handleFeatureToCenter} />);
            }
        } else {
            if (isNotified) {
                removeAlertMessage(isNotified.id);
            }

            showCenterFeatureButtons(false);
        }
        setCenter([]);
    }, [map, mainPointFeature, alertMessages, addAlertMessage, removeAlertMessage, handleFeatureToCenter]);

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

        document.addEventListener("center-to-feature", handleCenterToFeature);
        document.addEventListener("feature-to-center", handleFeatureToCenter);

        return () => {
            mapView?.un("change:center", () => {
                setCenter(mapView.getCenter()?.map((c) => c) || []);
            });
            document.removeEventListener("center-to-feature", handleCenterToFeature);
            document.removeEventListener("feature-to-center", handleFeatureToCenter);
        };
    });
    return null;
};

export default CenterFeature;
