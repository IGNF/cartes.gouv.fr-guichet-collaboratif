import { FeatureTypeSelectedStyle } from "@/constants/communities/types";
import { Map } from "ol";
import { create } from "zustand";

interface MapStore {
    map: Map | null;
    setMap: (map: Map | null) => void;
    featureTypeSelectedStyle: FeatureTypeSelectedStyle[];
    setFeatureTypeSelectedStyle: ({ layer, selectedStyle }: FeatureTypeSelectedStyle) => void;
}

export const useMapStore = create<MapStore>((set, get) => ({
    map: null,
    setMap: (map) => {
        set({ map });
    },
    featureTypeSelectedStyle: [],
    setFeatureTypeSelectedStyle: (newStyle) => {
        const currentFeatureTypeStyles = get().featureTypeSelectedStyle;
        const styleExist = currentFeatureTypeStyles.find((style) => style.layer === newStyle.layer);
        if (styleExist) {
            styleExist.selectedStyle = newStyle.selectedStyle;
            set({ featureTypeSelectedStyle: currentFeatureTypeStyles });
        } else {
            set({ featureTypeSelectedStyle: [...currentFeatureTypeStyles, newStyle] });
        }
    },
}));
