import VectorSource from "ol/source/Vector";
import { handleShowOnMap } from "@/constants/utils";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { CommunityReport } from "@/constants/reports/types";
import { useLocalStorageStore, useMapStore, useReportStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Tag from "@codegouvfr/react-dsfr/Tag";
import GetReportsLayer from "@/features/navigation/layers/GetReportsLayer";
import { useTranslation } from "@/i18n";

const TransformReportsToTableData = (reports: CommunityReport[]) => {
    const { t } = useTranslation({ GetReportsLayer });
    const { localStorageData } = useLocalStorageStore();
    const { map } = useMapStore();
    const { isChecked, setIsChecked, reportTableWidth, setSelectedReport } = useReportStore();

    const clusterLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE);
    const clusterSource = clusterLayer?.getSource() as VectorSource;

    const showOnMap = (report: CommunityReport) => {
        setSelectedReport(report);
        handleShowOnMap(report, map, clusterSource, localStorageData, t, reportTableWidth);
    };

    return reports?.map((report) => {
        const author = report.author?.username || "-";
        const date = report.opening_date ? new Date(report.opening_date).toLocaleDateString() : "-";
        const departement = report.commune ? `${report.commune.title} (${report.departement?.name})` : "-";
        const themes = report.attributes && report.attributes.length > 0 ? report.attributes.map((attr) => attr.theme || "").join(", ") : "-";
        const status = report.status || "-";

        return {
            id: report.id,
            original: report,
            comment: report.comment || "-",

            exportData: {
                author,
                opening_date: date,
                departement,
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
                author,
                date,
                departement,
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
                        onClick={() => handleShowOnMap(report, map, clusterSource, localStorageData, t, reportTableWidth)}
                    />
                    <Button
                        iconId="fr-icon-arrow-right-line"
                        className="fr-icon--sm"
                        priority="tertiary no outline"
                        title="Afficher sur la carte"
                        onClick={() => showOnMap(report)}
                    />
                </div>,
            ],
        };
    });
};
export default TransformReportsToTableData;
