import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReports, deleteCommunityReportAPI } from "@/api/reportsData";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useReportStore } from "@/store";
import { useCommunityStore } from "@/store/useCommunityStore";
import { REPORTS_API_URL } from "@/constants/urls";
import type { CommunityReport } from "@/constants/reports/types";
import { applyFiltersToReports } from "@/constants/reports/utils/reportFilters";
import usePagination from "@/hooks/usePagination";
import PaginationReport from "./PaginationReport";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import LoaderComponent from "@/components/LoaderComponent";
import { StatusMessage } from "@/constants/communities/types";
import TransformReportsToTableData from "@/components/TransformReportsToTableData";

const TableReport = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryClient = useQueryClient();
    const { community, addAlertMessage } = useCommunityStore();
    const { filteredReports, isFiltered, searchReport, isChecked, setIsChecked, setFilteredReports, currentFilters } = useReportStore();
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit")) || 10;
    const queryKey = `${REPORTS_API_URL}?communities=${community?.id}&page=${page}&limit=${limit}`;
    const {
        data: reports,
        isLoading,
        error: isErrorReport,
    } = useQuery<CommunityReport[]>({
        queryKey: [queryKey],
        queryFn: () => (community ? getReports(community.id) : Promise.resolve([])),
        enabled: !!community,
    });

    const {
        isPending: isDeleting,
        isError: isErrorDelete,
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
            setFilteredReports(filtered, filtered.length > 0);
            setIsChecked({});
        }
    }, [reports, currentFilters, searchReport, setFilteredReports, setIsChecked]);

    const reportsToUse = filteredReports.length > 0 ? filteredReports : (reports ?? []);
    const tableData = TransformReportsToTableData(reportsToUse);
    const matchingItems = tableData.filter((item) => item.row.some((col) => col?.toString().toLowerCase().includes(searchReport.toLowerCase())));

    const { totalPage, paginatedData } = usePagination(searchReport ? matchingItems : tableData, Number(searchParams.get("page")) || 1, limit);

    const handleDelete = () => {
        paginatedData
            .filter((res) => !!isChecked[res.id])
            .forEach((res) => {
                deleteReport(res.original);
            });
    };

    if (isLoading) return <LoaderComponent />;
    if (isErrorReport) return addAlertMessage(StatusMessage.error, "Erreur lors du chargement des signalements.");

    if (isDeleting) return <div style={{ textAlign: "center" }}>Suppression en cours...</div>;
    if (isErrorDelete) return addAlertMessage(StatusMessage.error, "Erreur de suppression");

    if (filteredReports.length === 0 && !isFiltered) {
        return <div>Aucun résultat ne correspond à vos filtres.</div>;
    }

    return (
        <>
            <Button onClick={() => handleDelete()}> delete </Button>
            <Table
                className="table-report__table"
                bordered
                noCaption
                headers={[
                    "Statut",
                    "Pseudo",
                    "Date de création",
                    "Commune (département)",
                    "Thème",
                    <Checkbox
                        options={[
                            {
                                label: <span className="fr-sr-only">Séléctionner tous les signalements de la page courante.</span>,
                                nativeInputProps: {
                                    checked: paginatedData.every((row) => !!isChecked[row.id]),
                                    onChange: (e) => {
                                        const allChecked = e.target.checked;
                                        const updated: Record<string, boolean> = { ...isChecked };
                                        paginatedData.forEach((row) => {
                                            updated[row.id] = allChecked;
                                        });

                                        setIsChecked(updated);
                                    },
                                },
                            },
                        ]}
                        small
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
