import { CommunityReport } from "../types";

// Convert reports obj into arrays of displayable strings for each table row..
export const mapReportsToTableRows = (reports: CommunityReport[]) => {
    return reports.map((report) => [
        report.status || "-",
        report.author?.username || "-",
        report.opening_date ? new Date(report.opening_date).toLocaleDateString() : "-",
        report.commune ? `${report.commune.title} (${report.departement?.name})` : "-",
        report.attributes && report.attributes.length > 0 ? report.attributes.map((attr) => attr.theme || "").join(", ") : "-",
    ]);
};
