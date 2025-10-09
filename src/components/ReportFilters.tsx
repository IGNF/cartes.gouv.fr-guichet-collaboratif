import { useEffect, useMemo } from "react";
import "./ReportFilters.css";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { useCommunityStore, useReportStore } from "@/store";
import { getTableReports } from "@/api/reportsData";
import CreateTableData from "@/features/reports/table/CreateTableData";

const ReportFilters = () => {
    const {
        reports,
        currentFilters,
        selectedReport,
        setCurrentFilters,
        setFilteredReports,
        setDrawerOpened,
        setTableDrawerOpened,
        setIsChecked,
        filteredReports,
        isChecked,
    } = useReportStore();

    const reportsToUse = useMemo(() => {
        return filteredReports.length > 0 ? filteredReports : (reports ?? []);
    }, [filteredReports, reports]);
    const tableData = useMemo(() => CreateTableData(reportsToUse, isChecked), [reportsToUse, isChecked]);

    const { community } = useCommunityStore();

    const checkedIds = useMemo(() => {
        return tableData.filter((res) => res.id === selectedReport?.id).map((tab) => tab.original);
    }, [tableData, selectedReport]);

    const currentReport = checkedIds.length === 1 ? checkedIds[0] : null;

    const author = currentReport?.author?.username || "-";
    const date = currentReport?.opening_date ? new Date(currentReport?.opening_date).toLocaleDateString() : "-";
    const commune = currentReport?.commune ? currentReport?.commune.title : "-";
    const departement = currentReport?.departement ? `${currentReport?.departement.title} (${currentReport?.departement?.name})` : "-";
    const themes =
        currentReport?.attributes && currentReport?.attributes.length > 0 ? currentReport?.attributes.map((attr) => attr.theme || "").join(", ") : "-";
    const status = currentReport?.status || "-";

    function convertDateToIso(dateStr: string): string {
        const [day, month, year] = dateStr.split("/");
        if (!day || !month || !year) return "";

        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
    useEffect(() => {
        async function fetchReports() {
            if (!community) return;
            const { data } = await getTableReports(community.id, 100, 1);
            setFilteredReports(data, true);
        }
        fetchReports();
    }, [community, setFilteredReports]);

    return (
        <ul className="fr-links-group reportFilter__container fr-mb-6v">
            <li>
                <a
                    href="#"
                    title="Voir les signalements de cet auteur"
                    className="fr-link reportFilter__item"
                    onClick={async (e: React.MouseEvent) => {
                        e.preventDefault();
                        if (!community) return;
                        const authorFilter = selectedReport?.author?.id ?? null;
                        setCurrentFilters({ ...currentFilters, author: authorFilter });
                        setDrawerOpened(false);
                        setTableDrawerOpened(true);
                        setIsChecked({});
                    }}
                >
                    {author}
                </a>
            </li>
            <li>
                <a
                    href="#"
                    title="Voir les signalements envoyés à partir de cette date"
                    className="fr-link reportFilter__item"
                    onClick={async (e: React.MouseEvent) => {
                        e.preventDefault();
                        if (!community) return;
                        const dateFilter = convertDateToIso(date ?? "");
                        setCurrentFilters({ ...currentFilters, opening_date: dateFilter });
                        setDrawerOpened(false);
                        setTableDrawerOpened(true);
                        setIsChecked({});
                    }}
                >
                    {date}
                </a>
            </li>
            <li>
                <a
                    href="#"
                    title="Voir les signalements de cette commune"
                    className="fr-link reportFilter__item"
                    onClick={async (e: React.MouseEvent) => {
                        e.preventDefault();
                        if (!community) return;
                        const communeFilter = selectedReport?.commune?.name ?? "";
                        setCurrentFilters({ ...currentFilters, commune: communeFilter });
                        setDrawerOpened(false);
                        setTableDrawerOpened(true);
                        setIsChecked({});
                    }}
                >
                    {commune}
                </a>
            </li>
            <li>
                <a
                    href="#"
                    title="Voir les signalements de ce département"
                    className="fr-link reportFilter__item"
                    onClick={async (e: React.MouseEvent) => {
                        e.preventDefault();
                        if (!community) return;
                        const departementFilter = selectedReport?.departement?.name;
                        setCurrentFilters({ ...currentFilters, departement: departementFilter });
                        setDrawerOpened(false);
                        setTableDrawerOpened(true);
                        setIsChecked({});
                    }}
                >
                    {departement}
                </a>
            </li>
            <li>
                <Tag
                    linkProps={{
                        href: "#",
                        title: "Voir les signalements de ce thème",
                        className: "fr-link reportFilter__item",
                        onClick: async (e: React.MouseEvent) => {
                            e.preventDefault();
                            if (!community) return;
                            const themeFilter = selectedReport?.themes?.[0].theme ?? "";
                            setCurrentFilters({ ...currentFilters, theme: themeFilter });
                            setDrawerOpened(false);
                            setTableDrawerOpened(true);
                            setIsChecked({});
                        },
                    }}
                >
                    {themes}
                </Tag>
            </li>
            <li>
                <a
                    href="#"
                    className="fr-link reportFilter__item"
                    onClick={async (e: React.MouseEvent) => {
                        e.preventDefault();
                        if (!community) return;
                        setCurrentFilters({ ...currentFilters, status: status });
                        setDrawerOpened(false);
                        setTableDrawerOpened(true);
                        setIsChecked({});
                    }}
                >
                    <Badge severity="info" noIcon>
                        {status}
                    </Badge>
                </a>
            </li>
        </ul>
    );
};

export default ReportFilters;
