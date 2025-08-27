import { CommunityReport } from "@/constants/reports/types";
import { useReportStore } from "@/store";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";

const TransformReportsToTableData = (reports: CommunityReport[]) => {
    const { isChecked, setIsChecked } = useReportStore();
    return reports.map((report) => ({
        id: report.id,
        original: report,
        comment: report.comment || "-",
        row: [
            report.status || "-",
            report.author?.username || "-",
            report.opening_date ? new Date(report.opening_date).toLocaleDateString() : "-",
            report.commune ? `${report.commune.title} (${report.departement?.name})` : "-",
            report.attributes && report.attributes.length > 0 ? report.attributes.map((attr) => attr.theme || "").join(", ") : "-",

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
        ],
    }));
};
export default TransformReportsToTableData;
