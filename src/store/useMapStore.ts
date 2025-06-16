import { Map } from "ol";
import { create } from "zustand";

interface MapStore {
    map: Map | null;
    setMap: (map: Map | null) => void;
    selectedLayer: string | null;
    setSelectedLayer: (layer: string) => void;
}

export const useMapStore = create<MapStore>((set) => ({
    map: null,
    setMap: (map) => set({ map }),
    selectedLayer: null,
    setSelectedLayer: (layer) => set({ selectedLayer: layer }),
}));
