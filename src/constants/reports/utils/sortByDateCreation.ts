import { CommunityReport } from "../types";

export function getSortByDateCreation(reports: CommunityReport[], order: "ASC" | "DESC") {
    return [...reports].sort((a, b) => {
        const dateA = a.opening_date ? new Date(a.opening_date).getTime() : 0;
        const dateB = b.opening_date ? new Date(b.opening_date).getTime() : 0;
        return order === "ASC" ? dateA - dateB : dateB - dateA;
    });
}
