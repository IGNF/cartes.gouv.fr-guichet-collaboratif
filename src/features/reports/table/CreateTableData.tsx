import { CommunityReport, StatusKey } from "@/constants/reports/types";
import { reportImgStatus } from "@/constants/utils";
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import Tag from "@codegouvfr/react-dsfr/Tag";

const CreateTableData = (
    reports: CommunityReport[],
    isChecked?: Record<number, boolean>,
    onCheckChange?: (id: number, checked: boolean) => void,
    onShowReportOnMap?: (report: CommunityReport) => void,
    onShowReport?: (report: CommunityReport) => void
) => {
    return reports.map((report) => {
        const author = report.author?.username || "-";
        const date = report.opening_date ? new Date(report.opening_date).toLocaleDateString() : "-";
        const departement = report.commune ? `${report.commune.title} (${report.departement?.name})` : "-";
        const themes = report.attributes && report.attributes.length > 0 ? report.attributes.map((attr) => attr.theme || "").join(", ") : "-";

        const status = report.status || "-";
        const statusText = reportImgStatus[status as StatusKey].text;

        return {
            id: report.id,
            original: report,
            comment: report.comment || "-",

            exportData: {
                author,
                opening_date: date,
                departement,
                theme: themes,
                statusText,
            },
            row: [
                <Checkbox
                    key={"check-" + report.id}
                    options={[
                        {
                            label: <span className="fr-sr-only">Sélectionner un signalement</span>,
                            nativeInputProps: {
                                checked: isChecked && !!isChecked[report.id],
                                onChange: (e) => onCheckChange && onCheckChange(report.id, e.target.checked),
                            },
                        },
                    ]}
                    small
                />,
                report.id,
                author,
                date,
                departement,
                <Tag>{report.attributes && report.attributes.length > 0 ? report.attributes.map((attr) => attr.theme || "").join(", ") : "-"}</Tag>,
                <Badge severity="info" noIcon>
                    {statusText || "-"}
                </Badge>,
                <div>
                    {onShowReport && (
                        <Button
                            key={"showMap-" + report.id}
                            iconId="fr-icon-road-map-line"
                            className="fr-icon--sm fr-mr-7v"
                            priority="tertiary no outline"
                            title="Afficher sur la carte"
                            onClick={() => onShowReport(report)}
                        />
                    )}
                    {onShowReportOnMap && (
                        <Button
                            iconId="fr-icon-arrow-right-line"
                            className="fr-icon--sm"
                            priority="tertiary no outline"
                            title="Afficher le signalement"
                            onClick={() => onShowReportOnMap(report)}
                        />
                    )}
                </div>,
            ],
        };
    });
};

export default CreateTableData;
