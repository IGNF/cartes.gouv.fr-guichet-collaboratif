import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { getLength, getArea } from "ol/sphere";
import { LineString, Polygon, Point, MultiPoint, MultiLineString, MultiPolygon } from "ol/geom";
import { get, transform } from "ol/proj";
import { AutomaticFieldType, AutomaticFieldContext, AutomaticRemoteLookups } from "../types";

import { getReverseGeocodeInfo, getCadastreFromCoords, getAltitudeFromCoords } from "@/api/geocodageData";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY } from "@/constants";
import { CommunityGeoservice, FeatureTypeColumn, OperatorType } from "@/constants/communities/types";
import { BuildFilterResponse, GroupSearch, RuleSearch } from "@/constants/savedSearches/types";

const DEFAULT_MAP_PROJECTION = "EPSG:3857";
const round = (value: number, factor: number) => Math.round(value * factor) / factor;

export const isAutomaticFieldType = (value: unknown): value is AutomaticFieldType => Object.values(AutomaticFieldType).includes(value as AutomaticFieldType);

const pad = (n: number) => String(n).padStart(2, "0");

const getLocalDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** First coordinate of the feature geometry, in the geometry projection. */
export const getFirstCoordinate = (feature: Feature<Geometry>): number[] | null => {
    const geometry = feature.getGeometry();
    if (!geometry) return null;

    if (geometry instanceof Point) return geometry.getCoordinates();
    if (geometry instanceof LineString) return geometry.getFirstCoordinate();
    if (geometry instanceof Polygon) return geometry.getCoordinates()[0]?.[0] ?? null;
    if (geometry instanceof MultiPoint) return geometry.getPoint(0)?.getCoordinates() ?? null;
    if (geometry instanceof MultiLineString) return geometry.getLineString(0)?.getFirstCoordinate() ?? null;
    if (geometry instanceof MultiPolygon) return geometry.getPolygon(0)?.getCoordinates()[0]?.[0] ?? null;
    return null;
};

const getLonLat = (feature: Feature<Geometry>, mapProjection: string): { lon: number; lat: number } | null => {
    const coord = getFirstCoordinate(feature);
    if (!coord || !get(mapProjection)) return null;
    const [lon, lat] = transform(coord, mapProjection, "EPSG:4326");
    return { lon, lat };
};

const normalizeProjection = (projection?: string | number): string | null => {
    if (projection === undefined || projection === null || projection === "") return null;
    const code = /^\d+$/.test(String(projection)) ? `EPSG:${projection}` : String(projection);
    return get(code) ? code : null;
};

const getProjectedCoordinate = (feature: Feature<Geometry>, index: 0 | 1, mapProjection: string, layerProjection?: string | number): number | null => {
    const coord = getFirstCoordinate(feature);
    const target = normalizeProjection(layerProjection);
    if (!coord || !target || !get(mapProjection)) return null;
    return round(transform(coord, mapProjection, target)[index], 100);
};

/** Projection of the layer data: the one of its geometry column, otherwise the one of its bounding box. */
export const getLayerProjection = (geoservice?: CommunityGeoservice): string | undefined =>
    geoservice?.columns.find((col) => col.name === geoservice.geometryName)?.crs || geoservice?.boxSrid || undefined;

/** Automatic columns of a layer, with the keyword (stored in `formula`) of the value to compute. */
export const getAutomaticColumns = (columns: FeatureTypeColumn[]): { name: string; fieldType: AutomaticFieldType }[] =>
    columns.flatMap((col) => (col.automatic && isAutomaticFieldType(col.formula) ? [{ name: col.name, fieldType: col.formula }] : []));

