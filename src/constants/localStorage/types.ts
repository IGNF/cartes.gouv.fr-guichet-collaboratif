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
    minZoom: number;
    maxZoom: number;
    projection: string;
}
