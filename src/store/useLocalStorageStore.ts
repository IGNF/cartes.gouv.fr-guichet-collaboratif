import {
    AddNamedPositionInput,
    AddNamedPositionResult,
    DEFAULT_NAMED_POSITION_ZOOM,
    LocalStorageData,
    NamedPosition,
    NAMED_POSITION_UPDATED_EVENT,
} from "@/constants/localStorage/types";
import { createDefaultLocalStorageData, createNamedPosition, normalizeLocalStorageData, sanitizeNamedPositionName } from "@/constants/localStorage/utils";
import { create } from "zustand";

interface LocalStorageStore {
    localStorageData: LocalStorageData | null;
    initLocalStorage: (communityName: string) => void;
    setLocalStorage: (communityName: string, data: LocalStorageData) => void;
    addNamedPosition: (communityName: string, input: AddNamedPositionInput) => AddNamedPositionResult;
    deleteNamedPosition: (communityName: string, id: string) => NamedPosition[];
}

const getPersistedLocalStorageData = (communityName: string) => {
    const rawData = window.localStorage.getItem(communityName);
    if (!rawData) {
        return null;
    }
    try {
        return normalizeLocalStorageData(JSON.parse(rawData));
    } catch {
        return null;
    }
};

const saveLocalStorageData = (communityName: string, data: LocalStorageData) => {
    window.localStorage.setItem(communityName, JSON.stringify(data));
};

const buildLocalStorageData = (data: LocalStorageData): LocalStorageData => ({
    ...createDefaultLocalStorageData(),
    ...data,
    namedPositions: data.namedPositions ?? [],
});

const hasValidCoordinates = (coordinates: [number, number]) => {
    const [longitude, latitude] = coordinates;
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
        return false;
    }

    return longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;
};

const validateNamedPositionInput = (data: LocalStorageData, input: AddNamedPositionInput): AddNamedPositionResult => {
    const name = sanitizeNamedPositionName(input.name);

    if (!name) {
        return { ok: false, reason: "EMPTY_NAME" };
    }

    if (!Array.isArray(input.coordinates) || input.coordinates.length !== 2 || !hasValidCoordinates(input.coordinates)) {
        return { ok: false, reason: "INVALID_COORDINATES" };
    }

    const hasDuplicateName = data.namedPositions.some((position) => sanitizeNamedPositionName(position.name).toLowerCase() === name.toLowerCase());
    if (hasDuplicateName) {
        return { ok: false, reason: "DUPLICATE_NAME" };
    }

    return {
        ok: true,
        value: createNamedPosition(name, input.coordinates, input.zoom ?? DEFAULT_NAMED_POSITION_ZOOM),
    };
};

export const useLocalStorageStore = create<LocalStorageStore>((set) => ({
    localStorageData: null,
    initLocalStorage: (communityName) => {
        const newLocalStorageData = getPersistedLocalStorageData(communityName);
        if (newLocalStorageData) {
            set({ localStorageData: newLocalStorageData });
        }
    },
    setLocalStorage: (communityName, data) => {
        const nextLocalStorageData = buildLocalStorageData(data);

        saveLocalStorageData(communityName, nextLocalStorageData);
        set({ localStorageData: nextLocalStorageData });
    },
    addNamedPosition: (communityName, input) => {
        const currentLocalStorageData = getPersistedLocalStorageData(communityName) ?? createDefaultLocalStorageData();
        const result = validateNamedPositionInput(currentLocalStorageData, input);
        if (!result.ok) {
            return result;
        }

        const namedPosition = result.value;
        const nextLocalStorageData = {
            ...currentLocalStorageData,
            namedPositions: [namedPosition, ...currentLocalStorageData.namedPositions],
        };

        saveLocalStorageData(communityName, nextLocalStorageData);
        set({ localStorageData: nextLocalStorageData });
        window.dispatchEvent(new Event(NAMED_POSITION_UPDATED_EVENT));

        return {
            ok: true,
            value: namedPosition,
        };
    },
    deleteNamedPosition: (communityName, id) => {
        const currentLocalStorageData = getPersistedLocalStorageData(communityName) ?? createDefaultLocalStorageData();
        const nextNamedPositions = id
            ? currentLocalStorageData.namedPositions.filter((position) => position.id !== id)
            : currentLocalStorageData.namedPositions;
        const nextLocalStorageData = {
            ...currentLocalStorageData,
            namedPositions: nextNamedPositions,
        };

        saveLocalStorageData(communityName, nextLocalStorageData);
        set({ localStorageData: nextLocalStorageData });
        window.dispatchEvent(new Event(NAMED_POSITION_UPDATED_EVENT));

        return nextNamedPositions;
    },
}));
