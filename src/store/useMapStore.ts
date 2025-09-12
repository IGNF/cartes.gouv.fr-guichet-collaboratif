import { FeatureTypeSelectedStyle } from "@/constants/communities/types";
import { Feature, Map } from "ol";
import { create } from "zustand";

interface MapStore {
    map: Map | null;
    featureTypeSelectedStyle: FeatureTypeSelectedStyle[];
    clickedMapFeature: Feature | null;
    workingLayerDrawerOpened: boolean;
    setMap: (map: Map | null) => void;
    setFeatureTypeSelectedStyle: ({ layer, selectedStyle }: FeatureTypeSelectedStyle) => void;
    setClickedMapFeature: (feature: Feature | null) => void;
    setWorkingLayerDrawerOpened: (open: boolean) => void;
}

export const useMapStore = create<MapStore>((set, get) => ({
    map: null,
    featureTypeSelectedStyle: [],
    clickedMapFeature: null,
    workingLayerDrawerOpened: false,
    setMap: (map) => {
        set({ map });
    },
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
    setClickedMapFeature: (feature) => {
        set({
            clickedMapFeature: feature,
        });
    },
    setWorkingLayerDrawerOpened: (open) => {
        set({ workingLayerDrawerOpened: open });
    },
}));