const calculateLength = (feature: Feature<Geometry>, projection: string): number | null => {
    const geometry = feature.getGeometry();
    if (!geometry) return null;
    const opts = { projection };

    if (geometry instanceof LineString) return Math.round(getLength(geometry, opts));
    if (geometry instanceof MultiLineString) return Math.round(geometry.getLineStrings().reduce((sum, l) => sum + getLength(l, opts), 0));
    if (geometry instanceof Polygon) {
        const ring = geometry.getLinearRing(0);
        return ring ? Math.round(getLength(ring, opts)) : null;
    }
    if (geometry instanceof MultiPolygon) {
        return Math.round(geometry.getPolygons().reduce((sum, p) => sum + (p.getLinearRing(0) ? getLength(p.getLinearRing(0)!, opts) : 0), 0));
    }
    return null;
};

const calculateArea = (feature: Feature<Geometry>, projection: string): number | null => {
    const geometry = feature.getGeometry();
    if (!(geometry instanceof Polygon) && !(geometry instanceof MultiPolygon)) return null;
    return Math.round(getArea(geometry, { projection }));
};

const createRemoteLookups = (feature: Feature<Geometry>, mapProjection: string): AutomaticRemoteLookups => {
    const once = <T>(fn: (c: { lon: number; lat: number }) => Promise<T | null>) => {
        let promise: Promise<T | null> | null = null;
        return () =>
            (promise ??= (async () => {
                const coords = getLonLat(feature, mapProjection);
                return coords ? fn(coords) : null;
            })());
    };

    return {
        reverse: once(({ lon, lat }) => getReverseGeocodeInfo(lon, lat)),
        cadastre: once(async ({ lon, lat }) => (await getCadastreFromCoords(lon, lat))?.properties ?? null),
        altitude: once(({ lon, lat }) => getAltitudeFromCoords(lon, lat)),
    };
};

/**
 * Computes the values of the automatic columns of a feature (remote lookups are shared between columns).
 * With `onlyEmpty`, the columns that already have a value are left untouched (no geometry change since they were filled).
 * Columns whose value cannot be computed are left out, so that their current value is kept.
 */
export const computeAutomaticFields = async (
    feature: Feature<Geometry>,
    context: Pick<AutomaticFieldContext, "userId" | "username" | "mapProjection">,
    { onlyEmpty = false }: { onlyEmpty?: boolean } = {}
): Promise<Record<string, string | number>> => {
    const geoservice = feature.get(FEATURE_TYPE_GEOSERVICE_PROPERTY) as CommunityGeoservice | undefined;
    const featData = (feature.get(FEATURE_TYPE_DATA_PROPERTY) ?? {}) as Record<string, unknown>;
    const automaticColumns = getAutomaticColumns(geoservice?.columns ?? []).filter(
        ({ name }) => !onlyEmpty || featData[name] === null || featData[name] === undefined || featData[name] === ""
    );
    if (automaticColumns.length === 0) return {};

    const mapProjection = context.mapProjection ?? DEFAULT_MAP_PROJECTION;
    const fieldContext: AutomaticFieldContext = {
        ...context,
        feature,
        mapProjection,
        layerProjection: getLayerProjection(geoservice),
        remote: createRemoteLookups(feature, mapProjection),
    };

    const results = await Promise.all(
        automaticColumns.map(async ({ name, fieldType }) => {
            try {
                return [name, await calculateAutomaticField(fieldType, fieldContext)] as const;
            } catch {
                return [name, null] as const;
            }
        })
    );

    const values: Record<string, string | number> = {};
    results.forEach(([name, value]) => {
        if (value !== null) values[name] = value;
    });
    return values;
};

