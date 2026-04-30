import { getAxiosApi } from ".";
import { Feature } from "ol";
import { Geometry, Point, LineString, Polygon } from "ol/geom";
import { transform } from "ol/proj";

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

export interface AutocompleteResponse {
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
            feuille?: string;
            section?: string;
            id?: string;
        };
    }>;
}

export interface AltitudeResponse {
    elevations: Array<{
        lon: number;
        lat: number;
        z: number;
        acc: number;
    }>;
}

export async function getCommuneAutocomplete(searchText: string): Promise<CommuneResult[]> {
    try {
        const api = await getAxiosApi();
        const response = await api.get<AutocompleteResponse>("https://data.geopf.fr/geocodage/completion", {
            params: {
                text: searchText,
                type: "PositionOfInterest",
                poiType: "administratif",
                maximumResponses: 5,
            },
        });
        return response.data.results || [];
    } catch (error) {
        console.error("Commune autocomplete failed:", error);
        return [];
    }
}

export async function getLocationAutocomplete(searchText: string): Promise<LocationAutocompleteResult[]> {
    if (!searchText.trim()) {
        return [];
    }

    try {
        const api = await getAxiosApi();
        const response = await api.get<AutocompleteResponse>("https://data.geopf.fr/geocodage/completion", {
            params: {
                text: searchText,
                maximumResponses: 5,
            },
        });

        return (response.data.results || []).filter((result) => typeof result.fulltext === "string" && Number.isFinite(result.x) && Number.isFinite(result.y));
    } catch (error) {
        console.error("Location autocomplete failed:", error);
        return [];
    }
}

export async function reverseGeocode(lon: number, lat: number): Promise<ReverseGeocodeResponse["features"][0] | null> {
    try {
        const api = await getAxiosApi();
        const response = await api.get<ReverseGeocodeResponse>("https://data.geopf.fr/geocodage/reverse", {
            params: {
                lon,
                lat,
                limit: 1,
            },
        });
        return response.data.features?.[0] || null;
    } catch (error) {
        console.error("Reverse geocode failed:", error);
        return null;
    }
}

export async function getMunicipalityFromCoords(lon: number, lat: number) {
    const result = await reverseGeocode(lon, lat);
    if (!result) return null;

    const props = result.properties;
    return {
        name: props.city || null,
        insee: props.citycode || null,
        postcode: props.postcode || null,
        department: props.citycode ? props.citycode.substring(0, 2) : null,
    };
}

export async function getAddressFromCoords(lon: number, lat: number) {
    const result = await reverseGeocode(lon, lat);
    if (!result) return null;

    const props = result.properties;
    return {
        fullAddress: props.label || null,
        housenumber: props.housenumber || null,
        street: props.street || null,
        address: props.housenumber && props.street ? `${props.housenumber} ${props.street}` : props.street || null,
    };
}

export async function getCadastreFromCoords(lon: number, lat: number): Promise<CadastreResponse["features"][0] | null> {
    try {
        const api = await getAxiosApi();
        const response = await api.get<CadastreResponse>("https://data.geopf.fr/wfs/ows", {
            params: {
                service: "WFS",
                version: "2.0.0",
                request: "GetFeature",
                typename: "CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle",
                outputFormat: "application/json",
                srsname: "EPSG:4326",
                cql_filter: `INTERSECTS(geometry, POINT(${lon} ${lat}))`,
            },
        });
        return response.data.features?.[0] || null;
    } catch (error) {
        console.error("Request over Cadastre failed::", error);
        return null;
    }
}

export async function getAltitudeFromCoords(lon: number, lat: number): Promise<number | null> {
    try {
        const api = await getAxiosApi();
        const response = await api.get<AltitudeResponse>("https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json", {
            params: {
                lon,
                lat,
                zonly: true,
            },
        });
        return response.data.elevations?.[0]?.z;
    } catch (error) {
        console.error("Reverse BD alti failed:", error);
        return null;
    }
}

export function getFeatureCoordinates(feature: Feature<Geometry>): { lon: number; lat: number } | null {
    const geometry = feature.getGeometry();
    if (!geometry) return null;

    let coord: number[] | null = null;

    if (geometry instanceof Point) {
        coord = geometry.getCoordinates();
    } else if (geometry instanceof LineString) {
        coord = geometry.getFirstCoordinate();
    } else if (geometry instanceof Polygon) {
        coord = geometry.getCoordinates()[0][0];
    }

    if (!coord) return null;

    const lonLat = transform(coord, "EPSG:3857", "EPSG:4326");
    return { lon: lonLat[0], lat: lonLat[1] };
}
