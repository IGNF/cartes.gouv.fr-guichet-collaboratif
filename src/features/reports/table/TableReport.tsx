import { useSearchParams } from "react-router-dom";
import { useReportStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { getReports } from "@/api/reportsData";
import { useCommunityStore } from "@/store/useCommunityStore";
import { REPORTS_API_URL } from "@/constants/urls";
import type { GetReportData } from "@/constants/reports/types";
import PaginationReport from "./PaginationReport";
import { useEffect } from "react";

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
    const tableData = transformReportsToTableData(filteredReports.length > 0 ? filteredReports : (reports ?? []));
    const totalPage = Math.ceil(tableData.length / 10);
    const paginationArray = <T,>(data: T[], page: number, limit: number): T[] => {
        const startFrom = (page - 1) * limit;
        const end = page * limit;
        return data.slice(startFrom, end);
    };

    // go to initial page (page 1) when totalPage changes
    useEffect(() => {
        setSearchParams((prev) => ({ ...prev, page: "1" }));
        return () => {};
    }, [totalPage]);

    if (isLoading) return <div>Chargement des signalements...</div>;
    if (error) return <div>Erreur lors du chargement des signalements.</div>;
    if (filteredReports.length === 0 && isFiltered) {
        return <div>Aucun résultat ne correspond à vos filtres.</div>;
    }

    return (
        <>
            <Table
                bordered
                noCaption
                headers={["statut", "pseudo", "date de création", "commune (département)", "thème"]}
                data={paginationArray(tableData, Number(searchParams.get("page")) || 1, 10)} // Gets the page number from the url, if missing or invalid go to page 1
                fixed
            />

            <div className="center-pagination">
                <PaginationReport totalPage={totalPage} searchParams={searchParams} setSearchParams={setSearchParams} />
            </div>
        </>
    );
};

export default TableReport;
