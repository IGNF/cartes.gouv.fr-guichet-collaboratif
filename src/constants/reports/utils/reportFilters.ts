import type { CommunityReport, FilterState } from "@/constants/reports/types";

export function applyFiltersToReports(reports: CommunityReport[], filters: FilterState, searchText: string): CommunityReport[] {
    return reports.filter((report) => {
        const matchesStatus = !filters.status || report.status === filters.status;

        const matchesTheme = !filters.theme || (report.attributes?.some((attr) => attr.theme === filters.theme) ?? false);

        const matchesAuthor = !filters.author || report.author?.id === filters.author;

        const matchesdepartement = !filters.departement || report.departement?.name === filters.departement;

        const lowerSearch = searchText.toLowerCase();

        const matchesSearch = !searchText || (report.comment?.toLowerCase().includes(lowerSearch) ?? false);

        return matchesStatus && matchesTheme && matchesAuthor && matchesdepartement && matchesSearch;
    });
}
