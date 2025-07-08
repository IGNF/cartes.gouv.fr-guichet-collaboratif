import { StatusMessage } from "@/constants/communities/types";
import { GeometryFeatueParams } from "@/constants/reports/types";
import useDebounce from "@/hooks/useDebounce";
import { useCommunityStore, useMapStore, useReportStore } from "@/store";
import { getCenter, intersects } from "ol/extent";
import React, { useCallback, useEffect, useMemo, useState } from "react";

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

    const mainPointFeature = useMemo(() => selectedFeatures?.find((f) => f.get("main")), [selectedFeatures]);

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
        const buttons = document.getElementsByClassName("center-feature");
        const isNotified = alertMessages.find(
            (message) =>
                typeof message.text === "object" &&
                React.isValidElement(message.text) &&
                typeof message.text.type === "function" &&
                message.text.type.name === "CenterMessage"
        );
        if (!isFeatureVisible) {
            if (mainPointFeature) {
                Array.from(buttons).forEach((button) => {
                    (button as HTMLButtonElement).style.display = "block";
                });
            }

            if (!isNotified) {
                addAlertMessage(StatusMessage.info, <CenterMessage onClick={handleFeatureToCenter} />);
            }
        } else {
            if (isNotified) {
                removeAlertMessage(isNotified.id);
            }

            Array.from(buttons).forEach((button) => {
                (button as HTMLButtonElement).style.display = "none";
            });
        }
        setCenter([]);
    }, [map, mainPointFeature, alertMessages, addAlertMessage, removeAlertMessage, handleFeatureToCenter]);

    useEffect(() => {
        if (debounced.length) {
            onCenterChange();
        }
    }, [debounced, selectedFeatures, onCenterChange]);

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
