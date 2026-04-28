import { StatusMessage } from "@/constants/communities/types";
import { GeometryFeatueParams } from "@/constants/reports/types";
import { getCenterReportMessage } from "@/constants/utils";
import useDebounce from "@/hooks/useDebounce";
import { useCommunityStore, useMapStore, useReportStore } from "@/store";
import { getCenter, intersects } from "ol/extent";
import { memo, useCallback, useEffect, useState } from "react";
import CenterMessage from "../../../reports/CenterMessage";
import Tooltip from "@mui/material/Tooltip";
import Button from "@codegouvfr/react-dsfr/Button";
import Fade from "@mui/material/Fade";
import { useTranslation } from "@/i18n";

const CenterReportControl = () => {
    const { alertMessages, addAlertMessage, removeAlertMessage } = useCommunityStore();
    const { map, showCenterReportButtons, setShowCenterReportButtons } = useMapStore();
    const { selectedFeatures } = useReportStore();

    const [center, setCenter] = useState<number[]>([]);
    const debounced = useDebounce(center, 50);

    const { t } = useTranslation({ CenterReportControl });

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
                setShowCenterReportButtons(true);
            }

            if (!isNotified) {
                addAlertMessage(StatusMessage.info, <CenterMessage onClick={handleReportToCenter} />);
            }
        } else {
            if (isNotified) {
                removeAlertMessage(isNotified.id);
            }

            setShowCenterReportButtons(false);
        }
        setCenter([]);
    }, [map, mainPointFeature, alertMessages, addAlertMessage, removeAlertMessage, handleReportToCenter, setShowCenterReportButtons]);

    useEffect(() => {
        if (debounced.length) {
            const frameId = requestAnimationFrame(() => {
                onCenterChange();
            });
            return () => cancelAnimationFrame(frameId);
        }
    }, [debounced, selectedFeatures, mainPointFeature, onCenterChange]);

    useEffect(() => {
        const mapView = map?.getView();
        if (!mapView) return;
        const handleCenterChange = () => {
            setCenter(mapView.getCenter()?.map((c) => c) || []);
        };
        mapView.on("change:center", handleCenterChange);

        return () => {
            mapView.un("change:center", handleCenterChange);
        };
    }, [map]);

    if (!showCenterReportButtons) return null;
    return (
        <div className="center-to-report-btns">
            <Tooltip
                placement="left"
                arrow
                title={t("center_to_report_title")}
                slots={{ transition: Fade }}
                slotProps={{ tooltip: { onClick: handleCenterToReport } }}
            >
                <Button
                    iconId="ri-focus-mode"
                    className="btn-show-drawer fr-icon--sm"
                    priority={"tertiary no outline"}
                    title=""
                    onClick={handleCenterToReport}
                />
            </Tooltip>
            <Tooltip
                placement="left"
                arrow
                title={t("report_to_center_title")}
                slots={{ transition: Fade }}
                slotProps={{ tooltip: { onClick: handleReportToCenter } }}
            >
                <Button
                    iconId="ri-focus-line"
                    className="btn-show-drawer fr-icon--sm"
                    priority={"tertiary no outline"}
                    title=""
                    onClick={handleReportToCenter}
                />
            </Tooltip>
        </div>
    );
};

export default memo(CenterReportControl);
