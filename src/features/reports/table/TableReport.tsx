import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { getReports } from "@/api/reportsData";
import { useCommunityStore } from "@/store/useCommunityStore";
import { REPORTS_API_URL } from "@/constants/urls";
import type { GetReportData } from "@/constants/reports/types";
import PaginationReport from "./PaginationReport";
import usePagination from "@/hooks/usePagination";

const transformReportsToTableData = (reports: GetReportData[]) => {
    return reports.map((report) => [
        report.status || "-",
        report.author?.username || "-",
        report.opening_date ? new Date(report.opening_date).toLocaleDateString() : "-",
        report.commune ? `${report.commune.title} (${report.departement?.name})` : "-",
        report.attributes && report.attributes.length > 0 ? report.attributes.map((attr) => attr.theme || "").join(", ") : "-",
    ]);
};

const TableReport = () => {
    const [searchParams, setSearchParams] = useSearchParams();
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
    const { totalPage, paginatedData } = usePagination(tableData, Number(searchParams.get("page")) || 1, 10);

    if (isLoading) return <div>Chargement des signalements...</div>;
    if (error) return <div>Erreur lors du chargement des signalements.</div>;
    if (tableData.length === 0) return <div>Aucun signalement trouvé.</div>;

    return (
        <>
            <Table bordered noCaption headers={["statut", "pseudo", "date de création", "commune (département)", "thème"]} data={paginatedData} fixed />

            <div className="center-pagination">
                <PaginationReport totalPage={totalPage} searchParams={searchParams} setSearchParams={setSearchParams} />
            </div>
        </>
    );
};

export default TableReport;
