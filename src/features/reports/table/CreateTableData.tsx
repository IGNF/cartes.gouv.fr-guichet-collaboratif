import { CommunityReport, StatusKey } from "@/constants/reports/types";
import { reportImgStatus, extractPointCoords, formatDateISO } from "@/constants/utils";
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
        const id = report.id;
        const author = report.author?.username || "-";
        const id_author = report.author?.id || "-";
        const date = report.opening_date ? new Date(report.opening_date).toLocaleDateString() : "-";
        const updating_date = report.updating_date ? new Date(report.updating_date).toLocaleDateString() : "-";
        const closing_date = report.closing_date ? new Date(report.closing_date).toLocaleDateString() : "-";
        const attributs = JSON.stringify(report.attributes, null, 2);
        const document = report.attachments.map((attachment) => `/document/download/${attachment.id}`).join(";");
        const departement = report.commune ? `${report.commune.title} (${report.departement?.name})` : "-";
        const status = report.status || "-";
        const comment = report.comment || "-";
        const statusText = reportImgStatus[status as StatusKey].text;
        const replyDate = report.replies?.filter((reply) => reply.date)?.slice(-1)[0]?.date || "-";
        const reply = report.replies?.filter((reply) => reply.content)?.slice(-1)[0]?.content + "(" + formatDateISO(replyDate) + ")" || "-";

        const coords = extractPointCoords(report.geometry);

        return {
            id: id,
            original: report,
            comment: comment,

            exportData: {
                x: JSON.stringify(coords?.x, null, 2),
                y: JSON.stringify(coords?.y, null, 2),
                id: id,
                status: statusText,
                comment,
                author,
                id_author,
                opening_date: date,
                updating_date,
                closing_date,
                attributs: attributs,
                document,
                departement,
                statusCode: report.status || "-",
                reply,
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
