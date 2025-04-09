import { create } from "zustand";

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
    isLoadingCommunity: boolean;
    setCommunity: (community: Community | null) => void;
    setIsLoadingCommunity: (value: boolean) => void;
}

export const useCommunityStore = create<CommunityStore>((set) => ({
    community: null,
    isLoadingCommunity: false,
    setCommunity: (community) => {
        set({ community });
    },
    setIsLoadingCommunity: (value) => {
        set({ isLoadingCommunity: value });
    },
}));
