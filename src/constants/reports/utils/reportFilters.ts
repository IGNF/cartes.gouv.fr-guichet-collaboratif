import type { CommunityReport, FilterState } from "@/constants/reports/types";

export function sanitizeReportSearch(searchText: string): string {
    return searchText.replace(/["#]/g, "").replace(/^id:?/i, "").trim();
}

export function getReportIdFromSearch(searchText: string): number | null {
    const cleaned = sanitizeReportSearch(searchText);
    if (!cleaned) return null;
    if (!/^\d+$/.test(cleaned)) return null;

    const parsed = Number(cleaned);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function applyFiltersToReports(reports: CommunityReport[], filters: FilterState, searchText: string): CommunityReport[] {
    return reports?.filter((report) => {
        const matchesStatus = !filters.status || report.status === filters.status;

        const matchesTheme = !filters.theme || (report.attributes?.some((attr) => attr.theme === filters.theme) ?? false);

        const matchesAuthor = !filters.author || report.author?.id === filters.author;

        const matchesdepartement = !filters.departement || report.departement?.name === filters.departement;

        const search = sanitizeReportSearch(searchText);
        const matchesSearch = !searchText || String(report.id).includes(search);

        return matchesStatus && matchesTheme && matchesAuthor && matchesdepartement && matchesSearch;
    });
}
