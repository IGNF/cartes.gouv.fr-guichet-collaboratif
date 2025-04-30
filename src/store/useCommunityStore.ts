import BaseLayer from "ol/layer/Base";
import TileLayer from "ol/layer/Tile";
import { create } from "zustand";

export interface LayerGeoservice {
    id: number;
    description: string | null;
    title: string;
}

export interface CommunityGeoservice extends LayerGeoservice {
    type: string;
    version: number;
    url: string;
    layer: string;
    format: string;
    extent: string;
    minZoom: number;
    maxZoom: number;
    boxSrid: string;
}

export interface SourceLayer {
    source: BaseLayer | TileLayer;
    title: string;
    order: number;
}

export interface CommunityLayer {
    id: number;
    type: string;
    geoservice: CommunityGeoservice;
    order: number;
    opacity: number;
    visibility: boolean;
    role: string;
}

export interface Community {
    id: number | null;
    listed: boolean | null;
    description: string | null;
    name: string | null;
    about: string | null;
    functionalities: string[] | null;
    logoUrl: string | null;
}

interface CommunityStore {
    community: Community | null;
    communityLayers: CommunityLayer[] | null;
    mapLayers: SourceLayer[];
    geoservices: CommunityGeoservice[];
    errorCommunity: string;
    isLoadingCommunity: boolean;
    setCommunity: (community: Community | null) => void;
    setCommunityLayers: (layers: CommunityLayer[] | null) => void;
    setErrorCommunity: (message: string) => void;
    setIsLoadingCommunity: (value: boolean) => void;
    addMapLayers: (layer: SourceLayer) => void;
    addGeoservice: (geoservice: CommunityGeoservice) => void;
}

export const useCommunityStore = create<CommunityStore>((set, get) => ({
    community: null,
    communityLayers: null,
    errorCommunity: "",
    mapLayers: [],
    geoservices: [],
    isLoadingCommunity: false,
    setCommunity: (community) => {
        set({ community });
    },
    setCommunityLayers: (layers) => {
        set({ communityLayers: layers });
    },
    setIsLoadingCommunity: (value) => {
        set({ isLoadingCommunity: value });
    },
    setErrorCommunity: (message) => {
        set({ errorCommunity: message });
    },
    addMapLayers: (layer) => {
        const lrExist = get().mapLayers.find((lr) => lr.order === layer.order);
        if (lrExist) {
            if (lrExist.source !== layer.source) {
                set((state) => {
                    const newMapLayers = state.mapLayers.map((ml) => (ml.order === lrExist.order ? layer : ml));

                    return { mapLayers: newMapLayers.sort((l1, l2) => l1.order - l2.order) };
                });
            }
        } else {
            set((state) => {
                return { mapLayers: [...state.mapLayers, layer].sort((l1, l2) => l1.order - l2.order) };
            });
        }
    },
    addGeoservice: (geoservice) => {
        set((state) => {
            return {
                geoservices: [...state.geoservices, geoservice],
            };
        });
    },
}));
