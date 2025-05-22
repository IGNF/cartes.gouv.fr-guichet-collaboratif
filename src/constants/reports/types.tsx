import { Feature } from "ol";
import { CommunityTheme } from "../communities/types";

export type StatusKey = "submit" | "pending" | "valid" | "reject" | "test";
export type GeometryType = `POINT(${string})`;
export type ParamsReport = {
    feature: Feature;
    closeFunc: () => void;
};

export interface ReportAttachment {
    id: number;
    name: string;
    size: number;
    type: string;
    url: string;
}

export interface CommunityReport {
    id: number;
    geometry: GeometryType;
    comment: string;
    themes: CommunityTheme[];
    status: StatusKey;
    attachments: ReportAttachment[];
}

export type PostThemeReport = { [key: string]: string };

export interface PostReport {
    community: number;
    geometry: GeometryType;
    comment: string;
    attributes: { community: number; theme: string; attributes: PostThemeReport };
}

export interface FileUpload {
    id: number;
    url: string;
    name: string;
    size: number;
    type: string;
}

export type attachmentData = {
    id: number;
    short_fileName: string;
    size: number;
    mime_type: string;
    uri: string;
};
export type reportData = {
    id: number;
    geometry: GeometryType;
    comment: string;
    attributes: CommunityTheme[];
    status: StatusKey;
    attachments: attachmentData[];
};

export type ErrorFile = {
    file: File;
    message: string;
};
