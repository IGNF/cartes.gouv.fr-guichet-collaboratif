import { CustomControlItem, FeatureTypeSelectedStyle } from "@/constants/communities/types";
import { ClickedTool } from "@/constants/reports/types";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import { Feature, Map } from "ol";
import { create } from "zustand";

interface MapStore {
    map: Map | null;
    mapSwitcher: LayerSwitcher | null;
    featureTypeSelectedStyle: FeatureTypeSelectedStyle[];
    clickedMapFeature: Feature | null;
    workingLayerDrawerOpened: boolean;
    mapWorkingLayer: string;
    clickableFeatures: Feature[];
    clickedControl: CustomControlItem | null;
    showMapWorkingLayerSelect: boolean;
    showCenterReportButtons: boolean;
    setMap: (map: Map | null, mapSwitcher: LayerSwitcher | null) => void;
    setFeatureTypeSelectedStyle: ({ layer, selectedStyle }: FeatureTypeSelectedStyle) => void;
    setClickedMapFeature: (feature: Feature | null) => void;
    setWorkingLayerDrawerOpened: (open: boolean) => void;
    setMapWorkingLayer: (layerName: string) => void;
    setClickableFeatures: (features: Feature[]) => void;
    setClickedControl: (control: CustomControlItem | null) => void;
    setShowMapWorkingLayerSelect: (show: boolean) => void;
    setShowCenterReportButtons: (show: boolean) => void;
    clickedTool: ClickedTool;
    setClickedTool: (tool: ClickedTool) => void;
}

export const useMapStore = create<MapStore>((set, get) => ({
    map: null,
    mapSwitcher: null,
    featureTypeSelectedStyle: [],
    clickedMapFeature: null,
    workingLayerDrawerOpened: false,
    mapWorkingLayer: "",
    clickableFeatures: [],
    clickedControl: null,
    showMapWorkingLayerSelect: true,
    showCenterReportButtons: false,
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
    setShowCenterReportButtons: (show) => set({ showCenterReportButtons: show }),
    clickedTool: { name: "", clicked: false },
    setClickedTool: (tool) =>
        set((state) => ({
            clickedTool: {
                name: tool.name,
                clicked: state.clickedTool?.name === tool.name ? !state.clickedTool.clicked : true,
            },
        })),
}));
