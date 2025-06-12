import { Feature } from "ol";
import { CommunityTheme } from "../communities/types";
import { Geometry } from "ol/geom";
import { Coordinate } from "ol/coordinate";

export type StatusKey = "submit" | "pending" | "valid" | "reject" | "test";
export type SketchType = "Point" | "Ligne" | "MultiPolygone";
export enum SketchFeatureType {
    Point = "Point",
    LineString = "Ligne",
    Polygon = "MultiPolygone",
    LinearRing = "LinearRing",
    MultiPoint = "MultiPoint",
    MultiLineString = "MultiLineString",
    MultiPolygon = "MultiPolygon",
    GeometryCollection = "GeometryCollection",
    Circle = "Circle",
}
export type GeometryType = `POINT(${string})` | `LINESTRING(${string})` | `MULTIPOLYGON(((${string})))`;
export type ParamsReport = {
    feature: Feature;
    closeFunc: () => void;
};

export type GeometryFeatueParams = (Geometry & { getCoordinates: () => Coordinate; setCoordinates: (center: number[]) => void }) | undefined;

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
    sketch: SketchReport | null;
}

export type PostThemeReport = { [key: string]: string };

export interface PostReport {
    community: number;
    geometry: GeometryType;
    comment: string;
    attributes: { community: number; theme: string; attributes: PostThemeReport };
    sketch?: SketchReport | null;
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
    sketch: string | null;
};

export type ErrorFile = {
    file: File;
    message: string;
};

export interface SketchReport {
    name: string;
    desc: string;
    contexte: {
        lat: number | string;
        lon: number | string;
        zoom: number;
    };
    objects: SketchObject[];
}

export interface SketchObject {
    geometry: GeometryType;
    type: SketchType;
    style?: {
        backcolor?: string;
        diam: number;
        frontcolor: string;
    };
    attributes?: {
        nom?: string | string[];
    };
}

export enum toolNames {
    point = "drawing-tool-point",
    line = "drawing-tool-line",
    polygon = "drawing-tool-polygon",
    text = "drawing-tool-text",
    edit = "drawing-tool-edit",
    display = "drawing-tool-display",
    tooltip = "drawing-tool-tooltip",
    remove = "drawing-tool-remove",
}
export interface ReportTool {
    type: string;
    name: string;
    imgSrc: string;
    order: number;
    title: string;
    featureType?: string;
}

export type ClickedTool = {
    name: string;
    clicked: boolean;
};
