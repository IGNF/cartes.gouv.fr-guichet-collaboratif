import { Group } from "@/constants/savedSearches/types";

export const NAMED_POSITION_UPDATED_EVENT = "named-position:updated";
export const DEFAULT_NAMED_POSITION_ZOOM = 15;

export interface NamedPosition {
    id: string;
    name: string;
    coordinates: [number, number];
    zoom: number;
    createdAt: string;
}

export interface NamedPositionCandidate {
    name: string;
    coordinates: [number, number];
    zoom: number;
}

export interface AddNamedPositionInput {
    name: string;
    coordinates: [number, number];
    zoom?: number;
}

export type AddNamedPositionErrorReason = "EMPTY_NAME" | "INVALID_COORDINATES" | "DUPLICATE_NAME" | "DUPLICATE_COORDINATES";

export type AddNamedPositionResult =
    | {
          ok: true;
          value: NamedPosition;
      }
    | {
          ok: false;
          reason: AddNamedPositionErrorReason;
      };

export type LocalLayer = {
    name: string;
    opacity: number;
    type: string;
    visibility: boolean;
    order: number;
};

export interface LocalStorageData {
    activeLayer: string;
    center: number[];
    layers: LocalLayer[];
    zoom: number;
    projection: string;
    searchRoot: Group | null;
    searchMax: number;
    searchExtent: string;
    namedPositions: NamedPosition[];
}
