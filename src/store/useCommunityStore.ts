import { AlertMessageType, Community, CommunityGeoservice, CommunityLayer, MapLayer, StatusMessage } from "@/constants/communities/types";
import { create } from "zustand";

let idMessageCounter = 0;

interface CommunityStore {
    community: Community | null;
    communityLayers: CommunityLayer[] | null;
    mapLayers: MapLayer[];
    geoservices: CommunityGeoservice[];
    alertMessages: AlertMessageType[];
    isLoadingCommunity: boolean;
    setCommunity: (community: Community | null) => void;
    setCommunityLayers: (layers: CommunityLayer[] | null) => void;
    addAlertMessage: (status: StatusMessage, message: string) => void;
    removeAlertMessage: (id: number) => void;
    setIsLoadingCommunity: (value: boolean) => void;
    addMapLayer: (layer: MapLayer) => void;
    addGeoservice: (geoservice: CommunityGeoservice) => void;
}

export const useCommunityStore = create<CommunityStore>((set, get) => ({
    community: null,
    communityLayers: null,
    alertMessages: [],
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
    addAlertMessage: (status, message) => {
        set({ alertMessages: [...get().alertMessages, { id: idMessageCounter++, status, text: message }] });
    },
    removeAlertMessage: (id) => {
        const newMessages = get().alertMessages.filter((m) => m.id !== id);
        if (!newMessages.length) idMessageCounter = 0;
        set({ alertMessages: newMessages });
    },
    addMapLayer: (layer) => {
        const layerExist = get().mapLayers.find((lr) => lr.title === layer.title);
        if (layerExist) {
            if (layerExist.source !== layer.source) {
                set((state) => {
                    const newMapLayers = state.mapLayers.map((mapLayer) => (mapLayer.title === layerExist.title ? layer : mapLayer));

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
