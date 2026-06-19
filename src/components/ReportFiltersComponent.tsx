import { useMemo } from "react";
import { useCommunityStore, useReportStore } from "@/store";
import { reportImgStatus } from "@/constants/utils";
import { StatusKey } from "@/constants/reports/types";
import { useTranslation } from "@/i18n";
import CreateTableData from "@/features/reports/table/CreateTableData";
import Tag from "@codegouvfr/react-dsfr/Tag";
import Badge from "@codegouvfr/react-dsfr/Badge";
interface ReportFiltersProps {
    reportStatus: string;
}
const ReportFiltersComponent = ({ reportStatus }: ReportFiltersProps) => {
    const { t } = useTranslation({ ReportFiltersComponent });
    const { reports, currentFilters, selectedReport, setCurrentFilters, setDrawerOpened, setTableDrawerOpened, setIsChecked, isChecked } = useReportStore();

    const { community } = useCommunityStore();

    const tableData = useMemo(() => CreateTableData(reports ?? [], isChecked), [reports, isChecked]);

    const checkedIds = useMemo(() => {
        return tableData.filter((res) => res.id === selectedReport?.id).map((tab) => tab.original);
    }, [tableData, selectedReport]);

    const currentReport = checkedIds.length === 1 ? checkedIds[0] : (selectedReport ?? null);

    const author = currentReport?.author?.username || "-";
    const date = currentReport?.opening_date ? new Date(currentReport?.opening_date).toLocaleDateString() : "-";
    const commune = currentReport?.commune ? currentReport?.commune.title : "-";
    const departement = currentReport?.departement ? `${currentReport?.departement.title} (${currentReport?.departement?.name})` : "-";
    const themes =
        currentReport?.themes && currentReport.themes.length > 0
            ? currentReport.themes
                  .map((theme) => theme.theme || "")
                  .filter(Boolean)
                  .join(", ")
            : currentReport?.attributes && currentReport.attributes.length > 0
              ? currentReport.attributes
                    .map((attr) => attr.theme || "")
                    .filter(Boolean)
                    .join(", ") || "-"
              : "-";
    const status = currentReport?.status || "-";
    const statusText = reportImgStatus[status as StatusKey]?.text || "";

    const statusLabel = reportImgStatus[reportStatus as StatusKey]?.text || "";

    const applyReportFilter = (updatedFilters: typeof currentFilters) => {
        setCurrentFilters(updatedFilters);
        setDrawerOpened(false);
        setTableDrawerOpened(true);
        setIsChecked({});
    };

    function convertDateToIso(dateStr: string): string {
        const [day, month, year] = dateStr.split("/");
        if (!day || !month || !year) return "";

        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    return (
        <ul className="fr-links-group report-filter__container fr-mb-6v fr-mt-4v">
            {author !== "-" && (
                <li>
                    <a
                        href="#"
                        title={t("author")}
                        className="fr-link report-filter__item"
                        onClick={async (e: React.MouseEvent) => {
                            e.preventDefault();
                            if (!community) return;
                            const authorFilter = currentReport?.author?.id ?? null;
                            applyReportFilter({ ...currentFilters, author: authorFilter });
                        }}
                    >
                        {author}
                    </a>
                </li>
            )}
            {date !== "-" && (
                <li>
                    <a
                        href="#"
                        title={t("date")}
                        className="fr-link report-filter__item"
                        onClick={async (e: React.MouseEvent) => {
                            e.preventDefault();
                            if (!community) return;
                            const dateFilter = convertDateToIso(date ?? "");
                            applyReportFilter({ ...currentFilters, opening_date: dateFilter });
                        }}
                    >
                        {date}
                    </a>
                </li>
            )}
            {commune !== "-" && (
                <li>
                    <a
                        href="#"
                        title={t("city")}
                        className="fr-link report-filter__item"
                        onClick={async (e: React.MouseEvent) => {
                            e.preventDefault();
                            if (!community) return;
                            const communeFilter = currentReport?.commune?.name ?? "";
                            applyReportFilter({ ...currentFilters, commune: communeFilter });
                        }}
                    >
                        {commune}
                    </a>
                </li>
            )}
            {departement !== "-" && (
                <li>
                    <a
                        href="#"
                        title={t("department")}
                        className="fr-link report-filter__item"
                        onClick={async (e: React.MouseEvent) => {
                            e.preventDefault();
                            if (!community) return;
                            const departementFilter = currentReport?.departement?.name;
                            applyReportFilter({ ...currentFilters, departement: departementFilter });
                        }}
                    >
                        {departement}
                    </a>
                </li>
            )}
            {themes !== "-" && (
                <li>
                    <Tag
                        linkProps={{
                            href: "#",
                            title: t("theme"),
                            className: "fr-link report-filter__item report-filter__item--no-underline",
                            onClick: async (e: React.MouseEvent) => {
                                e.preventDefault();
                                if (!community) return;
                                const themeFilter = currentReport?.themes?.[0]?.theme;
                                if (!themeFilter) return;
                                applyReportFilter({ ...currentFilters, theme: themeFilter });
                            },
                        }}
                    >
                        {themes}
                    </Tag>
                </li>
            )}
            {status !== "-" && (
                <li>
                    <a
                        href="#"
                        className="fr-link report-filter__item report-filter__item--no-underline"
                        onClick={async (e: React.MouseEvent) => {
                            e.preventDefault();
                            if (!community) return;
                            applyReportFilter({ ...currentFilters, status: status });
                        }}
                    >
                        <Badge severity="info" noIcon>
                            {statusText !== statusLabel && statusLabel !== "" ? statusLabel : statusText}
                        </Badge>
                    </a>
                </li>
            )}
        </ul>
    );
};

export default ReportFiltersComponent;
