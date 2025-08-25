import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CSVLink } from "react-csv";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { getReports, deleteCommunityReportAPI } from "@/api/reportsData";
import { useReportStore } from "@/store";
import { useCommunityStore } from "@/store/useCommunityStore";
import { REPORTS_API_URL } from "@/constants/urls";
import type { CommunityReport } from "@/constants/reports/types";
import { applyFiltersToReports } from "@/constants/reports/utils/reportFilters";
import usePagination from "@/hooks/usePagination";
import PaginationReport from "./PaginationReport";
type FilterHeaderKey = "status" | "author" | "opening_date" | "department" | "theme";

const TableReport = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { community } = useCommunityStore();
    const { filteredReports, searchReport, isChecked, setIsChecked, setFilteredReports, currentFilters } = useReportStore();
    const queryKey = `${REPORTS_API_URL}?communities=${community?.id}`;
    const {
        data: reports,
        isLoading,
        error,
    } = useQuery<CommunityReport[]>({
        queryKey: [queryKey],
        queryFn: () => (community ? getReports(community.id) : Promise.resolve([])),
        enabled: !!community,
    });

    const {
        isPending: isDeleting, // should we use this ?
        isError,
        mutate: deleteReport,
    } = useMutation({
        mutationFn: (report: CommunityReport) => deleteCommunityReportAPI(report),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
            setIsChecked({});
        },
        onError: (error) => {
            console.error("Erreur suppression :", error);
        },
    });
    useEffect(() => {
        if (reports) {
            const filtered = applyFiltersToReports(reports, currentFilters, searchReport);
            // No filter/search =>> everything should be displayed..
            // Active filters/search + empty list => specific error msg (see below)
            setFilteredReports(
                filtered,
                currentFilters.status !== "" ||
                    currentFilters.theme !== "" ||
                    currentFilters.author !== null ||
                    currentFilters.department !== "" ||
                    !!searchReport
            );
            setIsChecked({});
        }
    }, [reports, currentFilters, searchReport, setFilteredReports, setIsChecked]);

    const limit = Number(searchParams.get("limit")) || 10;
    const transformReportsToTableData = (reports: CommunityReport[]) => {
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
                <input
                    type="checkbox"
                    checked={!!isChecked[report.id]}
                    onChange={(e) => {
                        setIsChecked({
                            ...isChecked,
                            [report.id]: e.target.checked,
                        });
                    }}
                />,
            ],
        }));
    };

    const tableData = transformReportsToTableData(filteredReports);
    // search in comment
    const matchingItems = tableData.filter((item) => item.comment?.toString().toLowerCase().trim().includes(searchReport.toLowerCase().trim()));

    const { totalPage, paginatedData } = usePagination(searchReport ? matchingItems : tableData, Number(searchParams.get("page")) || 1, limit);

    const handleDelete = () => {
        paginatedData
            .filter((res) => !!isChecked[res.id])
            .forEach((res) => {
                deleteReport(res.original);
            });
    };
    const downloadedTable = matchingItems.map((row) => row.row.slice(0, -1));

    const headerKeys = ["status", "author", "opening_date", "department", "theme"];
    const csvData = downloadedTable.map((row) => Object.fromEntries(row.map((value, index) => [headerKeys[index], value])));

    const tableHeaderToLabel: Record<FilterHeaderKey, string> = {
        status: "Statut",
        author: "Auteur",
        opening_date: "Date de création",
        department: "Département",
        theme: "Thème",
    };

    const tableHeader = (Object.entries(tableHeaderToLabel) as [FilterHeaderKey, string][]).map(([key, label]) => ({
        key: key,
        label,
    }));

    if (isLoading) return <div>Chargement des signalements...</div>;
    if (error) return <div>Erreur lors du chargement des signalements.</div>;

    if (isDeleting) return <div style={{ textAlign: "center" }}>Suppression en cours...</div>; // should we use this ?
    if (isError) return <div style={{ color: "red" }}>Erreur de suppression</div>;

    if (filteredReports.length === 0) return <div>Aucun résultat ne correspond à vos filtres...</div>;

    return (
        <>
            <CSVLink className="fr-btn report-download__btn" headers={tableHeader} data={csvData} filename="export-filtre.csv">
                Télécharger
            </CSVLink>
            <Button onClick={() => handleDelete()}> supprimer </Button>
            <Table
                bordered
                noCaption
                headers={[
                    "Statut",
                    "Pseudo",
                    "Date de création",
                    "Commune (département)",
                    "Thème",
                    <input
                        type="checkbox"
                        checked={paginatedData.every((row) => !!isChecked[row.id])}
                        onChange={(e) => {
                            const allChecked = e.target.checked;
                            const updated: Record<string, boolean> = { ...isChecked };
                            // map on visible rows
                            paginatedData.forEach((row) => {
                                const id = row.id;
                                updated[id] = allChecked;
                            });

                            setIsChecked(updated);
                        }}
                    />,
                ]}
                data={paginatedData.map((res) => res.row)}
                fixed
            />
            <PaginationReport totalPage={totalPage} searchParams={searchParams} setSearchParams={setSearchParams} />
        </>
    );
};

export default TableReport;
