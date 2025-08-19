import type { CommunityReport } from "@/constants/reports/types";

interface FilterState {
    status: string;
    theme: string;
    author: number | null;
    department: string;
}

export function applyFiltersToReports(reports: CommunityReport[], filters: FilterState, searchText: string): CommunityReport[] {
    return reports.filter((report) => {
        const matchesStatus = !filters.status || report.status === filters.status;

        const matchesTheme = !filters.theme || (report.attributes?.some((attr) => attr.theme === filters.theme) ?? false);

        const matchesAuthor = !filters.author || report.author?.id === filters.author;

        const matchesDepartment = !filters.department || report.departement?.name === filters.department;

        const lowerSearch = searchText.toLowerCase();

        const matchesSearch =
            !searchText ||
            report.id.toString().includes(lowerSearch) ||
            (report.author?.username?.toLowerCase().includes(lowerSearch) ?? false) ||
            (report.commune?.title?.toLowerCase().includes(lowerSearch) ?? false) ||
            (report.status?.toLowerCase().includes(lowerSearch) ?? false);

        return matchesStatus && matchesTheme && matchesAuthor && matchesDepartment && matchesSearch;
    });
}
