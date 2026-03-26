import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/i18n";
import VectorSource from "ol/source/Vector";
import { getCommunityReportById, getAllReportsForExport, getTableReports } from "@/api/reportsData";
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
    const [isPreparingExport, setIsPreparingExport] = useState(false);
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
        sortBy,
        setSortBy,
        setCurrentPage,
        setSelectedReport,
        reportTableWidth,
        toggleSortByDateCreation,
        syncUrlFromState,
        getSelectedLineCount,
    } = useReportStore();

    const selectedLineCount = getSelectedLineCount();
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
        queryFn: () =>
            community
                ? getTableReports(community.id, limitPerPage, currentPage, filters, searchReport, sortBy)
                : Promise.resolve({ data: [], total: 0, currentPage: 1 }),
        enabled: !!community,
    });

    const reports = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);
    const total = data?.total ?? 10;
    const totalPages = Math.ceil(total / limitPerPage);

    useEffect(() => {
        if (isErrorReport) addAlertMessage(StatusMessage.error, t("error"), 3000);
    }, [isErrorReport, addAlertMessage, t]);

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
        (report: CommunityReport) => handleShowOnMap(report, map, clusterSource, localStorageData, t, reportTableWidth),
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

    const onCheckChange = useCallback((id: number, checked: boolean) => setIsChecked({ ...isChecked, [id]: checked }), [isChecked, setIsChecked]);

    const reportsToUse = useMemo(() => (filteredReports.length > 0 ? filteredReports : (reports ?? [])), [filteredReports, reports]);

    const tableData = useMemo(
        () => CreateTableData(reportsToUse, isChecked, onCheckChange, onShowReportOnMap, onShowOnMap),
        [reportsToUse, isChecked, onCheckChange, onShowReportOnMap, onShowOnMap]
    );

    const allLinesAreAllowed = tableData.some((row) => !!isChecked[String(row.id)] && STATUS_NOT_ALLOWED.includes(row.exportData.statusCode));

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
        key,
        label,
    }));

    const onDownloadCsv = useCallback(async () => {
        if (!community) return;
        try {
            setIsPreparingExport(true);

            const hasSelection = Object.values(isChecked).some(Boolean);

            const linesToExport = hasSelection
                ? tableData.filter((line) => !!isChecked[String(line.id)])
                : CreateTableData(
                      applyFiltersToReports(await getAllReportsForExport(community.id, filters, searchReport, sortBy), currentFilters, searchReport),
                      isChecked,
                      onCheckChange,
                      onShowReportOnMap,
                      onShowOnMap
                  );

            const downloadedTable = linesToExport.map((line) => line.exportData);

            const escapeCsvValue = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
            const csv = [
                tableHeader.map((h) => escapeCsvValue(h.label)).join(";"),
                ...downloadedTable.map((line) => tableHeader.map((h) => escapeCsvValue(line[h.key])).join(";")),
            ].join("\n");

            const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "export-reports.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch {
            addAlertMessage(StatusMessage.error, t("error"), 3000);
        } finally {
            setIsPreparingExport(false);
        }
    }, [community, filters, searchReport, sortBy, isChecked, onCheckChange, onShowReportOnMap, onShowOnMap, tableHeader, addAlertMessage, t]);

    const sortByStatus = () => {
        setSortOrder((prev) => {
            const newOrder = prev === "ASC" ? "DESC" : "ASC";
            setSortBy(`status:${newOrder}`);
            setCurrentPage(1);
            return newOrder;
        });
    };

    return (
        <>
            {(isLoading || isPreparingExport) && <LoaderComponent />}
            {isLoading || filteredReports.length > 0 ? (
                <>
                    <div className="report-textResult fr-mt-5v">
                        {t("result_count")}{" "}
                        <Badge severity="info" noIcon>
                            {total}
                        </Badge>
                    </div>
                    <div className="report-infos-line">
                        <div className="report-nbrSelectedLines">
                            {selectedLineCount > 0 ? (
                                <>
                                    {t("selected_lines")} <span>{selectedLineCount}</span>
                                </>
                            ) : (
                                t("no_lines")
                            )}
                        </div>
                        <div className="report-btns">
                            <Button
                                type="button"
                                className="report-download__btn"
                                iconId="fr-icon-download-line"
                                title={t("export_button")}
                                priority="secondary"
                                disabled={isPreparingExport}
                                onClick={onDownloadCsv}
                            />
                            <Button
                                type="button"
                                nativeButtonProps={deleteReportModal.buttonProps}
                                iconId="fr-icon-delete-line"
                                className="fr-icon--sm"
                                title={t("delete_button")}
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
                                        label: <span className="fr-sr-only">{t("select_all")}</span>,
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
                            "id",
                            "Pseudo",
                            <Button
                                type="button"
                                className="table-report__sort"
                                onClick={() => toggleSortByDateCreation()}
                                title="Trier par date de création"
                                priority="tertiary no outline"
                            >
                                {t("creation")} <span className="fr-icon-arrow-up-down-line fr-icon--sm" aria-hidden="true" />
                            </Button>,
                            "Commune (département)",
                            <Button type="button" className="table-report__sort" title="Trier par thème" priority="tertiary no outline">
                                {t("theme")}
                            </Button>,
                            <Button type="button" className="table-report__sort" onClick={sortByStatus} title="Trier par statut" priority="tertiary no outline">
                                {t("status")} <span className="fr-icon-arrow-up-down-line fr-icon--sm fr-ml-1w" aria-hidden="true" />
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
                            defaultOption={t("results_per_page")}
                            options={REPORT_TABLE_LIMIT_OPTIONS}
                        />
                        <PaginationReport totalPages={totalPages} currentPage={currentPage} />
                    </div>
                </>
            ) : (
                <div>{t("no_result")}</div>
            )}
            <ConfirmDeleteReportModal />
        </>
    );
};

export default TableReport;
