import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useReportStore } from "@/store";
import { useCommunityStore } from "@/store/useCommunityStore";
import { getReports } from "@/api/reportsData";
import usePagination from "@/hooks/usePagination";
import { REPORTS_API_URL } from "@/constants/urls";
import type { GetReportData } from "@/constants/reports/types";
import { Table } from "@codegouvfr/react-dsfr/Table";
import PaginationReport from "./PaginationReport";

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
    const { filteredReports, isFiltered } = useReportStore();
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
    const limit = Number(searchParams.get("limit")) || 10;
    const tableData = transformReportsToTableData(filteredReports.length > 0 ? filteredReports : (reports ?? []));
    const { totalPage, paginatedData } = usePagination(tableData, Number(searchParams.get("page")) || 1, limit);

    if (isLoading) return <div>Chargement des signalements...</div>;
    if (error) return <div>Erreur lors du chargement des signalements.</div>;
    if (filteredReports.length === 0 && isFiltered) {
        return <div>Aucun résultat ne correspond à vos filtres.</div>;
    }

    return (
        <>
            <Table bordered noCaption headers={["Statut", "Pseudo", "Date de création", "Commune (département)", "Thème"]} data={paginatedData} fixed />
            <PaginationReport totalPage={totalPage} searchParams={searchParams} setSearchParams={setSearchParams} />
        </>
    );
};

export default TableReport;
