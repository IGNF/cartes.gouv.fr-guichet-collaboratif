import { Feature, Map } from "ol";
import { create } from "zustand";

interface MapStore {
    map: Map | null;
    clickedFeature: Feature | null;
    setMap: (map: Map | null) => void;
    setClickedFeature: (feature: Feature | null) => void;
}

export const useMapStore = create<MapStore>((set) => ({
    map: null,
    clickedFeature: null,
    setMap: (map) => {
        set({ map });
    },
    setClickedFeature: (feature) => {
        set({ clickedFeature: feature });
    },
}));
