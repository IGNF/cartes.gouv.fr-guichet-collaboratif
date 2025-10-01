import { useEffect } from "react";
import VectorSource from "ol/source/Vector";
import { Coordinate } from "ol/coordinate";
import TileLayer from "ol/layer/Tile";
import { getFeaturePoint, getLonLatFromPoint, handleCenterToFeature } from "@/constants/utils";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { CommunityReport, SketchFeatureType } from "@/constants/reports/types";
import { useLocalStorageStore, useMapStore, useReportStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Tag from "@codegouvfr/react-dsfr/Tag";
import { LocalLayer } from "@/constants/localStorage/types";
import GetReportsLayer from "@/features/navigation/layers/GetReportsLayer";
import { useTranslation } from "@/i18n";

const TransformReportsToTableData = (reports: CommunityReport[]) => {
    const { t } = useTranslation({ GetReportsLayer });
    const { localStorageData } = useLocalStorageStore();
    const { map } = useMapStore();
    const { isChecked, setIsChecked, reportTableWidth, setSelectedLine, setSelectedReport } = useReportStore();

    const clusterLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE);
    const clusterSource = clusterLayer?.getSource() as VectorSource;

    const handleShowOnMap = (report: CommunityReport) => {
        if (!map || !clusterSource) return;

        const localLayer: LocalLayer | undefined = localStorageData?.layers.find((l) => l.name === t("reports_title"));
        if (localLayer) {
            localLayer.visibility = true;
        }

        const view = map?.getView();
        if (!view || !map) return;

        let feature = clusterSource.getFeatures().find((f) => f.get("reportData")?.id === report.id);

        if (feature) {
            handleCenterToFeature(map, feature);
        } else {
            const featData = {
                type: SketchFeatureType.Point,
                geometry: report.geometry,
            };
            feature = getFeaturePoint(report, featData, true);
            clusterSource.addFeature(feature);
            handleCenterToFeature(map, feature);
        }

        const coords = getLonLatFromPoint(report.geometry) as Coordinate;
        view.setCenter(coords);

        const rasterLayers = map?.getAllLayers();
        const layers = rasterLayers?.filter((layer) => layer.getVisible() === true && layer instanceof TileLayer);
        const higherLayer = layers?.reduce((minLay, lay) => (!minLay || Number(lay.getZIndex()) < Number(minLay?.getZIndex()) ? lay : minLay));
        const theLayerZoom = higherLayer?.getMaxZoom() - 2;

        view.setZoom(theLayerZoom ?? view.getZoom());

        const pixelOffsetX = -reportTableWidth / 2;

        const applyOffset = () => {
            const pixel = map.getPixelFromCoordinate(coords);
            const pixelOffset = [pixel[0] + pixelOffsetX, pixel[1]];
            const offsetCoord = map.getCoordinateFromPixel(pixelOffset);
            view.setCenter(offsetCoord);
            map.un("postrender", applyOffset);
        };

        map.on("postrender", applyOffset);
    };
    useEffect(() => {
        const renderSelectedLine = Object.values(isChecked).filter((val) => val === true).length;
        setSelectedLine(renderSelectedLine);
    }, [isChecked, setSelectedLine]);

    return reports.map((report) => {
        const author = report.author?.username || "-";
        const date = report.opening_date ? new Date(report.opening_date).toLocaleDateString() : "-";
        const department = report.commune ? `${report.commune.title} (${report.departement?.name})` : "-";
        const themes = report.attributes && report.attributes.length > 0 ? report.attributes.map((attr) => attr.theme || "").join(", ") : "-";
        const status = report.status || "-";

        return {
            id: report.id,
            original: report,
            comment: report.comment || "-",

            exportData: {
                author,
                opening_date: date,
                department,
                theme: themes,
                status,
            },
            row: [
                <Checkbox
                    options={[
                        {
                            label: <span className="fr-sr-only">Séléctionner un signalement </span>,
                            nativeInputProps: {
                                checked: !!isChecked[report.id],
                                onChange: (e) => {
                                    setIsChecked({
                                        ...isChecked,
                                        [report.id]: e.target.checked,
                                    });
                                },
                            },
                        },
                    ]}
                    small
                />,
                report.id,
                author,
                date,
                department,
                <Tag>{themes}</Tag>,
                <Badge severity="info" noIcon>
                    {status}
                </Badge>,
                <div>
                    <Button
                        iconId="fr-icon-road-map-line"
                        className="fr-icon--sm fr-mr-7v"
                        priority="tertiary no outline"
                        title="Afficher le signalement"
                        onClick={() => handleShowOnMap(report)}
                    />
                    <Button
                        iconId="fr-icon-arrow-right-line"
                        className="fr-icon--sm"
                        priority="tertiary no outline"
                        title="Afficher sur la carte"
                        onClick={() => setSelectedReport(report)}
                    />
                </div>,
            ],
        };
    });
};
export default TransformReportsToTableData;
