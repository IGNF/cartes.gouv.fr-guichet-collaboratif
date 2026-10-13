import {
    AlertMessageType,
    Community,
    CommunityGeoservice,
    GridData,
    CommunityLayer,
    MapLayer,
    StatusMessage,
    CommunityLayerRoleType,
} from "@/constants/communities/types";
import { DEFAULT_ALERT_TIMEOUT, LAYER_FEATURE_TYPE } from "@/constants";
import { ReactNode } from "react";
import { create } from "zustand";

let idMessageCounter = 0;

interface CommunityStore {
    community: Community | null;
    communityLayers: CommunityLayer[] | null;
    mapLayers: MapLayer[];
    geoservices: CommunityGeoservice[];
    alertMessages: AlertMessageType[];
    isLoadingCommunity: boolean;
    hasOneEditableLayer: boolean;
    communityGridsStatus: "idle" | "loading" | "ready" | "error";
    setCommunity: (community: Community | null) => void;
    setCommunityGrids: (communityId: string, grids: GridData[]) => void;
    setCommunityGridsError: (communityId: string) => void;
    setCommunityLayers: (layers: CommunityLayer[] | null) => void;
    addAlertMessage: (status: StatusMessage, message: string | NonNullable<ReactNode>, duration?: number | null) => number;
    removeAlertMessage: (id: number) => void;
    setIsLoadingCommunity: (value: boolean) => void;
    addMapLayer: (layer: MapLayer) => void;
    setMapLayers: (layers: MapLayer[]) => void;
    addGeoservice: (geoservice: CommunityGeoservice) => void;
}

export const useCommunityStore = create<CommunityStore>((set, get) => ({
    community: null,
    communityLayers: null,
    alertMessages: [],
    mapLayers: [],
    geoservices: [],
    isLoadingCommunity: false,
    hasOneEditableLayer: false,
    communityGridsStatus: "idle",
    setCommunity: (community) => {
        set(() => {
            return { community, communityGridsStatus: community ? "loading" : "idle" };
        });
    },
    setCommunityGrids: (communityId, grids) => {
        set((state) => {
            if (!state.community || String(state.community.id) !== communityId) return state;
            return { community: { ...state.community, grids }, communityGridsStatus: "ready" };
        });
    },
    setCommunityGridsError: (communityId) => {
        set((state) => {
            if (!state.community || String(state.community.id) !== communityId) return state;
            return { communityGridsStatus: "error" };
        });
    },
    setCommunityLayers: (layers) => {
        set(() => {
            const hasOneEditableLayer = layers?.some((layer) => layer.type === LAYER_FEATURE_TYPE && layer.role === CommunityLayerRoleType.EDIT) ?? false;
            return { communityLayers: layers, hasOneEditableLayer };
        });
    },
    setIsLoadingCommunity: (value) => {
        set(() => {
            return { isLoadingCommunity: value };
        });
    },
    addAlertMessage: (status, message, duration = DEFAULT_ALERT_TIMEOUT) => {
        const messageExist = get().alertMessages.find((msg) => msg.text === message);
        if (messageExist) return messageExist.id;

        const id = idMessageCounter++;
        set(() => ({
            alertMessages: [...get().alertMessages, { id, status, text: message, duration }],
        }));
        return id;
    },

    removeAlertMessage: (id) => {
        const newMessages = get().alertMessages.filter((m) => m.id !== id);
        if (!newMessages.length) idMessageCounter = 0;
        set(() => {
            return { alertMessages: newMessages };
        });
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
    setMapLayers: (layers) => {
        set(() => {
            return { mapLayers: layers };
        });
    },
    addGeoservice: (geoservice) => {
        set((state) => {
            return {
                geoservices: [...state.geoservices, geoservice],
            };
        });
    },
}));
