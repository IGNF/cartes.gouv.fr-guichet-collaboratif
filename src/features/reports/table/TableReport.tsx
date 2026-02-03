import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CSVLink } from "react-csv";
import { useTranslation } from "@/i18n";
import VectorSource from "ol/source/Vector";
import { getCommunityReportById, getTableReports } from "@/api/reportsData";
import { useReportStore, useModalStore, useMapStore, useLocalStorageStore } from "@/store";
import { useCommunityStore } from "@/store/useCommunityStore";
import { handleShowOnMap, STATUS_NOT_ALLOWED } from "@/constants/utils";
import { REPORT_TABLE_LIMIT_OPTIONS, REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import GetReportsLayer from "@/features/navigation/layers/GetReportsLayer";
import { StatusMessage } from "@/constants/communities/types";
import { applyFiltersToReports } from "@/constants/reports/utils/reportFilters";
import { CommunityReport } from "@/constants/reports/types";
import Checkbox from "@codegouvfr/react-dsfr/Checkbox";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import LoaderComponent from "@/components/LoaderComponent";
import { SelectComponent } from "@/components/FilterAndSortReport";
import PaginationReport from "./PaginationReport";
import ConfirmDeleteReportModal from "../forms/ConfirmDeleteReportModal";
import CreateTableData from "./CreateTableData";

type FilterHeaderKey =
    | "x"
    | "y"
    | "id"
    | "status"
    | "comment"
    | "author"
    | "id_author"
    | "opening_date"
    | "updating_date"
    | "closing_date"
    | "attributs"
    | "document"
    | "departement"
    | "reply";

const TableReport = () => {
    const [sortOrder, setSortOrder] = useState<"ASC" | "DESC" | undefined>(undefined);
    const { t } = useTranslation({ GetReportsLayer });
    const { map } = useMapStore();
    const { localStorageData } = useLocalStorageStore();
    const clusterLayer = map?.getAllLayers().find((layer) => layer.get("type") === REPORTS_LAYER_TYPE);
    const clusterSource = clusterLayer?.getSource() as VectorSource;

    const { community, addAlertMessage } = useCommunityStore();
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
        setSelectedReport,
        reportTableWidth,
        toggleSortByDateCreation,
        syncUrlFromState,
    } = useReportStore();

    const { replyReportModal, deleteReportModal } = useModalStore();
    const filters = useMemo(
        () => ({
            status: currentFilters.status,
            theme: currentFilters.theme,
            author: currentFilters.author,
            departement: currentFilters.departement,
            commune: currentFilters.commune,
            opening_date: currentFilters.opening_date,
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

    const reports = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);
    const total = data?.total ?? 10;
    const totalPages = Math.ceil(total / limitPerPage);
    const { data: exportedData } = useQuery({
        queryKey: ["reports-export", community?.id, filters, searchReport, sortBy],
        queryFn: () => {
            return community ? getTableReports(community.id, total, 1, filters, searchReport, sortBy) : Promise.resolve({ data: [], total: 0, currentPage: 1 });
        },
        enabled: !!community,
    });

    useEffect(() => {
        if (isErrorReport) {
            addAlertMessage(StatusMessage.error, "Erreur lors du chargement des signalements.", 3000);
        }
    }, [isErrorReport, addAlertMessage]);

    useEffect(() => {
        if (reports) {
            const filtered = applyFiltersToReports(reports, currentFilters, searchReport);

            setFilteredReports(
                filtered,
                currentFilters.status !== "" ||
                    currentFilters.theme !== "" ||
                    currentFilters.author !== null ||
                    currentFilters.departement !== "" ||
                    !!searchReport
            );
        }
    }, [reports, currentFilters, searchReport, setFilteredReports, setIsChecked]);

    const onShowOnMap = useCallback(
        (report: CommunityReport) => {
            handleShowOnMap(report, map, clusterSource, localStorageData, t, reportTableWidth);
        },
        [map, clusterSource, localStorageData, t, reportTableWidth]
    );

    const onShowReportOnMap = useCallback(
        async (report: CommunityReport) => {
            const fullReport = await getCommunityReportById(report.id);
            if (!fullReport) return;

            setSelectedReport(fullReport);
            handleShowOnMap(fullReport, map, clusterSource, localStorageData, t, reportTableWidth);
        },
        [setSelectedReport, map, clusterSource, localStorageData, t, reportTableWidth]
    );

    const onCheckChange = useCallback(
        (id: number, checked: boolean) => {
            setIsChecked({
                ...isChecked,
                [id]: checked,
            });
        },
        [isChecked, setIsChecked]
    );
    const reportsToUse = useMemo(() => {
        return filteredReports.length > 0 ? filteredReports : (reports ?? []);
    }, [filteredReports, reports]);

    const tableData = useMemo(
        () => CreateTableData(reportsToUse, isChecked, onCheckChange, onShowReportOnMap, onShowOnMap),
        [reportsToUse, isChecked, onCheckChange, onShowReportOnMap, onShowOnMap]
    );

    const selectedLines = useMemo(() => {
        if (!exportedData || !Array.isArray(exportedData.data)) return [];
        return CreateTableData(exportedData.data, isChecked, onCheckChange, onShowReportOnMap, onShowOnMap);
    }, [exportedData, isChecked, onCheckChange, onShowReportOnMap, onShowOnMap]);

    const checkedLines = useMemo(() => {
        if (!Array.isArray(selectedLines) || !isChecked) return [];
        return selectedLines.filter((res) => !!isChecked[String(res.id)]).map((res) => res.exportData);
    }, [selectedLines, isChecked]);

    const allLinesAreAllowed = checkedLines.some((line) => STATUS_NOT_ALLOWED.includes(line.statusCode));

    const downloadedTable = useMemo(() => {
        if (checkedLines.length > 0) return checkedLines.map((exp) => exp);
        if (Array.isArray(selectedLines)) {
            return selectedLines.map((expData) => expData.exportData);
        }
        return [];
    }, [checkedLines, selectedLines]);

    const tableHeaderToLabel: Record<FilterHeaderKey, string> = {
        x: "X",
        y: "Y",
        id: t("tableHeaders.id"),
        status: t("tableHeaders.status"),
        comment: t("tableHeaders.comment"),
        author: t("tableHeaders.author"),
        id_author: t("tableHeaders.id_author"),
        opening_date: t("tableHeaders.opening_date"),
        updating_date: t("tableHeaders.updating_date"),
        closing_date: t("tableHeaders.closing_date"),
        attributs: t("tableHeaders.attributs"),
        departement: t("tableHeaders.departement"),
        document: t("tableHeaders.document"),
        reply: t("tableHeaders.reply"),
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
        toggleSortByDateCreation();
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
                            {selectedLine > 0 ? (
                                <>
                                    Nombre de lignes sélectionnées: <span>{selectedLine}</span>
                                </>
                            ) : (
                                "Pas de lignes sélectionnées"
                            )}
                        </div>
                        <div className="report-btns">
                            <CSVLink
                                className="fr-btn fr-btn--secondary report-download__btn fr-icon-download-line fr-icon--sm"
                                headers={tableHeader}
                                data={downloadedTable}
                                filename="export-reports.csv"
                                separator=";"
                            ></CSVLink>
                            <Button
                                type="button"
                                nativeButtonProps={deleteReportModal.buttonProps}
                                iconId="fr-icon-delete-line"
                                className="fr-icon--sm"
                                title="Supprimer un signalement"
                                priority="secondary"
                                disabled={!isChecked || !Object.values(isChecked).some(Boolean)}
                            />
                            <Button
                                nativeButtonProps={replyReportModal.buttonProps}
                                type="button"
                                disabled={!isChecked || !Object.values(isChecked).some(Boolean) || allLinesAreAllowed}
                            >
                                {t("report_reply")}
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
                            "id",
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
                                syncUrlFromState();
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

            <ConfirmDeleteReportModal />
        </>
    );
};

export default TableReport;
