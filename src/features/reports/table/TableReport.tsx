import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CSVLink } from "react-csv";
import { getTableReports, deleteCommunityReportAPI } from "@/api/reportsData";
import { useReportStore, useModalStore } from "@/store";
import { useCommunityStore } from "@/store/useCommunityStore";
import { REPORT_TABLE_LIMIT_OPTIONS } from "@/constants/reports/utils";
import type { CommunityReport } from "@/constants/reports/types";
import { StatusMessage } from "@/constants/communities/types";
import { applyFiltersToReports } from "@/constants/reports/utils/reportFilters";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import LoaderComponent from "@/components/LoaderComponent";
import TransformReportsToTableData from "@/components/TransformReportsToTableData";
import { SelectComponent } from "@/components/FilterAndSortReport";
import PaginationReport from "./PaginationReport";

type FilterHeaderKey = "status" | "author" | "opening_date" | "department" | "theme";

const TableReport = () => {
    const [sortOrder, setSortOrder] = useState<"ASC" | "DESC" | undefined>(undefined);

    const queryClient = useQueryClient();
    const { alertMessages, removeAlertMessage, community, addAlertMessage } = useCommunityStore();
    const {
        limitPerPage,
        filteredReports,
        setFilteredReports,
        searchReport,
        isChecked,
        setIsChecked,
        currentPage,
        currentFilters,
        setLimitPerPage,
        selectedLine,
        setSelectedLine,
        sortBy,
        setSortBy,
        setCurrentPage,
    } = useReportStore();

    const { replyReportModal } = useModalStore();
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
        queryKey: ["reports", community?.id, limitPerPage, currentPage, filters, searchReport, sortBy, sortOrder],
        queryFn: () => {
            return community
                ? getTableReports(community.id, limitPerPage, currentPage, filters, searchReport, sortBy)
                : Promise.resolve({ data: [], total: 0, currentPage: 1 });
        },
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
        onError: () => {},
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
    const downloadedTable = matchingItems.map((row) => row.exportData);

    const tableHeaderToLabel: Record<FilterHeaderKey, string> = {
        author: "Auteur",
        opening_date: "Date de création",
        department: "Département",
        theme: "Thème",
        status: "Statut",
    };

    const tableHeader = (Object.entries(tableHeaderToLabel) as [FilterHeaderKey, string][]).map(([key, label]) => ({
        key: key,
        label,
    }));

    const sortByStatus = () => {
        setSortOrder((prev) => {
            const newOrder = prev === "ASC" ? "DESC" : "ASC";
            const sortParams = `status:${newOrder}`;
            setSortBy(sortParams);
            setCurrentPage(1);
            return newOrder;
        });
    };
    const sortByDateCreation = () => {
        setSortOrder((prev) => {
            const newOrder = prev === "ASC" ? "DESC" : "ASC";
            const sortParams = `opening_date:${newOrder}`;
            setSortBy(sortParams);
            setCurrentPage(1);
            return newOrder;
        });
    };

    return (
        <>
            {isLoading && <LoaderComponent />}
            {isLoading || filteredReports.length > 0 ? (
                <>
                    <div className="report-textResult fr-mt-5v">
                        Résultats{" "}
                        <Badge severity="info" noIcon>
                            {total}
                        </Badge>
                    </div>
                    <div className="report-infos-line">
                        <div className="report-nbrSelectedLines">
                            Nombre de lignes sélectionnées: <span>{selectedLine}</span>
                        </div>
                        <div className="report-btns">
                            <CSVLink
                                className="fr-btn fr-btn--secondary report-download__btn fr-icon-download-line fr-icon--sm"
                                headers={tableHeader}
                                data={downloadedTable}
                                filename="export-filtre.csv"
                            ></CSVLink>
                            <Button
                                type="button"
                                onClick={() => handleDelete()}
                                iconId="fr-icon-delete-line"
                                className="fr-icon--sm"
                                title="Supprimer un signalement"
                                priority="secondary"
                            />
                            <Button
                                nativeButtonProps={replyReportModal.buttonProps}
                                type="button"
                                disabled={!isChecked || !Object.values(isChecked).some(Boolean)}
                            >
                                répondre
                            </Button>
                        </div>
                    </div>
                    <Table
                        className="table-report__table"
                        bordered
                        noCaption
                        headers={[
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

                                                if (allChecked) {
                                                    setSelectedLine(limitPerPage);
                                                } else {
                                                    setSelectedLine(0);
                                                }
                                                setIsChecked(updated);
                                            },
                                        },
                                    },
                                ]}
                                small
                            />,
                            "Pseudo",
                            <Button
                                type="button"
                                className="table-report__sort"
                                onClick={sortByDateCreation}
                                title="Trier par date de création"
                                priority="tertiary no outline"
                            >
                                Création <span className="fr-icon-arrow-up-down-line fr-icon--sm" aria-hidden="true"></span>
                            </Button>,
                            "Commune (département)",
                            <Button type="button" className="table-report__sort" title="Trier par thème" priority="tertiary no outline">
                                Thème
                            </Button>,
                            <Button type="button" className="table-report__sort" onClick={sortByStatus} title="Trier par statut" priority="tertiary no outline">
                                Statut <span className="fr-icon-arrow-up-down-line fr-icon--sm fr-ml-1w" aria-hidden="true"></span>
                            </Button>,
                            "Actions",
                        ]}
                        data={tableData.map((res) => res.row)}
                        fixed
                    />
                    <div className="report-footer">
                        <SelectComponent
                            onChange={(selectedIndex) => {
                                setLimitPerPage(REPORT_TABLE_LIMIT_OPTIONS[selectedIndex]);
                            }}
                            name="limit"
                            defaultOption="Nombre de ligne par page"
                            options={REPORT_TABLE_LIMIT_OPTIONS}
                        />
                        <PaginationReport totalPages={totalPages} currentPage={currentPage} />
                    </div>
                </>
            ) : (
                <div> Aucun résultat ne correspond à votre recherche.</div>
            )}
        </>
    );
};

export default TableReport;
