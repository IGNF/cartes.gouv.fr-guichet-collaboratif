import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n";
import { useModalStore, useReportStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import SearchReport from "@/components/SearchReport";
import FilterAndSortReport from "@/components/FilterAndSortReport";
import TableReport from "./TableReport";
import ShareReportFiltersModal from "../ShareReportFiltersModal";
import { getReportQueryParams, hasReportParams } from "@/constants/reports/utils";

interface Props {
    handleCloseDrawer: () => void;
}

const TableReportDrawer = ({ handleCloseDrawer }: Props) => {
    const { t } = useTranslation({ TableReportDrawer });
    const [showFilter, setShowFilter] = useState(false);
    const { shareReportFilters } = useModalStore();
    const { reportTableWidth, setCurrentFilters, setCurrentPage, setLimitPerPage, setSortBy, setSearchReport } = useReportStore();

    useEffect(() => {
        if (!hasReportParams()) {
            return;
        }

        const { status, theme, author, departement, search, sortBy, page, limit } = getReportQueryParams();
        setCurrentFilters({ status, theme, author, departement });
        setSearchReport(search);
        setSortBy(sortBy);
        setCurrentPage(page);
        setLimitPerPage(limit);
    }, [setCurrentFilters, setSearchReport, setSortBy, setCurrentPage, setLimitPerPage]);

    return (
        <div className="table-report-drawer" style={{ width: reportTableWidth }}>
            <div className="drawer-close">
                <Button iconId="ri-close-line" onClick={handleCloseDrawer} priority="tertiary no outline">
                    {t("close")}
                </Button>
            </div>
            <h2>
                <span className="fr-icon-discuss-line fr-icon--lg" aria-hidden="true" /> Signalements
            </h2>
            <div className="table-report-searchFilter">
                <SearchReport />
                <Button
                    type="button"
                    onClick={() => setShowFilter(!showFilter)}
                    priority="secondary"
                    iconId={`${!showFilter ? "fr-icon-equalizer-line" : "fr-icon-close-line"}`}
                >
                    {t("filters")}
                </Button>{" "}
                <Button priority="secondary" nativeButtonProps={shareReportFilters.buttonProps} iconId="ri-share-forward-fill">
                    {t("share")}
                </Button>
            </div>

            {(showFilter || hasReportParams()) && <FilterAndSortReport />}
            <TableReport />
            <ShareReportFiltersModal />
        </div>
    );
};

export default TableReportDrawer;
