import { Feature } from "ol";
import { Geometry } from "ol/geom";
import { getLength, getArea } from "ol/sphere";
import { LineString, Polygon, Point } from "ol/geom";
import { transform } from "ol/proj";
import { AutomaticFieldType, AutomaticFieldContext } from "../types";

import { getMunicipalityFromCoords, getAddressFromCoords, getCadastreFromCoords, getAltitudeFromCoords, getFeatureCoordinates } from "@/api/geocodageData";
import { FeatureTypeColumn, MAX_ENUM_CHOICES, OperatorType } from "@/constants/communities/types";
import { BuildFilterResponse, GroupSearch, RuleSearch } from "@/constants/savedSearches/types";

export const calculateAutomaticField = async (fieldType: AutomaticFieldType, context: AutomaticFieldContext): Promise<string | number | null> => {
    const { feature, userId, username, layerProjection } = context;

    switch (fieldType) {
        case AutomaticFieldType.USER_ID:
            return userId ?? null;

        case AutomaticFieldType.USERNAME:
            return username ?? null;

        case AutomaticFieldType.CURRENT_DATE:
            return new Date().toISOString().split("T")[0];

        case AutomaticFieldType.CURRENT_DATETIME:
            return new Date().toISOString();

        case AutomaticFieldType.LONGITUDE:
            return getLongitude(feature);

        case AutomaticFieldType.LATITUDE:
            return getLatitude(feature);

        case AutomaticFieldType.X:
            return getX(feature, layerProjection);

        case AutomaticFieldType.Y:
            return getY(feature, layerProjection);

        case AutomaticFieldType.LENGTH:
            return calculateLength(feature);

        case AutomaticFieldType.AREA:
            return calculateArea(feature);

        case AutomaticFieldType.AREA_KM2:
            return calculateAreaKm2(feature);

        case AutomaticFieldType.AREA_HA:
            return calculateAreaHa(feature);

        case AutomaticFieldType.MUNICIPALITY_NAME:
            return await getMunicipalityName(feature);

        case AutomaticFieldType.MUNICIPALITY_INSEE:
            return await getMunicipalityInsee(feature);

        case AutomaticFieldType.MUNICIPALITY_POSTCODE:
            return await getMunicipalityPostcode(feature);

        case AutomaticFieldType.DEPARTMENT:
            return await getDepartment(feature);

        case AutomaticFieldType.FULL_ADDRESS:
            return await getFullAddress(feature);

        case AutomaticFieldType.HOUSENUMBER:
            return await getHousenumber(feature);

        case AutomaticFieldType.STREET:
            return await getStreet(feature);

        case AutomaticFieldType.ADDRESS:
            return await getAddress(feature);

        case AutomaticFieldType.PARCEL_NUMBER:
            return await getParcelNumber(feature);

        case AutomaticFieldType.PARCEL_SHEET:
            return await getParcelSheet(feature);

        case AutomaticFieldType.PARCEL_SECTION:
            return await getParcelSection(feature);

        case AutomaticFieldType.ALTITUDE:
            return await getAltitude(feature);

        default:
            return null;
    }
};

const getFirstCoordinate = (feature: Feature<Geometry>): number[] | null => {
    const geometry = feature.getGeometry();
    if (!geometry) return null;

    if (geometry instanceof Point) {
        return geometry.getCoordinates();
    } else if (geometry instanceof LineString) {
        return geometry.getFirstCoordinate();
    } else if (geometry instanceof Polygon) {
        return geometry.getCoordinates()[0][0];
    }
    return null;
};

const getLongitude = (feature: Feature<Geometry>): number | null => {
    const coord = getFirstCoordinate(feature);
    if (!coord) return null;
    const lonLat = transform(coord, "EPSG:3857", "EPSG:4326");
    return Math.round(lonLat[0] * 1000000) / 1000000;
};

const getLatitude = (feature: Feature<Geometry>): number | null => {
    const coord = getFirstCoordinate(feature);
    if (!coord) return null;
    const lonLat = transform(coord, "EPSG:3857", "EPSG:4326");
    return Math.round(lonLat[1] * 1000000) / 1000000;
};

const getX = (feature: Feature<Geometry>, projection?: string): number | null => {
    const coord = getFirstCoordinate(feature);
    if (!coord) return null;
    if (projection && projection !== "EPSG:3857") {
        const transformed = transform(coord, "EPSG:3857", projection);
        return Math.round(transformed[0] * 100) / 100;
    }
    return Math.round(coord[0] * 100) / 100;
};

const getY = (feature: Feature<Geometry>, projection?: string): number | null => {
    const coord = getFirstCoordinate(feature);
    if (!coord) return null;
    if (projection && projection !== "EPSG:3857") {
        const transformed = transform(coord, "EPSG:3857", projection);
        return Math.round(transformed[1] * 100) / 100;
    }
    return Math.round(coord[1] * 100) / 100;
};

const calculateLength = (feature: Feature<Geometry>): number | null => {
    const geometry = feature.getGeometry();
    if (!geometry) return null;

    if (geometry instanceof LineString) {
        return Math.round(getLength(geometry));
    } else if (geometry instanceof Polygon) {
        const linearRing = geometry.getLinearRing(0);
        return linearRing ? Math.round(getLength(linearRing)) : null;
    }
    return null;
};

const calculateArea = (feature: Feature<Geometry>): number | null => {
    const geometry = feature.getGeometry();
    if (!geometry || !(geometry instanceof Polygon)) return null;
    return Math.round(getArea(geometry));
};

