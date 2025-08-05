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
    MultiLineString = "MultiLigne",
    MultiPolygon = "MultiPolygon",
    GeometryCollection = "GeometryCollection",
    Circle = "Circle",
}
export type ParamsReport = {
    feature: Feature;
    geomType: string;
    closeFunc: () => void;
};

type CommuneData = {
    name: string;
    title: string;
    type: { name: string; title: string };
    deleted?: boolean;
    extent?: number[];
};

type AuthorData = {
    id: number;
    username: string;
};
type DepartementData = {
    name: string;
};
export type GetReportData = {
    id: number;
    opening_date?: string;
    commune?: CommuneData;
    departement?: DepartementData;
    author?: AuthorData;
    attributes: CommunityTheme[];
    status: StatusKey;
};

export type GeometryFeatueParams =
    | (Geometry & { getCoordinates: () => Coordinate | Coordinate[] | Coordinate[][] | Coordinate[][][]; setCoordinates: (center: number[]) => void })
    | undefined;

export interface ReportAttachment {
    id: number;
    name: string;
    size: number;
    type: string;
    url: string;
}

export interface CommunityReport {
    id: number;
    geometry: string;
    comment: string;
    themes: CommunityTheme[];
    status: StatusKey;
    attachments: ReportAttachment[];
    sketch: SketchReport | null;
}

export type PostThemeReport = { [key: string]: string };

export interface PostReport {
    community: number;
    geometry: string;
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
    geometry: string;
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
    geometry: string;
    type: SketchFeatureType;
    style?: {
        backcolor?: string;
        diam: number;
        frontcolor: string;
    };
    attributes?: {
        nom?: string | string[];
        nature?: string;
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
    import = "drawing-tool-import",
}
export interface ReportTool {
    type: string;
    name: string;
    imgSrc: string;
    order: number;
    title: string;
    featureType?: string[];
}

export type ClickedTool = {
    name: string;
    clicked: boolean;
};