export const calculateAutomaticField = async (fieldType: AutomaticFieldType, context: AutomaticFieldContext): Promise<string | number | null> => {
    const { feature, userId, username, layerProjection } = context;
    const mapProjection = context.mapProjection ?? DEFAULT_MAP_PROJECTION;
    const remote = context.remote ?? createRemoteLookups(feature, mapProjection);
    const now = new Date();

    switch (fieldType) {
        case AutomaticFieldType.USER_ID:
            return userId ?? null;
        case AutomaticFieldType.USERNAME:
            return username ?? null;
        case AutomaticFieldType.CURRENT_DATE:
            return getLocalDate(now);
        case AutomaticFieldType.CURRENT_DATETIME:
            return `${getLocalDate(now)} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        case AutomaticFieldType.LONGITUDE: {
            const coords = getLonLat(feature, mapProjection);
            return coords ? round(coords.lon, 1000000) : null;
        }
        case AutomaticFieldType.LATITUDE: {
            const coords = getLonLat(feature, mapProjection);
            return coords ? round(coords.lat, 1000000) : null;
        }
        case AutomaticFieldType.X:
            return getProjectedCoordinate(feature, 0, mapProjection, layerProjection);
        case AutomaticFieldType.Y:
            return getProjectedCoordinate(feature, 1, mapProjection, layerProjection);

        case AutomaticFieldType.LENGTH:
            return calculateLength(feature, mapProjection);
        case AutomaticFieldType.AREA:
            return calculateArea(feature, mapProjection);
        case AutomaticFieldType.AREA_KM2: {
            const area = calculateArea(feature, mapProjection);
            return area !== null ? round(area / 1000000, 100) : null;
        }
        case AutomaticFieldType.AREA_HA: {
            const area = calculateArea(feature, mapProjection);
            return area !== null ? round(area / 10000, 100) : null;
        }

        case AutomaticFieldType.MUNICIPALITY_NAME:
            return (await remote.reverse())?.municipality.name || null;
        case AutomaticFieldType.MUNICIPALITY_INSEE:
            return (await remote.reverse())?.municipality.insee || null;
        case AutomaticFieldType.MUNICIPALITY_POSTCODE:
            return (await remote.reverse())?.municipality.postcode || null;
        case AutomaticFieldType.DEPARTMENT:
            return (await remote.reverse())?.municipality.department || null;

        case AutomaticFieldType.FULL_ADDRESS:
            return (await remote.reverse())?.address.fullAddress || null;
        case AutomaticFieldType.HOUSENUMBER:
            return (await remote.reverse())?.address.housenumber || null;
        case AutomaticFieldType.STREET:
            return (await remote.reverse())?.address.street || null;
        case AutomaticFieldType.ADDRESS:
            return (await remote.reverse())?.address.address || null;

        case AutomaticFieldType.PARCEL_NUMBER:
            return (await remote.cadastre())?.numero || null;
        case AutomaticFieldType.PARCEL_SHEET: {
            const sheet = (await remote.cadastre())?.feuille;
            return sheet != null ? String(sheet) : null;
        }
        case AutomaticFieldType.PARCEL_SECTION:
            return (await remote.cadastre())?.section || null;

        case AutomaticFieldType.ALTITUDE: {
            const altitude = await remote.altitude();
            return altitude !== null ? round(altitude, 10) : null;
        }

        default:
            return null;
    }
};

export const getOperators = (
    currentColumn: FeatureTypeColumn | undefined,
    operatorList: {
        value: OperatorType;
        title: string;
    }[]
) => {
    if (!currentColumn) return [];

    let operators: string[] = [];

    switch (currentColumn.type) {
        case "String":
            operators = [
                OperatorType.equal,
                OperatorType.not_equal,
                OperatorType.begins_with,
                OperatorType.not_begins_with,
                OperatorType.contains,
                OperatorType.not_contains,
                OperatorType.ends_with,
                OperatorType.not_ends_with,
                OperatorType.is_empty,
                OperatorType.is_not_empty,
            ];
            if (currentColumn.nullable) {
                operators = operators.concat([OperatorType.is_null, OperatorType.is_not_null]);
            }
            break;

        case "Integer":
            operators = [
                OperatorType.equal,
                OperatorType.not_equal,
                OperatorType.less,
                OperatorType.less_or_equal,
                OperatorType.greater,
                OperatorType.greater_or_equal,
                OperatorType.between,
                OperatorType.not_between,
            ];
            if (currentColumn.nullable) {
                operators = operators.concat([OperatorType.is_null, OperatorType.is_not_null]);
            }
            break;
        case "Double":
            operators = [
                OperatorType.less,
                OperatorType.less_or_equal,
                OperatorType.greater,
                OperatorType.greater_or_equal,
                OperatorType.between,
                OperatorType.not_between,
            ];
            if (currentColumn.nullable) {
                operators = operators.concat([OperatorType.is_null, OperatorType.is_not_null]);
            }
            break;
        case "Boolean":
            operators = [OperatorType.equal];
            if (currentColumn.nullable) {
                operators = operators.concat([OperatorType.is_null, OperatorType.is_not_null]);
            }
            break;
        case "Date":
        case "DateTime":
        case "Year":
        case "YearMonth":
            operators = [
                OperatorType.equal,
                OperatorType.not_equal,
                OperatorType.less,
                OperatorType.less_or_equal,
                OperatorType.greater,
                OperatorType.greater_or_equal,
                OperatorType.between,
                OperatorType.not_between,
                OperatorType.is_empty,
                OperatorType.is_not_empty,
            ];
            if (currentColumn.nullable) {
                operators = operators.concat([OperatorType.is_null, OperatorType.is_not_null]);
            }
            break;
        default:
            operators = [];
            break;
    }
    return operatorList.filter((op) => operators.includes(op.value));
};

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export function buildCondition(rule: RuleSearch) {
    const { name, operator, value = [] } = rule;
    const escapedValue = escapeRegExp(value[0] ?? "");

    switch (operator) {
        case OperatorType.in:
            return { [name]: { $in: value ?? "" } };
        case OperatorType.not_in:
            return { [name]: { $nin: value ?? "" } };
        case OperatorType.equal:
            return {
                [name]: { $regex: `^${escapedValue}$`, $options: "i" },
            };
        case OperatorType.not_equal:
            return {
                [name]: { $regex: `^(?!${escapedValue}$).*$`, $options: "i" },
            };
        case OperatorType.begins_with:
            return {
                [name]: { $regex: `^${escapedValue}`, $options: "i" },
            };
        case OperatorType.not_begins_with:
            return {
                [name]: { $regex: `^(?!${escapedValue}).*$`, $options: "i" },
            };
        case OperatorType.contains:
            return {
                [name]: { $regex: escapedValue, $options: "i" },
            };
        case OperatorType.not_contains:
            return {
                [name]: { $regex: `^((?!${escapedValue}).)*$`, $options: "i" },
            };
        case OperatorType.ends_with:
            return {
                [name]: { $regex: `${escapedValue}$`, $options: "i" },
            };
        case OperatorType.not_ends_with:
            return {
                [name]: { $regex: `(?<!${escapedValue})$`, $options: "i" },
            };
        case OperatorType.is_empty:
            return {
                $or: [{ [name]: "" }],
            };
        case OperatorType.is_not_empty:
            return {
                [name]: { $ne: "" },
            };
        case OperatorType.is_null:
            return {
                [name]: null,
            };
        case OperatorType.is_not_null:
            return {
                [name]: { $ne: null },
            };
        case OperatorType.less:
            return { [name]: { $lt: value[0] ?? "" } };
        case OperatorType.less_or_equal:
            return { [name]: { $lte: value[0] ?? "" } };
        case OperatorType.greater:
            return { [name]: { $gt: value[0] ?? "" } };
        case OperatorType.greater_or_equal:
            return { [name]: { $gte: value[0] ?? "" } };
        case OperatorType.between:
            return {
                [name]: {
                    $gte: value[0] ?? "",
                    $lte: value[1] ?? "",
                },
            };
        case OperatorType.not_between:
            return {
                $or: [{ [name]: { $lt: value[0] ?? "" } }, { [name]: { $gt: value[1] ?? "" } }],
            };

        default:
            throw new Error(`Unsupported operator: ${operator}`);
    }
}

export function buildFilter(group: GroupSearch): { $and?: BuildFilterResponse[]; $or?: BuildFilterResponse[] } {
    const conditions = group.rules.map((rule) => {
        if ("groupOp" in rule) {
            return buildFilter(rule);
        }
        return buildCondition(rule);
    });

    return group.groupOp === "ET" ? { $and: conditions } : { $or: conditions };
}

export function toMongoFilter(input: GroupSearch) {
    return {
        filter: buildFilter(input),
    };
}
