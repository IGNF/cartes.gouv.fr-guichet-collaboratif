import { CustomControlItem, FeatureTypeSelectedStyle } from "@/constants/communities/types";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import { Feature, Map } from "ol";
import { create } from "zustand";

interface MapStore {
    map: Map | null;
    mapSwitcher: LayerSwitcher | null;
    featureTypeSelectedStyle: FeatureTypeSelectedStyle[];
    featureTypeMode: "view" | "edit";
    clickedMapFeature: Feature | null;
    workingLayerDrawerOpened: boolean;
    mapWorkingLayer: string;
    clickableFeatures: Feature[];
    clickedControl: CustomControlItem | null;
    showMapWorkingLayerSelect: boolean;
    setMap: (map: Map | null, mapSwitcher: LayerSwitcher | null) => void;
    setFeatureTypeSelectedStyle: ({ layer, selectedStyle }: FeatureTypeSelectedStyle) => void;
    setClickedMapFeature: (feature: Feature | null) => void;
    setWorkingLayerDrawerOpened: (open: boolean) => void;
    setMapWorkingLayer: (layerName: string) => void;
    setClickableFeatures: (features: Feature[]) => void;
    setClickedControl: (control: CustomControlItem | null) => void;
    setShowMapWorkingLayerSelect: (show: boolean) => void;
    setFeatureTypeMode: (mode: "view" | "edit") => void;
}

export const useMapStore = create<MapStore>((set, get) => ({
    map: null,
    mapSwitcher: null,
    featureTypeSelectedStyle: [],
    featureTypeMode: "view",
    clickedMapFeature: null,
    workingLayerDrawerOpened: false,
    mapWorkingLayer: "",
    clickableFeatures: [],
    clickedControl: null,
    showMapWorkingLayerSelect: true,
    setMap: (map, mapSwitcher) => {
        set({ map, mapSwitcher });
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
    setClickableFeatures: (features) => set({ clickableFeatures: features }),
    setClickedControl: (control) => set({ clickedControl: control }),
    setShowMapWorkingLayerSelect: (show) => set({ showMapWorkingLayerSelect: show }),
    setFeatureTypeMode: (mode) => set({ featureTypeMode: mode }),
}));
