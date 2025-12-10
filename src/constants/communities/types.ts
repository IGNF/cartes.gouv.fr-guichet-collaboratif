import { FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
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
export type FeatureTypeConditionValue = string | number | string[] | number[];
export type FeatureTypeCondition = { [key: string]: { [key: string]: FeatureTypeConditionValue } }[];
export type WebGLFilterType = (string | number | (string | number | string[])[] | WebGLFilterType)[];

export type FeatureTypeStyleItem = {
    title: string;
    type?: string;
    featureType?: string;
    pointRadius: number;
    fillColor: string;
    fillOpacity: number;
    strokeColor: string;
    strokeWidth: number;
    strokeDashstyle: string | undefined;
    strokeLinecap: "butt" | "round" | "square" | undefined;
    strokeOpacity: number;
    zIndex?: number;
    logo?: string;
    label?: string;
    fontSize?: number;
    fontWeight?: string;
    fontColor?: string;
    fontFamily?: string;
    labelXOffset?: number;
    labelYOffset?: number;
    labelMinZoom?: number;
    condition?: {
        $and?: FeatureTypeCondition;
        $or?: FeatureTypeCondition;
    };
};

export type FeatureTypeStyleItemData = FeatureTypeStyleItem & {
    graphicName?: string;
    name?: string;
    condition: string;
    uri?: string;
    children?: FeatureTypeStyleItemData[];
};
export type FeatureTypeStyle = {
    name?: string;
    label?: string;
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
    default_value: boolean | string | number | null;
    required: boolean;
    read_only: boolean;
    min_length: number;
    max_length: number;
    min_value: number;
    max_value: number;
    pattern: string;
    is3d: boolean;
};
export type FeatureTypeSelectedStyle = { layer: string; selectedStyle: FeatureTypeStyle };
export interface CommunityGeoservice extends LayerGeoservice {
    idName?: string;
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
    table?: number;
    database?: number;
}

export type MapLayerSource = BaseLayer | TileLayer | VectorLayer;

export interface MapLayer {
    source: MapLayerSource;
    title: string;
    order: number;
    name: string;
}

export interface CommunityLayer {
    id: number;
    type: string;
    geoservice: CommunityGeoservice;
    order: number;
    opacity: number;
    visibility: boolean;
    role: string;
    database: number;
    table: number;
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
    minZoom: number;
    maxZoom: number;
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

export interface GeoJSONProps {
    type: string;
    features: { [key: string]: string | number | boolean | object | undefined }[];
}

export interface ArrayGeoJSONProps {
    geometrie?: string;
    [key: string]: string | number | undefined;
}

export enum CommunityLayerFunctionalityType {
    VISU = "search",
    MEASURE_DISTANCE = "measureDistance",
    MEASURE_AREA = "measureArea",
    GEOREM = "georem",
    MODIFY = "modify",
    TRANSLATE = "translate",
    DRAW = "draw",
    DELETE = "delete",
    SNAP_OBLIG = "snapOblig",
}

export enum CommunityLayerRoleType {
    VISU = "visu",
    EDIT = "edit",
}

export enum InteractionType {
    SELECT = "select",
    MODIFY = "modify",
    REMOVE = "remove",
    CREATE_REPORT = "create_report",
    ADD_OBJECT = "add_object",
}

export type CustomControlItem = {
    id: number;
    title: string;
    target: string;
    icon: FrIconClassName | RiIconClassName;
    disabled: boolean;
    interaction: InteractionType | null;
    enabled: boolean;
};

export type LonLatNumber = number | number[] | number[][] | number[][][];
export type ObjectProps = { [key: string]: string | number | boolean | object | null | undefined };
