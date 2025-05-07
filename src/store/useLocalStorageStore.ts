import { LocalStorageData } from "@/constants/localStorage/types";
import { create } from "zustand";

interface LocalStorageStore {
    localStorageData: LocalStorageData | null;
    initLocalStorage: (communityName: string) => void;
    setLocalStorage: (communityName: string, data: LocalStorageData) => void;
}

export const useLocalStorageStore = create<LocalStorageStore>((set) => ({
    localStorageData: null,
    initLocalStorage: (communityName) => {
        const newLocalStorageData = window.localStorage.getItem(communityName);
        if (newLocalStorageData) {
            set({ localStorageData: JSON.parse(newLocalStorageData) });
        }
    },
    setLocalStorage: (communityName, data) => {
        window.localStorage.setItem(communityName, JSON.stringify(data));
        set({ localStorageData: data });
    },
}));
