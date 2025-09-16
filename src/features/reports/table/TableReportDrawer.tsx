import { useState } from "react";
import { useReportStore } from "@/store";
import Button from "@codegouvfr/react-dsfr/Button";
import SearchReport from "@/components/SearchReport";
import FilterAndSortReport from "@/components/FilterAndSortReport";
import DrawerComponent from "@/components/DrawerComponent";
import TableReport from "./TableReport";
import "./table-report-drawer.css";

const TableReportDrawer = () => {
    const [showFilter, setShowFilter] = useState(false);
    const { tableDrawerOpened, setTableDrawerOpened, reportTableWidth } = useReportStore();

    const handleCloseDrawer = () => {
        setTableDrawerOpened(false);
    };

    return (
        <DrawerComponent anchor="left" isOpen={tableDrawerOpened} onClose={handleCloseDrawer}>
            <div className="table-report-drawer" style={{ width: reportTableWidth }}>
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
        </DrawerComponent>
    );
};

export default TableReportDrawer;
