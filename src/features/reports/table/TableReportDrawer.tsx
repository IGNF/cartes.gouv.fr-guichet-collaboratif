import { useState } from "react";
import { useReportStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import SearchReport from "@/components/SearchReport";
import FilterAndSortReport from "@/components/FilterAndSortReport";
import TableReport from "./TableReport";
import "./table-report-drawer.css";

interface Props {
    handleCloseDrawer: () => void;
}

const TableReportDrawer = ({ handleCloseDrawer }: Props) => {
    const [showFilter, setShowFilter] = useState(false);

    const { reportTableWidth } = useReportStore();
    return (
        <div className="table-report-drawer" style={{ width: reportTableWidth }}>
            <div className="drawer-close">
                <Button iconId="ri-close-line" onClick={handleCloseDrawer} priority="tertiary no outline">
                    Fermer
                </Button>
            </div>
            <h1>
                <span className="fr-icon-discuss-line fr-icon--lg" aria-hidden="true"></span> Signalements
            </h1>
            <div className="table-report-searchFilter">
                <SearchReport />
                <Button
                    type="button"
                    onClick={() => setShowFilter(!showFilter)}
                    priority="secondary"
                    iconId={`${!showFilter ? "fr-icon-equalizer-line" : "fr-icon-close-line"}`}
                >
                    Filtres
                </Button>
            </div>

            {showFilter && <FilterAndSortReport />}
            <TableReport />
        </div>
    );
};

export default TableReportDrawer;
