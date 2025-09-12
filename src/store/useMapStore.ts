import { FeatureTypeSelectedStyle } from "@/constants/communities/types";
import { Feature, Map } from "ol";
import { create } from "zustand";

interface MapStore {
    map: Map | null;
    featureTypeSelectedStyle: FeatureTypeSelectedStyle[];
    clickedMapFeature: Feature | null;
    workingLayerDrawerOpened: boolean;
    mapWorkingLayer: string;
    setMap: (map: Map | null) => void;
    setFeatureTypeSelectedStyle: ({ layer, selectedStyle }: FeatureTypeSelectedStyle) => void;
    setClickedMapFeature: (feature: Feature | null) => void;
    setWorkingLayerDrawerOpened: (open: boolean) => void;
    setMapWorkingLayer: (layerName: string) => void;
}

export const useMapStore = create<MapStore>((set, get) => ({
    map: null,
    featureTypeSelectedStyle: [],
    clickedMapFeature: null,
    workingLayerDrawerOpened: false,
    mapWorkingLayer: "",
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
    setMapWorkingLayer: (layerName) => {
        set({ mapWorkingLayer: layerName });
    },
}));
