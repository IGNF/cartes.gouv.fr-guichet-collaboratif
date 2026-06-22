import { useMapStore, useReportStore } from "@/store";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import VectorSource from "ol/source/Vector";
import Button from "@codegouvfr/react-dsfr/Button";
import Fade from "@mui/material/Fade";
import Tooltip from "@mui/material/Tooltip";
import { useCallback } from "react";

const AllReportsControl = () => {
    const { tableDrawerOpened, drawerOpened, selectedReport, setTableDrawerOpened, setDrawerOpened, setEditReport, setSelectedReport, setSelectedFeatures } =
        useReportStore();
    const { showMapWorkingLayerSelect, map } = useMapStore();

    const displayTableReportsDrawer = useCallback(() => {
        const opening = !tableDrawerOpened;
        if (opening && drawerOpened) {
            if (selectedReport) {
                const clusterLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE);
                const clusterSource = clusterLayer?.getSource() as VectorSource;
                const sketchFeatures = clusterSource?.getFeatures().filter((f) => f.get("reportData")?.id === selectedReport.id && !f.get("main")) ?? [];
                clusterSource?.removeFeatures(sketchFeatures);
            }
            setDrawerOpened(false);
            setEditReport(false);
            setSelectedReport(null);
            setSelectedFeatures([]);
        }
        setTableDrawerOpened(opening);
    }, [tableDrawerOpened, drawerOpened, selectedReport, map, setTableDrawerOpened, setDrawerOpened, setEditReport, setSelectedReport, setSelectedFeatures]);

    return (
        <Tooltip
            placement="left"
            arrow
            title={showMapWorkingLayerSelect ? "Afficher le tableau de signalement" : undefined}
            slots={{ transition: Fade }}
            slotProps={{ tooltip: { onClick: displayTableReportsDrawer } }}
        >
            <Button
                iconId="fr-icon-discuss-line"
                className="btn-show-drawer fr-icon--sm"
                priority={tableDrawerOpened ? "primary" : "tertiary no outline"}
                title=""
                nativeButtonProps={{
                    "aria-pressed": tableDrawerOpened,
                }}
                onClick={displayTableReportsDrawer}
            />
        </Tooltip>
    );
};

export default AllReportsControl;
