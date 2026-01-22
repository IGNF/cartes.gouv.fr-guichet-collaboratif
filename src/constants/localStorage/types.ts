import { Group } from "../contributions/types";

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
}
