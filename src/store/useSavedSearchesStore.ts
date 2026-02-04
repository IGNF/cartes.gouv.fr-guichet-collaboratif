import { SavedSearch, SavedSearchesStore } from "@/constants/savedSearches/types";
import { create } from "zustand";
import { SAVED_SEARCHES_PREFIX } from "@/constants/index";

export const useSavedSearchesStore = create<SavedSearchesStore>((set, get) => ({
    localSavedSearches: [],
    userSavedSearches: [],

    loadLocalSavedSearches: (communityName: string, workingLayer: string) => {
        const storageKey = `${SAVED_SEARCHES_PREFIX}${communityName}_${workingLayer}`;
        const savedData = window.localStorage.getItem(storageKey);

        if (savedData) {
            try {
                const searches: SavedSearch[] = JSON.parse(savedData);
                const parsedSearches = searches.map((search) => ({
                    ...search,
                    createdAt: new Date(search.createdAt),
                    updatedAt: new Date(search.updatedAt),
                }));
                set({ localSavedSearches: parsedSearches });
            } catch {
                set({ localSavedSearches: [] });
            }
        } else {
            set({ localSavedSearches: [] });
        }
    },

    saveSearchLocally: (communityName: string, workingLayer: string, name: string, search) => {
        const storageKey = `${SAVED_SEARCHES_PREFIX}${communityName}_${workingLayer}`;
        const currentSearches = get().localSavedSearches;

        const newSearch: SavedSearch = {
            id: `search_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
            name,
            workingLayer,
            searchRoot: search.searchRoot,
            searchMax: search.searchMax,
            searchExtent: search.searchExtent,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const updatedSearches = [...currentSearches, newSearch];
        window.localStorage.setItem(storageKey, JSON.stringify(updatedSearches));
        set({ localSavedSearches: updatedSearches });
    },

    updateLocalSearch: (communityName: string, workingLayer: string, searchId: string, name: string, search) => {
        const storageKey = `${SAVED_SEARCHES_PREFIX}${communityName}_${workingLayer}`;
        const currentSearches = get().localSavedSearches;

        const updatedSearches = currentSearches.map((s) => {
            if (s.id === searchId) {
                return {
                    ...s,
                    name,
                    workingLayer,
                    searchRoot: search.searchRoot,
                    searchMax: search.searchMax,
                    searchExtent: search.searchExtent,
                    updatedAt: new Date(),
                };
            }
            return s;
        });

        window.localStorage.setItem(storageKey, JSON.stringify(updatedSearches));
        set({ localSavedSearches: updatedSearches });
    },

    deleteLocalSearch: (communityName: string, workingLayer: string, searchId: string) => {
        const storageKey = `${SAVED_SEARCHES_PREFIX}${communityName}_${workingLayer}`;
        const currentSearches = get().localSavedSearches;

        const updatedSearches = currentSearches.filter((s) => s.id !== searchId);
        window.localStorage.setItem(storageKey, JSON.stringify(updatedSearches));
        set({ localSavedSearches: updatedSearches });
    },
}));
