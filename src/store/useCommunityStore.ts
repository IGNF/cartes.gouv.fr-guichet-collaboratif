import { AlertMessageType, Community, CommunityGeoservice, CommunityLayer, MapLayer, StatusMessage } from "@/constants/communities/types";
import { CommunityReport } from "@/constants/reports/types";
import { ReactNode } from "react";
import { create } from "zustand";

let idMessageCounter = 0;

interface CommunityStore {
    community: Community | null;
    communityLayers: CommunityLayer[] | null;
    mapLayers: MapLayer[];
    geoservices: CommunityGeoservice[];
    reports: CommunityReport[];
    alertMessages: AlertMessageType[];
    isLoadingCommunity: boolean;
    setCommunity: (community: Community | null) => void;
    setCommunityLayers: (layers: CommunityLayer[] | null) => void;
    addAlertMessage: (status: StatusMessage, message: string | NonNullable<ReactNode>, duration?: number | null) => void;
    removeAlertMessage: (id: number) => void;
    setIsLoadingCommunity: (value: boolean) => void;
    addMapLayer: (layer: MapLayer) => void;
    setMapLayers: (layers: MapLayer[]) => void;
    addGeoservice: (geoservice: CommunityGeoservice) => void;
    setCommunityReports: (reports: CommunityReport[], shouldReset?: boolean) => void;
}

export const useCommunityStore = create<CommunityStore>((set, get) => ({
    community: null,
    communityLayers: null,
    alertMessages: [],
    mapLayers: [],
    geoservices: [],
    reports: [],
    isLoadingCommunity: false,
    setCommunity: (community) => {
        set(() => {
            return { community };
        });
    },
    setCommunityLayers: (layers) => {
        set(() => {
            return { communityLayers: layers };
        });
    },
    setIsLoadingCommunity: (value) => {
        set(() => {
            return { isLoadingCommunity: value };
        });
    },
    addAlertMessage: (status, message, duration) => {
        set(() => {
            return { alertMessages: [...get().alertMessages, { id: idMessageCounter++, status, text: message, duration: duration ?? null }] };
        });
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
    setCommunityReports: (reports, shouldReset = false) => {
        if (shouldReset) {
            set(() => {
                return {
                    reports,
                };
            });
        } else {
            const oldReports = get().reports;
            const newReports = reports.filter((item) => !oldReports.find((r) => r.id === item.id));
            const allReports = [...oldReports, ...newReports];
            set(() => {
                return {
                    reports: allReports,
                };
            });
        }
    },
}));
