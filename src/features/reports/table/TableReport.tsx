import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CSVLink } from "react-csv";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { getTableReports, deleteCommunityReportAPI } from "@/api/reportsData";
import { useReportStore } from "@/store";
import { useCommunityStore } from "@/store/useCommunityStore";
import type { CommunityReport } from "@/constants/reports/types";
import PaginationReport from "./PaginationReport";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import LoaderComponent from "@/components/LoaderComponent";
import { StatusMessage } from "@/constants/communities/types";
import TransformReportsToTableData from "@/components/TransformReportsToTableData";
import { REPORT_TABLE_HEADER_KEYS } from "@/constants/utils";
import { applyFiltersToReports } from "@/constants/reports/utils/reportFilters";
import { useEffect, useMemo } from "react";

type FilterHeaderKey = "status" | "author" | "opening_date" | "department" | "theme";

const TableReport = () => {
    const queryClient = useQueryClient();
    const { alertMessages, removeAlertMessage, community, addAlertMessage } = useCommunityStore();
    const { limitPerPage, filteredReports, setFilteredReports, isFiltered, searchReport, isChecked, setIsChecked, currentPage, currentFilters } =
        useReportStore();

    const filters = useMemo(
        () => ({
            status: currentFilters.status,
            theme: currentFilters.theme,
            author: currentFilters.author,
            department: currentFilters.department,
        }),
        [currentFilters]
    );
    const {
        data,
        isLoading,
        error: isErrorReport,
    } = useQuery({
        queryKey: ["reports", community?.id, limitPerPage, currentPage, searchReport, filters],
        queryFn: () =>
            community
                ? getTableReports(community.id, limitPerPage, currentPage, filters, searchReport)
                : Promise.resolve({ data: [], total: 0, currentPage: 1 }),
        enabled: !!community,
    });

    const reports = useMemo(() => data?.data ?? [], [data]);

    const total = data?.total ?? 0;
    const totalPages = Math.ceil(total / limitPerPage);

    const {
        isPending: isDeleting,
        isError: isErrorDelete,
        mutate: deleteReport,
    } = useMutation({
        mutationFn: (report: CommunityReport) => deleteCommunityReportAPI(report),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reports", community?.id, limitPerPage, currentPage] });
            setIsChecked({});
        },
        onError: (error) => {
            console.error("Erreur suppression :", error);
        },
    });

    useEffect(() => {
        if (isErrorReport) {
            addAlertMessage(StatusMessage.error, "Erreur lors du chargement des signalements.", 3000);
        }
    }, [isErrorReport, addAlertMessage]);

    useEffect(() => {
        if (isDeleting) {
            addAlertMessage(StatusMessage.error, "Suppression en cours...", 3000);
        } else {
            const erroId = alertMessages.map((alert) => alert.id);
            removeAlertMessage(Number(erroId));
        }
        if (isErrorDelete) {
            addAlertMessage(StatusMessage.error, "Erreur de suppression", 3000);
        }
    }, [isDeleting, isErrorDelete, addAlertMessage]);

    useEffect(() => {
        if (!isLoading && isFiltered && filteredReports.length === 0) {
            addAlertMessage(StatusMessage.error, "Aucun résultat ne correspond à votre recherche.", 3000);
        }
    }, [isLoading, isFiltered, filteredReports.length, addAlertMessage]);

    useEffect(() => {
        if (reports) {
            const filtered = applyFiltersToReports(reports, currentFilters, searchReport);

            setFilteredReports(
                filtered,
                currentFilters.status !== "" ||
                    currentFilters.theme !== "" ||
                    currentFilters.author !== null ||
                    currentFilters.department !== "" ||
                    !!searchReport
            );
        }
    }, [reports, currentFilters, searchReport, setFilteredReports, setIsChecked]);

    const reportsToUse = filteredReports.length > 0 ? filteredReports : (reports ?? []);
    const tableData = TransformReportsToTableData(reportsToUse);
    const matchingItems = searchReport
        ? tableData.filter((item) => item.row.some((col) => col?.toString().toLowerCase().includes(searchReport.toLowerCase())))
        : tableData;

    const handleDelete = () => {
        tableData
            .filter((res) => !!isChecked[res.id])
            .forEach((res) => {
                deleteReport(res.original);
            });
    };
    const downloadedTable = matchingItems.map((row) => row.row.slice(0, -1));

    const csvData = downloadedTable.map((row) => Object.fromEntries(row.map((value, index) => [REPORT_TABLE_HEADER_KEYS[index], value])));

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
    return (
        <>
            {isLoading && <LoaderComponent />}
            {isLoading || filteredReports.length > 0 ? (
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
                            <Checkbox
                                options={[
                                    {
                                        label: <span className="fr-sr-only">Séléctionner tous les signalements de la page courante.</span>,
                                        nativeInputProps: {
                                            checked: tableData.every((row) => !!isChecked[row.id]),
                                            onChange: (e) => {
                                                const allChecked = e.target.checked;
                                                const updated: Record<string, boolean> = { ...isChecked };
                                                tableData.forEach((row) => {
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
                        data={tableData.map((res) => res.row)}
                        fixed
                    />
                    <PaginationReport totalPages={totalPages} currentPage={currentPage} />
                </>
            ) : (
                <div> Aucun résultat ne correspond à votre recherche.</div>
            )}
        </>
    );
};

export default TableReport;
