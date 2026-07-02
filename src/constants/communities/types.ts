import { FrIconClassName, RiIconClassName } from "@codegouvfr/react-dsfr";
import { Coordinate } from "ol/coordinate";
import { Extent } from "ol/extent";
import BaseLayer from "ol/layer/Base";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { ReactNode } from "react";

export type FeatureTypeIds = { database: number | null; table: number | null };
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
    snapto: string | null;
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
export type FeatureTypeConditionValue = string | number | string[] | number[] | null;
export type FeatureTypeCondition = { [key: string]: { [key: string]: FeatureTypeConditionValue } }[];
export type SearchObjectCondition = {
    $and?: FeatureTypeCondition;
    $or?: FeatureTypeCondition;
};
export type WebGLFilterType = (string | number | null | string[] | number[] | WebGLFilterType)[];

export type DirectionField = {
    attribute: string;
    sensDirect: string;
    sensInverse: string;
};

export type FeatureTypeStyleItem = {
    title: string;
    type?: string;
    featureType?: GeoserviceFeatureTypeProp;
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
    condition?: SearchObjectCondition;
    directionField?: DirectionField;
};

export type FeatureTypeStyleItemData = FeatureTypeStyleItem & {
    graphicName?: string;
    name?: string;
    condition: string;
    uri?: string;
    children?: FeatureTypeStyleItemData[];
    directionField?: string;
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
    enum?: (string | number | null)[];
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
    automatic: boolean;
    formula?: string;
    queryable: boolean;
};
export type FeatureTypeSelectedStyle = { layer: string; selectedStyle: FeatureTypeStyle };

export enum GeoserviceFeatureTypeProp {
    POINT = "point",
    LINE = "line",
    POLYGON = "polygon",
}

export interface CommunityGeoservice extends LayerGeoservice {
    idName?: string;
    type: string;
    version: number | string;
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
    featureType?: GeoserviceFeatureTypeProp;
    readOnly?: boolean;
    queryable?: boolean;
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
    snapto: string | null;
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

export interface CommunityGrids {
    name: string;
    title: string;
    type: {
        name: string;
        title: string;
    };
    extent: Extent;
}

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
    grids: CommunityGrids[];
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
    SEARCH = "search",
    MEASURE_DISTANCE = "measure_distance",
    MEASURE_DISTANCE_DEPRECIATED = "measureDistance",
    MEASURE_AREA = "measureArea",
    MEASURE_AZIMUTH = "measureAzimuth",
    GEOREM = "georem",
    MODIFY = "modify",
    TRANSLATE = "translate",
    DRAW = "draw",
    DELETE = "delete",
    SNAP_OBLIG = "snapOblig",
    SEARCH_LON_LAT = "search_lonlat",
    SEARCH_LON_LAT_DEPRECIATED = "searchLonlat",
    LOCATE_CONTROL = "locate_control",
    PRINT = "print",
    DISABLE_GEOREM_LAYER = "disableGeoremLayer",
    DISABLE_ZONES_LAYER = "disableZonesLayer",
    SPLIT = "split",
    ADRESSE = "search_address",
    ADRESSE_DEPRECIATED = "adresse",
    ROUTIER = "routier",
    LINEAIRE = "lineaire",
    ITINERAIRE = "itineraire",
    SHORTEST_PATH = "shortestpath",
    COPY_REF = "copyRef",
    TOOLTIP = "tooltip",
    OVERVIEW = "overview_map_control",
}

export enum CommunityLayerRoleType {
    VISU = "visu",
    EDIT = "edit",
}

export enum InteractionType {
    SELECT = "select",
    SEARCH = "search",
    MODIFY = "modify",
    REMOVE = "remove",
    CREATE_REPORT = "create_report",
    ADD_OBJECT = "add_object",
    COPY_OBJECT = "copy_object",
    TRANSLATE_OBJECT = "translate_object",
    SPLIT_LINE = "split_line",
    EXPORT_IMAGE = "export_image",
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

export enum OperatorType {
    in = "in",
    not_in = "not_in",
    is_empty = "is_empty",
    is_not_empty = "is_not_empty",
    equal = "equal",
    not_equal = "not_equal",
    begins_with = "begins_with",
    not_begins_with = "not_begins_with",
    contains = "contains",
    not_contains = "not_contains",
    ends_with = "ends_with",
    not_ends_with = "not_ends_with",
    is_null = "is_null",
    is_not_null = "is_not_null",
    less = "less",
    less_or_equal = "less_or_equal",
    greater = "greater",
    greater_or_equal = "greater_or_equal",
    between = "between",
    not_between = "not_between",
}

export const NO_VALUE_OPERATORS = new Set<OperatorType>([OperatorType.is_empty, OperatorType.is_not_empty, OperatorType.is_null, OperatorType.is_not_null]);

export const BETWEEN_OPERATORS = new Set<OperatorType>([OperatorType.between, OperatorType.not_between]);

export const MULTI_VALUE_OPERATORS = new Set<OperatorType>([OperatorType.in, OperatorType.not_in]);

export const OVERVIEW_MAP_WMTS_LAYER = "GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2";
export const OVERVIEW_MAP_WMTS_URL = "https://data.geopf.fr/wmts";
export const OVERVIEW_MAP_WMTS_VERSION = "1.0.0";

export interface FeatureInfo {
    content: string | null;
    title: string | null;
    position: Coordinate | undefined;
}
