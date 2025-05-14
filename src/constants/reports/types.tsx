import { CommunityTheme } from "../communities/types";

export type StatusKey = "submit" | "pending" | "valid" | "reject" | "test";
export interface CommunityReport {
    id: number;
    geometry: string;
    comment: string;
    themes: CommunityTheme[];
    status: StatusKey;
}
