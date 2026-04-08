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
        const mapView = map?.getView();
        if (!mapView || !mainPointFeature) return;

        const geometry: GeometryFeatueParams = mainPointFeature?.getGeometry() as GeometryFeatueParams;
        const extent = geometry?.getExtent();

        if (!extent || extent.length !== 4) return;

        const featureCenter = getCenter(extent);
        mapView.animate({
            center: featureCenter,
            duration: 450,
        });
    }, [map, mainPointFeature]);

    const onCenterChange = useCallback(() => {
        const mapView = map?.getView();
        const viewExtent = mapView?.calculateExtent(map?.getSize());
        if (!mapView || !mainPointFeature || !viewExtent) return;
        const geometry: GeometryFeatueParams = mainPointFeature.getGeometry() as GeometryFeatueParams;

        const isFeatureVisible = intersects(viewExtent, geometry?.getExtent() || []);
        const isNotified = getCenterReportMessage(alertMessages);

        if (!isFeatureVisible) {
            setShowCenterReportButtons(true);

            if (!isNotified) {
                addAlertMessage(StatusMessage.info, <CenterMessage onClick={handleCenterToReport} />);
            }
        } else {
            if (isNotified) {
                removeAlertMessage(isNotified.id);
            }
            setShowCenterReportButtons(false);
        }
    }, [map, mainPointFeature, alertMessages, addAlertMessage, removeAlertMessage, handleCenterToReport, setShowCenterReportButtons]);

    const handleMapCenterChange = useCallback(() => {
        const nextCenter = map?.getView()?.getCenter();
        if (!nextCenter) return;

        setCenter((prev) => {
            if (prev.length === 2 && prev[0] === nextCenter[0] && prev[1] === nextCenter[1]) {
                return prev;
            }
            return [nextCenter[0], nextCenter[1]];
        });
    }, [map]);

    useEffect(() => {
        if (debounced.length) {
            onCenterChange();
        }
    }, [debounced, onCenterChange]);

    useEffect(() => {
        const mapView = map?.getView();
        if (!mapView) return;

        mapView.on("change:center", handleMapCenterChange);

        return () => {
            mapView.un("change:center", handleMapCenterChange);
        };
    }, [map, handleMapCenterChange]);

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
                slotProps={{ tooltip: { onClick: handleCenterToReport } }}
            >
                <Button
                    iconId="ri-focus-line"
                    className="btn-show-drawer fr-icon--sm"
                    priority={"tertiary no outline"}
                    title=""
                    onClick={handleCenterToReport}
                />
            </Tooltip>
        </div>
    );
};

export default memo(CenterReportControl);
