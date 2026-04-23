import { CustomControlItem, FeatureInfo, FeatureTypeSelectedStyle } from "@/constants/communities/types";
import { NamedPositionCandidate } from "@/constants/localStorage/types";
import { ClickedTool } from "@/constants/reports/types";
import LayerSwitcher from "geopf-extensions-openlayers/src/packages/Controls/LayerSwitcher/LayerSwitcher";
import { Feature, Map } from "ol";
import { Coordinate } from "ol/coordinate";
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
    namedPositionCandidate: NamedPositionCandidate | null;
    featureInfo: FeatureInfo;
    setMap: (map: Map | null, mapSwitcher: LayerSwitcher | null) => void;
    setFeatureTypeSelectedStyle: ({ layer, selectedStyle }: FeatureTypeSelectedStyle) => void;
    setClickedMapFeature: (feature: Feature | null) => void;
    setWorkingLayerDrawerOpened: (open: boolean) => void;
    setMapWorkingLayer: (layerName: string) => void;
    setClickableFeatures: (features: Feature[]) => void;
    setClickedControl: (control: CustomControlItem | null) => void;
    setShowMapWorkingLayerSelect: (show: boolean) => void;
    setShowCenterReportButtons: (show: boolean) => void;
    setNamedPositionCandidate: (candidate: NamedPositionCandidate | null) => void;
    setFeatureInfo: (content: string | null, title: string | null, position?: Coordinate) => void;
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
    namedPositionCandidate: null,
    featureInfo: {
        content: null,
        title: null,
        position: undefined,
    },
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
    setNamedPositionCandidate: (candidate) => set({ namedPositionCandidate: candidate }),
    setFeatureInfo: (content, title, position) =>
        set((state) => ({
            featureInfo: {
                content,
                title,
                position: position !== undefined ? position : state.featureInfo.position,
            },
        })),
    clickedTool: { name: "", clicked: false },
    setClickedTool: (tool) =>
        set((state) => ({
            clickedTool: {
                name: tool.name,
                clicked: state.clickedTool?.name === tool.name ? !state.clickedTool.clicked : true,
            },
        })),
}));
