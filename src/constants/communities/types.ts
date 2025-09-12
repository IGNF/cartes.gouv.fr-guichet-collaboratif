import BaseLayer from "ol/layer/Base";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { ReactNode } from "react";

export type FeatureTypeIds = { database: number; table: number };
export type layerData = {
    id: number;
    type: string;
    geoservice: {
        id: number;
    };
    order: number;
    opacity: number;
    visibility: boolean;
    role: string;
    database: number;
    table: number;
};

export interface LayerGeoservice {
    id: number;
    description: string | null;
    title: string;
}

export interface RegularShapeStyleProps {
    shapeProps: FeatureTypeStyleItem;
    points: number;
    radius?: number;
    radius2?: number | undefined;
    angle: number | undefined;
}

export type FeatureTypeStyleItem = {
    title: string;
    type?: string;
    featureType?: string;
    pointRadius: number;
    fillColor: string;
    fillOpacity: number;
    strokeColor: string;
    strokeWidth: number;
    strokeDashstyle: string;
    strokeLinecap: "butt" | "round" | "square";
    strokeOpacity: number;
    logo?: string;
    condition?: { $and: { [key: string]: { [key: string]: number | string } }[] };
};

export type FeatureTypeStyleItemData = FeatureTypeStyleItem & {
    graphicName?: string;
    name?: string;
    condition: string;
    uri?: string;
};
export type FeatureTypeStyle = {
    name?: string;
    types?: FeatureTypeStyleItem[];
};

export type FeatureTypeColumn = {
    name: string;
    title: string;
    description: string;
    type: string;
    nullable: boolean;
    enum?: string[];
    crs: string;
    default_value: string | number | null;
};
export type FeatureTypeSelectedStyle = { layer: string; selectedStyle: FeatureTypeStyle };
export interface CommunityGeoservice extends LayerGeoservice {
    type: string;
    version: number;
    url: string;
    layer: string;
    format: string;
    extent: string;
    minZoom: number;
    maxZoom: number;
    tileZoom: number;
    boxSrid: string;
    logo?: string;
    geometryName?: string;
    featureType?: string;
    readOnly?: boolean;
    styles?: FeatureTypeStyle[];
    columns: FeatureTypeColumn[];
}

export type MapLayerSource = BaseLayer | TileLayer | VectorLayer;

export interface MapLayer {
    source: MapLayerSource;
    title: string;
    order: number;
}

export interface CommunityLayer {
    id: number;
    type: string;
    geoservice: CommunityGeoservice;
    order: number;
    opacity: number;
    visibility: boolean;
    role: string;
}

export interface ThemeItem {
    mandatory: boolean;
    default: string;
    help: string;
    name: string;
    type: string;
    values?: string[];
}

export type CommunityTheme = {
    theme: string;
    help?: string;
    attributes: ThemeItem[];
};

export type PointString = `POINT(${string})`;

export interface Community {
    id: number;
    listed: boolean;
    description: string;
    name: string;
    about: string;
    functionalities: string[];
    logoUrl: string;
    themes: CommunityTheme[];
    position: PointString;
    zoom: number;
}

export const enum StatusMessage {
    success = "success",
    error = "error",
    info = "info",
    warning = "warning",
}

export type AlertMessageType = {
    id: number;
    status: StatusMessage;
    text: string | NonNullable<ReactNode>;
    duration?: number | null;
};
