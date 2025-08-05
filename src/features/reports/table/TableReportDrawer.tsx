import DrawerComponent from "@/components/DrawerComponent";
import { useReportStore } from "@/store";
import "./table-report-drawer.css";
import SearchReport from "./SearchReport";
import FilterAndSortReport from "./FilterAndSortReport";
import TableReport from "./TableReport";

const TableReportDrawer = () => {
    const { tableDrawerOpened, setTableDrawerOpened } = useReportStore();

    const handleCloseDrawer = () => {
        setTableDrawerOpened(false);
    };

    const drawerWidth = window.innerWidth * (2 / 3);
    return (
        <DrawerComponent anchor="right" isOpen={tableDrawerOpened} onClose={handleCloseDrawer}>
            <div className="table-report-drawer" style={{ width: drawerWidth }}>
                <SearchReport />
                <FilterAndSortReport />
                <TableReport />
            </div>
        </DrawerComponent>
    );
};

export default TableReportDrawer;
