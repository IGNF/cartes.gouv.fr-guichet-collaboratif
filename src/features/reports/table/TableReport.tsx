import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReports, deleteCommunityReportAPI } from "@/api/reportsData";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useReportStore } from "@/store";
import { useCommunityStore } from "@/store/useCommunityStore";
import { REPORTS_API_URL } from "@/constants/urls";
import type { CommunityReport } from "@/constants/reports/types";
import usePagination from "@/hooks/usePagination";
import PaginationReport from "./PaginationReport";

const TableReport = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { community } = useCommunityStore();
    const { filteredReports, isFiltered } = useReportStore();
    const [isChecked, setIsChecked] = useState<Record<string, boolean>>({});
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

    const { mutate: deleteReport } = useMutation({
        mutationFn: (report: CommunityReport) => deleteCommunityReportAPI(report),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [queryKey] });
        },
        onError: (error) => {
            console.error("Erreur suppression :", error);
        },
    });

    const limit = Number(searchParams.get("limit")) || 10;
    const transformReportsToTableData = (reports: CommunityReport[]) => {
        return reports.map((report) => ({
            id: report.id,
            original: report,
            row: [
                report.id,
                report.status || "-",
                report.author?.username || "-",
                report.opening_date ? new Date(report.opening_date).toLocaleDateString() : "-",
                report.commune ? `${report.commune.title} (${report.departement?.name})` : "-",
                report.attributes && report.attributes.length > 0 ? report.attributes.map((attr) => attr.theme || "").join(", ") : "-",
                <input
                    type="checkbox"
                    checked={!!isChecked[report.id]}
                    onChange={(e) => {
                        setIsChecked((prev) => ({ ...prev, [report.id]: e.target.checked }));
                    }}
                />,
            ],
        }));
    };

    const reportsToUse = filteredReports.length > 0 ? filteredReports : (reports ?? []);
    const tableData = transformReportsToTableData(reportsToUse);
    const { totalPage, paginatedData } = usePagination(tableData, Number(searchParams.get("page")) || 1, limit);

    const handleDelete = () => {
        paginatedData
            .filter((res) => !!isChecked[res.id])
            .forEach((res) => {
                deleteReport(res.original);
            });
    };

    if (isLoading) return <div>Chargement des signalements...</div>;
    if (error) return <div>Erreur lors du chargement des signalements.</div>;
    if (filteredReports.length === 0 && isFiltered) {
        return <div>Aucun résultat ne correspond à vos filtres.</div>;
    }
    return (
        <>
            <Table
                className="table-report__table"
                bordered
                noCaption
                headers={[
                    "id",
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
                // start from the second col and skip col with the id
                data={paginatedData.map((res) => res.row)}
                fixed
            />
            <Button onClick={() => handleDelete()}> delete </Button>
            <PaginationReport totalPage={totalPage} searchParams={searchParams} setSearchParams={setSearchParams} />
        </>
    );
};

export default TableReport;
