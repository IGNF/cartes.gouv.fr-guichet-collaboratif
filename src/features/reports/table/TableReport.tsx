import { Table } from "@codegouvfr/react-dsfr/Table";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import { useQuery } from "@tanstack/react-query";
import { getReports } from "@/api/reportsData";
import { useCommunityStore } from "@/store/useCommunityStore";
import type { GetReportData } from "@/constants/reports/types";
import { REPORTS_API_URL } from "@/constants/urls";

import "./TableReport.scss";

const transformReportsToTableData = (reports: GetReportData[]) => {
    return reports.map((report) => [
        report.status || "-",
        report.author?.username || "-",
        report.opening_date ? new Date(report.opening_date).toLocaleDateString() : "-",
        report.commune ? `${report.commune.title} ` : "-",
        report.attributes && report.attributes.length > 0 ? report.attributes.map((attr) => attr.theme || "").join(", ") : "-",
    ]);
};

const TableReport = () => {
    const { community } = useCommunityStore();
    const queryKey = `${REPORTS_API_URL}?communities=${community?.id}`;

    const {
        data: reports,
        isLoading,
        error,
    } = useQuery<GetReportData[]>({
        queryKey: [queryKey],
        queryFn: () => (community ? getReports(community.id) : Promise.resolve([])),
        enabled: !!community,
    });

    const tableData = reports ? transformReportsToTableData(reports) : [];

    if (isLoading) return <div>Chargement des signalements...</div>;
    if (error) return <div>Erreur lors du chargement des signalements.</div>;
    if (tableData.length === 0) return <div>Aucun signalement trouvé.</div>;
    return (
        <>
            <Table bordered noCaption headers={["statut", "pseudo", "date de création", "commune (département)", "thème"]} data={tableData} fixed />

            <div className="center-pagination">
                <Pagination
                    count={100}
                    defaultPage={1}
                    getPageLinkProps={(pageNumber: number) => ({
                        href: `#page=${pageNumber}`,
                        "aria-label": `Aller à la page ${pageNumber}`,
                    })}
                    showFirstLast
                />
            </div>
        </>
    );
};

export default TableReport;
