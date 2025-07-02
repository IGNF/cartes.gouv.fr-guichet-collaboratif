import BaseLayer from "ol/layer/Base";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { ReactNode } from "react";

export interface LayerGeoservice {
    id: number;
    description: string | null;
    title: string;
}

export interface CommunityGeoservice extends LayerGeoservice {
    type: string;
    version: number;
    url: string;
    layer: string;
    format: string;
    extent: string;
    minZoom: number;
    maxZoom: number;
    boxSrid: string;
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