const calculateAreaKm2 = (feature: Feature<Geometry>): number | null => {
    const area = calculateArea(feature);
    return area ? Math.round((area / 1000000) * 100) / 100 : null;
};

const calculateAreaHa = (feature: Feature<Geometry>): number | null => {
    const area = calculateArea(feature);
    return area ? Math.round((area / 10000) * 100) / 100 : null;
};

const getMunicipalityName = async (feature: Feature<Geometry>): Promise<string | null> => {
    const coords = getFeatureCoordinates(feature);
    if (!coords) return null;
    const municipality = await getMunicipalityFromCoords(coords.lon, coords.lat);
    return municipality?.name || null;
};

const getMunicipalityInsee = async (feature: Feature<Geometry>): Promise<string | null> => {
    const coords = getFeatureCoordinates(feature);
    if (!coords) return null;
    const municipality = await getMunicipalityFromCoords(coords.lon, coords.lat);
    return municipality?.insee || null;
};

const getMunicipalityPostcode = async (feature: Feature<Geometry>): Promise<string | null> => {
    const coords = getFeatureCoordinates(feature);
    if (!coords) return null;
    const municipality = await getMunicipalityFromCoords(coords.lon, coords.lat);
    return municipality?.postcode || null;
};

const getDepartment = async (feature: Feature<Geometry>): Promise<string | null> => {
    const coords = getFeatureCoordinates(feature);
    if (!coords) return null;
    const municipality = await getMunicipalityFromCoords(coords.lon, coords.lat);
    return municipality?.department || null;
};

const getFullAddress = async (feature: Feature<Geometry>): Promise<string | null> => {
    const coords = getFeatureCoordinates(feature);
    if (!coords) return null;
    const address = await getAddressFromCoords(coords.lon, coords.lat);
    return address?.fullAddress || null;
};

const getHousenumber = async (feature: Feature<Geometry>): Promise<string | null> => {
    const coords = getFeatureCoordinates(feature);
    if (!coords) return null;
    const address = await getAddressFromCoords(coords.lon, coords.lat);
    return address?.housenumber || null;
};

const getStreet = async (feature: Feature<Geometry>): Promise<string | null> => {
    const coords = getFeatureCoordinates(feature);
    if (!coords) return null;
    const address = await getAddressFromCoords(coords.lon, coords.lat);
    return address?.street || null;
};

const getAddress = async (feature: Feature<Geometry>): Promise<string | null> => {
    const coords = getFeatureCoordinates(feature);
    if (!coords) return null;
    const address = await getAddressFromCoords(coords.lon, coords.lat);
    return address?.address || null;
};

const getParcelNumber = async (feature: Feature<Geometry>): Promise<string | null> => {
    const coords = getFeatureCoordinates(feature);
    if (!coords) return null;
    const parcel = await getCadastreFromCoords(coords.lon, coords.lat);
    return parcel?.properties?.numero || null;
};

const getParcelSheet = async (feature: Feature<Geometry>): Promise<string | null> => {
    const coords = getFeatureCoordinates(feature);
    if (!coords) return null;
    const parcel = await getCadastreFromCoords(coords.lon, coords.lat);
    return parcel?.properties?.feuille || null;
};

const getParcelSection = async (feature: Feature<Geometry>): Promise<string | null> => {
    const coords = getFeatureCoordinates(feature);
    if (!coords) return null;
    const parcel = await getCadastreFromCoords(coords.lon, coords.lat);
    return parcel?.properties?.section || null;
};

const getAltitude = async (feature: Feature<Geometry>): Promise<number | null> => {
    const coords = getFeatureCoordinates(feature);
    if (!coords) return null;
    const altitude = await getAltitudeFromCoords(coords.lon, coords.lat);
    return altitude ? Math.round(altitude * 10) / 10 : null;
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
            if (currentColumn.enum && currentColumn.enum.length > 0 && currentColumn.enum.length <= MAX_ENUM_CHOICES) {
                operators = [OperatorType.in, OperatorType.not_in, OperatorType.is_empty, OperatorType.is_not_empty];
                break;
            }
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

export function buildCondition(rule: RuleSearch) {
    const { name, operator, value = [] } = rule;
    switch (operator) {
        case OperatorType.in:
            return { [name]: { $in: value ?? "" } };
        case OperatorType.not_in:
            return { [name]: { $nin: value ?? "" } };
        case OperatorType.equal:
            return {
                [name]: { $regex: `^${value[0] ?? ""}$`, $options: "i" },
            };
        case OperatorType.not_equal:
            return {
                [name]: { $regex: `^(?!${value[0] ?? ""}$).*$`, $options: "i" },
            };
        case OperatorType.begins_with:
            return {
                [name]: { $regex: `^${value[0] ?? ""}`, $options: "i" },
            };
        case OperatorType.not_begins_with:
            return {
                [name]: { $regex: `^(?!${value[0] ?? ""}).*$`, $options: "i" },
            };
        case OperatorType.contains:
            return {
                [name]: { $regex: value[0] ?? "", $options: "i" },
            };
        case OperatorType.not_contains:
            return {
                [name]: { $regex: `^((?!${value[0] ?? ""}).)*$`, $options: "i" },
            };
        case OperatorType.ends_with:
            return {
                [name]: { $regex: `${value[0] ?? ""}$`, $options: "i" },
            };
        case OperatorType.not_ends_with:
            return {
                [name]: { $regex: `(?<!${value[0] ?? ""})$`, $options: "i" },
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
