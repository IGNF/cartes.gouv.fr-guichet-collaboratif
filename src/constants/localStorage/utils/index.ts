import { Group } from "@/constants/savedSearches/types";
import { DEFAULT_NAMED_POSITION_ZOOM, LocalStorageData, NamedPosition } from "../types";

const DUPLICATE_COORDINATE_EPSILON = 1e-6;

const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;
const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;

const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

const normalizeName = (name: string) => name.trim().replace(/\s+/g, " ");

const isCoordinateRangeValid = (longitude: number, latitude: number) => {
    return longitude >= MIN_LONGITUDE && longitude <= MAX_LONGITUDE && latitude >= MIN_LATITUDE && latitude <= MAX_LATITUDE;
};

export const isValidNamedPositionCoordinates = (coordinates: unknown): coordinates is [number, number] => {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        return false;
    }

    const [longitude, latitude] = coordinates;
    if (!isFiniteNumber(longitude) || !isFiniteNumber(latitude)) {
        return false;
    }

    return isCoordinateRangeValid(longitude, latitude);
};

const getSafeZoom = (zoom: unknown) => {
    if (!isFiniteNumber(zoom)) {
        return DEFAULT_NAMED_POSITION_ZOOM;
    }

    return zoom;
};

const generateNamedPositionId = () => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `named-position-${Date.now()}-${Math.round(Math.random() * 1000000)}`;
};

const parseNamedPosition = (value: unknown): NamedPosition | null => {
    if (!value || typeof value !== "object") {
        return null;
    }

    const valueRecord = value as Record<string, unknown>;
    const rawName = typeof valueRecord.name === "string" ? valueRecord.name : "";
    const name = normalizeName(rawName);

    if (!name || !isValidNamedPositionCoordinates(valueRecord.coordinates)) {
        return null;
    }

    const id = typeof valueRecord.id === "string" && valueRecord.id.length > 0 ? valueRecord.id : generateNamedPositionId();
    const zoom = getSafeZoom(valueRecord.zoom);
    const createdAt = typeof valueRecord.createdAt === "string" ? valueRecord.createdAt : new Date().toISOString();

    return {
        id,
        name,
        coordinates: valueRecord.coordinates,
        zoom,
        createdAt,
    };
};

const sanitizeNamedPositions = (value: unknown): NamedPosition[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.map(parseNamedPosition).filter((position): position is NamedPosition => position !== null);
};

export const createDefaultLocalStorageData = (): LocalStorageData => ({
    activeLayer: "",
    center: [],
    layers: [],
    zoom: 0,
    projection: "",
    searchRoot: null as Group | null,
    searchMax: 20,
    searchExtent: "",
    namedPositions: [],
});

export const normalizeLocalStorageData = (value: unknown): LocalStorageData | null => {
    if (!value || typeof value !== "object") {
        return null;
    }

    const record = value as Record<string, unknown>;

    return {
        activeLayer: typeof record.activeLayer === "string" ? record.activeLayer : "",
        center: Array.isArray(record.center) ? record.center.filter((item): item is number => typeof item === "number" && Number.isFinite(item)) : [],
        layers: Array.isArray(record.layers) ? (record.layers as LocalStorageData["layers"]) : [],
        zoom: isFiniteNumber(record.zoom) ? record.zoom : 0,
        projection: typeof record.projection === "string" ? record.projection : "",
        searchRoot: record.searchRoot && typeof record.searchRoot === "object" ? (record.searchRoot as Group) : null,
        searchMax: isFiniteNumber(record.searchMax) ? record.searchMax : 20,
        searchExtent: typeof record.searchExtent === "string" ? record.searchExtent : "",
        namedPositions: sanitizeNamedPositions(record.namedPositions),
    };
};

export const sanitizeNamedPositionName = normalizeName;

export const areNamedPositionCoordinatesEqual = (first: [number, number], second: [number, number]) => {
    const lonDiff = Math.abs(first[0] - second[0]);
    const latDiff = Math.abs(first[1] - second[1]);

    return lonDiff <= DUPLICATE_COORDINATE_EPSILON && latDiff <= DUPLICATE_COORDINATE_EPSILON;
};

export const createNamedPosition = (name: string, coordinates: [number, number], zoom?: number): NamedPosition => ({
    id: generateNamedPositionId(),
    name: sanitizeNamedPositionName(name),
    coordinates,
    zoom: getSafeZoom(zoom),
    createdAt: new Date().toISOString(),
});
