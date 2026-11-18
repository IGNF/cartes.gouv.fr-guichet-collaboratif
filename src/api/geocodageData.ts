import axios from "axios";
import { GEOPF_ALTIMETRY_URL, GEOPF_GEOCODING_COMPLETION_URL, GEOPF_GEOCODING_REVERSE_URL, GEOPF_WFS_URL } from "@/constants/urls";

// Public geopf endpoints: use a plain client so the user's Bearer token is never sent to them.
const ALTITUDE_NO_DATA = -99999;
const publicApi = axios.create();

export interface CommuneResult {
    fulltext: string;
    street: string;
    zipcode: string;
    city: string;
    x: number;
    y: number;
    classification: number;
    kind: string;
}

interface AutocompleteResponse {
    results: CommuneResult[];
}

export interface LocationAutocompleteResult {
    fulltext: string;
    x: number;
    y: number;
}

export interface ReverseGeocodeResponse {
    features: Array<{
        properties: {
            name?: string;
            housenumber?: string;
            street?: string;
            postcode?: string;
            city?: string;
            citycode?: string;
            context?: string;
            label?: string;
        };
        geometry: {
            coordinates: number[];
        };
    }>;
}

export interface CadastreResponse {
    features: Array<{
        properties: {
            numero?: string;
            feuille?: number | string;
            section?: string;
            id?: string;
        };
    }>;
}

export interface AltitudeResponse {
    elevations: Array<number | { z: number }>;
}

export async function getLocationAutocomplete(searchText: string): Promise<LocationAutocompleteResult[]> {
    if (!searchText.trim()) {
        return [];
    }

    try {
        const response = await publicApi.get<AutocompleteResponse>(GEOPF_GEOCODING_COMPLETION_URL, {
            params: {
                text: searchText,
                maximumResponses: 5,
            },
        });

        return (response.data.results || []).filter((result) => typeof result.fulltext === "string" && Number.isFinite(result.x) && Number.isFinite(result.y));
    } catch {
        return [];
    }
}

export async function reverseGeocode(lon: number, lat: number): Promise<ReverseGeocodeResponse["features"][0] | null> {
    try {
        const response = await publicApi.get<ReverseGeocodeResponse>(GEOPF_GEOCODING_REVERSE_URL, {
            params: {
                lon,
                lat,
                limit: 1,
            },
        });
        return response.data.features?.[0] || null;
    } catch {
        return null;
    }
}

const getDepartmentCode = (props: ReverseGeocodeResponse["features"][0]["properties"]): string | null => {
    const fromContext = props.context?.split(",")[0]?.trim();
    if (fromContext) return fromContext;
    const insee = props.citycode;
    if (!insee) return null;
    return insee.startsWith("97") ? insee.substring(0, 3) : insee.substring(0, 2);
};

export async function getReverseGeocodeInfo(lon: number, lat: number) {
    const result = await reverseGeocode(lon, lat);
    if (!result) return null;

    const props = result.properties;
    return {
        municipality: {
            name: props.city || null,
            insee: props.citycode || null,
            postcode: props.postcode || null,
            department: getDepartmentCode(props),
        },
        address: {
            fullAddress: props.label || null,
            housenumber: props.housenumber || null,
            street: props.street || null,
            address: props.housenumber && props.street ? `${props.housenumber} ${props.street}` : props.street || null,
        },
    };
}

export async function getCadastreFromCoords(lon: number, lat: number): Promise<CadastreResponse["features"][0] | null> {
    try {
        const response = await publicApi.get<CadastreResponse>(GEOPF_WFS_URL, {
            params: {
                service: "WFS",
                version: "2.0.0",
                request: "GetFeature",
                typename: "CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle",
                outputFormat: "application/json",
                srsname: "EPSG:4326",
                // WFS 2.0.0 with EPSG:4326 uses lat/lon axis order
                cql_filter: `INTERSECTS(geom, POINT(${lat} ${lon}))`,
                count: 1,
            },
        });
        return response.data.features?.[0] || null;
    } catch {
        return null;
    }
}

export async function getAltitudeFromCoords(lon: number, lat: number): Promise<number | null> {
    try {
        const response = await publicApi.get<AltitudeResponse>(GEOPF_ALTIMETRY_URL, {
            params: {
                lon,
                lat,
                resource: "ign_rge_alti_wld",
                zonly: true,
            },
        });
        const first = response.data.elevations?.[0];
        const z = typeof first === "number" ? first : first?.z;
        return typeof z === "number" && Number.isFinite(z) && z !== ALTITUDE_NO_DATA ? z : null;
    } catch {
        return null;
    }
}
