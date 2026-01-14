import { Circle as CircleStyle, Fill, Icon, RegularShape, Stroke, Style, Text } from "ol/style";
import { reportImgStatus } from "./utils";
import { Circle, Geometry, LineString, Point } from "ol/geom";
import { Coordinate } from "ol/coordinate";
import {
    CLUSTER_CIRCLE_COLOR,
    CLUSTER_REPORT_CIRCLE_COLOR,
    CLUSTER_REPORT_CIRCLE_STROKE_COLOR,
    SELECTION_CIRCLE_COLOR,
    WHITE_COLOR,
    HIGHLIGHT_COLOR,
    POLYGON_LINE_COLOR,
    POINT_COLOR,
    FILL_COLOR,
} from "./colors";
import { GeometryFeatueParams } from "./reports/types";
import { Map } from "ol";
import { FeatureLike } from "ol/Feature";
import {
    CommunityGeoservice,
    FeatureTypeCondition,
    FeatureTypeConditionValue,
    FeatureTypeSelectedStyle,
    FeatureTypeStyle,
    FeatureTypeStyleItem,
    GeoserviceFeatureTypeProp,
    RegularShapeStyleProps,
    WebGLFilterType,
} from "./communities/types";
import { FlatStyle } from "ol/style/flat";
import { getRawWellKnownNames } from "./wellKnownNames";
import { symbolComparator } from "./mongo_parser";
import { DEFAULT_STYLE_NAME, FEATURE_TYPE_SELECTED_PROPERTY } from ".";
import { isDateFormat } from "./communities/utils";

export const clusterReportCircleStyle = (coord: Coordinate) =>
    new Style({
        geometry: new Point(coord),
        image: new CircleStyle({
            radius: 8,
            fill: new Fill({ color: CLUSTER_REPORT_CIRCLE_COLOR }),
            stroke: new Stroke({ color: CLUSTER_REPORT_CIRCLE_STROKE_COLOR, width: 1 }),
        }),
        zIndex: 5,
    });

export const clusterReportPinStyle = (geometry: Geometry | undefined = undefined) => {
    const reportStatus = geometry?.get("reportData")?.status;
    return new Style({
        geometry,
        image: new Icon({
            src: reportStatus ? reportImgStatus[reportStatus].img : reportImgStatus.submit.img,
            scale: 1,
            anchor: [0.5, 1],
        }),
        zIndex: 3,
    });
};

export const clusterCircleStyle = (size: number = 0) =>
    new CircleStyle({
        radius: size > 30 ? 30 : Math.max(size, 15),
        fill: new Fill({
            color: CLUSTER_CIRCLE_COLOR,
        }),
        stroke: new Stroke({ color: WHITE_COLOR, width: 2 }),
    });

export const clusterTextStyle = (text: string = "") =>
    new Text({
        text,
        scale: 1.5,
        font: "bold 12px Times New Roman, serif",
        textAlign: "center",
        textBaseline: "middle",
        fill: new Fill({
            color: WHITE_COLOR,
        }),
    });

export const strokeStyleCommon = (start: Coordinate, end: number[]) =>
    new Style({
        geometry: new LineString([start, end]),
        stroke: new Stroke({
            color: WHITE_COLOR,
            width: 1,
        }),
        zIndex: 1,
    });

export const selectionCircleStyle = (map: Map) =>
    new Style({
        geometry: (f) => {
            const center = (f.getGeometry() as GeometryFeatueParams)?.getCoordinates() as Coordinate;
            const mapResolution = map?.getView().getResolution() || 1;
            return new Circle(center, 50 * mapResolution);
        },
        fill: new Fill({ color: SELECTION_CIRCLE_COLOR }),
        zIndex: 2,
    });

export const clusterStyle = (feature: FeatureLike): Style => {
    const features = feature.get("features");
    const size: number = features.length;

    if (size === 1) {
        return features[0].getStyle();
    } else {
        return new Style({
            image: clusterCircleStyle(size),
            text: clusterTextStyle(size.toString()),
            zIndex: 2,
        });
    }
};

export const strokeLineDash = function ({ strokeWidth, strokeDashstyle }: { strokeWidth: number; strokeDashstyle: string | undefined }) {
    const width = Number(strokeWidth) || 2;
    switch (strokeDashstyle) {
        case "dot":
            return [1, 2 * width];
        case "dash":
            return [2 * width, 2 * width];
        case "dashdot":
            return [2 * width, 4 * width, 1, 4 * width];
        case "longdash":
            return [4 * width, 2 * width];
        case "longdashdot":
            return [4 * width, 4 * width, 1, 4 * width];
        default:
            return undefined;
    }
};

export function hexToRgba(hex: string | undefined | null, alpha: number = 1): string {
    try {
        if (!hex || typeof hex !== "string") {
            return POLYGON_LINE_COLOR;
        }

        const cleanHex = hex.trim();
        const match = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(cleanHex);
        if (!match) {
            return POLYGON_LINE_COLOR;
        }

        let r: number, g: number, b: number;

        if (cleanHex.length === 4) {
            r = parseInt(cleanHex[1] + cleanHex[1], 16);
            g = parseInt(cleanHex[2] + cleanHex[2], 16);
            b = parseInt(cleanHex[3] + cleanHex[3], 16);
        } else {
            r = parseInt(cleanHex.slice(1, 3), 16);
            g = parseInt(cleanHex.slice(3, 5), 16);
            b = parseInt(cleanHex.slice(5, 7), 16);
        }

        if (![r, g, b, alpha].every(Number.isFinite)) {
            return POLYGON_LINE_COLOR;
        }

        const safeAlpha = Number.isFinite(alpha) ? Math.min(Math.max(alpha, 0), 1) : 1;

        return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
    } catch {
        return POLYGON_LINE_COLOR;
    }
}

export const getLineOrPolygonStyle = (shapeProps: FeatureTypeStyleItem) => {
    return new Style({
        stroke: shapeProps.strokeColor
            ? new Stroke({
                  color: hexToRgba(shapeProps.strokeColor, shapeProps.strokeOpacity),
                  width: shapeProps.strokeWidth,
                  lineDash: shapeProps.strokeDashstyle ? strokeLineDash(shapeProps) : undefined,
                  lineCap: shapeProps.strokeLinecap || undefined,
              })
            : undefined,
        fill: shapeProps.fillColor
            ? new Fill({
                  color: hexToRgba(shapeProps.fillColor, shapeProps.fillOpacity),
              })
            : undefined,
        zIndex: shapeProps.zIndex ?? 1,
    });
};

export const getCircleStyle = (shapeProps: FeatureTypeStyleItem) => {
    return new Style({
        image: new CircleStyle({
            radius: shapeProps.pointRadius,
            fill: new Fill({
                color: hexToRgba(shapeProps.fillColor, shapeProps.fillOpacity),
            }),
            stroke: new Stroke({
                color: hexToRgba(shapeProps.strokeColor, shapeProps.strokeOpacity),
                width: shapeProps.strokeWidth,
            }),
        }),
        zIndex: shapeProps.zIndex ?? 1,
    });
};

export const getRegularShapeStyle = ({ shapeProps, points, radius = 10, radius2, angle }: RegularShapeStyleProps) => {
    return new Style({
        image: new RegularShape({
            points: points,
            radius: shapeProps.pointRadius || radius,
            radius2: radius2,
            angle: angle,
            fill: shapeProps.fillColor
                ? new Fill({
                      color: hexToRgba(shapeProps.fillColor, shapeProps.fillOpacity),
                  })
                : undefined,
            stroke: shapeProps.strokeColor
                ? new Stroke({
                      color: hexToRgba(shapeProps.strokeColor, shapeProps.strokeOpacity),
                      width: shapeProps.strokeWidth,
                      lineDash: shapeProps.strokeDashstyle ? strokeLineDash(shapeProps) : undefined,
                      lineCap: shapeProps.strokeLinecap || undefined,
                  })
                : undefined,
        }),
        zIndex: shapeProps.zIndex ?? 1,
    });
};

export const featureTypeSelectedPointCircleStyle = (isDefaultStyle: boolean = false) => {
    if (isDefaultStyle) {
        return getCircleStyle({
            pointRadius: 6,
            strokeColor: WHITE_COLOR,
            strokeOpacity: 1,
            strokeWidth: 1,
            title: GeoserviceFeatureTypeProp.POINT,
            strokeDashstyle: undefined,
            strokeLinecap: undefined,
            fillColor: CLUSTER_CIRCLE_COLOR,
            fillOpacity: 1,
            zIndex: 2,
        });
    }
    return [
        getCircleStyle({
            pointRadius: 8,
            strokeColor: CLUSTER_CIRCLE_COLOR,
            strokeOpacity: 1,
            strokeWidth: 2,
            title: GeoserviceFeatureTypeProp.POINT,
            strokeDashstyle: undefined,
            strokeLinecap: undefined,
            fillColor: HIGHLIGHT_COLOR,
            fillOpacity: 1,
            zIndex: 2,
        }),
        getCircleStyle({
            pointRadius: 3,
            strokeColor: CLUSTER_CIRCLE_COLOR,
            strokeOpacity: 1,
            strokeWidth: 2,
            title: GeoserviceFeatureTypeProp.POINT,
            strokeDashstyle: undefined,
            strokeLinecap: undefined,
            fillColor: HIGHLIGHT_COLOR,
            fillOpacity: 1,
            zIndex: 2,
        }),
    ];
};

export const featureTypeSelectedLineStyle = (isDefaultStyle: boolean = false) => {
    return [
        getLineOrPolygonStyle({
            pointRadius: 8,
            fillColor: "",
            fillOpacity: 1,
            strokeColor: isDefaultStyle ? WHITE_COLOR : CLUSTER_CIRCLE_COLOR,
            strokeOpacity: 1,
            strokeWidth: 7,
            title: GeoserviceFeatureTypeProp.LINE,
            strokeDashstyle: undefined,
            strokeLinecap: "round",
            zIndex: 2,
        }),
        getLineOrPolygonStyle({
            pointRadius: 6,
            fillColor: "",
            fillOpacity: 1,
            strokeColor: isDefaultStyle ? CLUSTER_CIRCLE_COLOR : HIGHLIGHT_COLOR,
            strokeOpacity: 1,
            strokeWidth: 4,
            title: GeoserviceFeatureTypeProp.LINE,
            strokeDashstyle: undefined,
            strokeLinecap: "round",
            zIndex: 2,
        }),
    ];
};

export const featureTypeSelectedPolygonStyle = (isDefaultStyle: boolean = false) => {
    return [
        getLineOrPolygonStyle({
            pointRadius: 0,
            fillColor: isDefaultStyle ? WHITE_COLOR : POLYGON_LINE_COLOR,
            fillOpacity: isDefaultStyle ? 0.2 : 0.8,
            strokeColor: isDefaultStyle ? WHITE_COLOR : CLUSTER_CIRCLE_COLOR,
            strokeOpacity: 1,
            strokeWidth: 4,
            title: GeoserviceFeatureTypeProp.POLYGON,
            strokeDashstyle: "",
            strokeLinecap: "butt",
            zIndex: 2,
        }),
        getLineOrPolygonStyle({
            pointRadius: 0,
            fillColor: isDefaultStyle ? WHITE_COLOR : HIGHLIGHT_COLOR,
            fillOpacity: 0.2,
            strokeColor: isDefaultStyle ? CLUSTER_CIRCLE_COLOR : HIGHLIGHT_COLOR,
            strokeOpacity: 1,
            strokeWidth: 2,
            title: GeoserviceFeatureTypeProp.POLYGON,
            strokeDashstyle: "",
            strokeLinecap: "butt",
            zIndex: 2,
        }),
    ];
};

export const featureDefaultStyle = (type: GeoserviceFeatureTypeProp = GeoserviceFeatureTypeProp.POINT): FeatureTypeStyle => {
    const defaults: Record<GeoserviceFeatureTypeProp, FeatureTypeStyle> = {
        [GeoserviceFeatureTypeProp.POINT]: {
            name: DEFAULT_STYLE_NAME,
            types: [
                {
                    title: "Par défaut - Point",
                    type: "circle" as const,
                    featureType: GeoserviceFeatureTypeProp.POINT,
                    pointRadius: 6,
                    fillColor: FILL_COLOR,
                    fillOpacity: 0.4,
                    strokeColor: POINT_COLOR,
                    strokeWidth: 2,
                    strokeOpacity: 1,
                    strokeDashstyle: undefined,
                    strokeLinecap: undefined,
                },
            ],
        },
        [GeoserviceFeatureTypeProp.LINE]: {
            name: DEFAULT_STYLE_NAME,
            types: [
                {
                    title: "Par défaut - Ligne",
                    type: "line" as const,
                    featureType: GeoserviceFeatureTypeProp.LINE,
                    pointRadius: 0,
                    fillColor: "",
                    fillOpacity: 0,
                    strokeColor: POLYGON_LINE_COLOR,
                    strokeWidth: 2,
                    strokeOpacity: 1,
                    strokeDashstyle: undefined,
                    strokeLinecap: "round" as const,
                },
            ],
        },
        [GeoserviceFeatureTypeProp.POLYGON]: {
            name: DEFAULT_STYLE_NAME,
            types: [
                {
                    title: "Par défaut - Polygone",
                    type: "polygon" as const,
                    featureType: GeoserviceFeatureTypeProp.POLYGON,
                    pointRadius: 0,
                    fillColor: FILL_COLOR,
                    fillOpacity: 0.4,
                    strokeColor: POLYGON_LINE_COLOR,
                    strokeWidth: 2,
                    strokeOpacity: 1,
                    strokeDashstyle: undefined,
                    strokeLinecap: undefined,
                },
            ],
        },
    };
    return defaults[type] || defaults[GeoserviceFeatureTypeProp.POINT];
};
export const getSelectedFeatureTypeStyle = (type: string, style: FeatureTypeStyle) => {
    const isDefaultStyle = style.name === featureDefaultStyle().name;
    if (type === GeoserviceFeatureTypeProp.POINT) return featureTypeSelectedPointCircleStyle(isDefaultStyle);
    if (type === GeoserviceFeatureTypeProp.LINE) return featureTypeSelectedLineStyle(isDefaultStyle);
    if (type === GeoserviceFeatureTypeProp.POLYGON) return featureTypeSelectedPolygonStyle(isDefaultStyle);
};

export const getStyleWebGLPolygon: (isDefault: boolean) => FlatStyle[] = (isDefault: boolean = false): FlatStyle[] => {
    return [
        {
            "stroke-color": isDefault ? WHITE_COLOR : CLUSTER_CIRCLE_COLOR,
            "stroke-width": 2,
            "fill-color": isDefault ? WHITE_COLOR : FILL_COLOR,
        },
        {
            "stroke-color": isDefault ? WHITE_COLOR : CLUSTER_CIRCLE_COLOR,
            "stroke-width": 6,
        },
        {
            "stroke-color": isDefault ? CLUSTER_CIRCLE_COLOR : HIGHLIGHT_COLOR,
            "stroke-width": 3,
        },
    ];
};

export const getStyleWebGLLine: (isDefault: boolean) => FlatStyle[] = (isDefault: boolean = false): FlatStyle[] => {
    return [
        {
            "stroke-color": isDefault ? WHITE_COLOR : CLUSTER_CIRCLE_COLOR,
            "stroke-width": 7,
            "stroke-line-cap": "round",
        },
        {
            "stroke-color": isDefault ? CLUSTER_CIRCLE_COLOR : HIGHLIGHT_COLOR,
            "stroke-width": 4,
            "stroke-line-cap": "round",
        },
    ];
};

export const getStyleWebGLPoint: (isDefault: boolean) => FlatStyle | FlatStyle[] = (isDefault: boolean = false): FlatStyle | FlatStyle[] => {
    if (isDefault) {
        return {
            "circle-radius": 6,
            "circle-stroke-color": WHITE_COLOR,
            "circle-stroke-width": 2,
            "circle-fill-color": CLUSTER_CIRCLE_COLOR,
            "z-index": ["get", "zIndex"],
        };
    }
    return [
        {
            "circle-radius": 8,
            "circle-stroke-color": CLUSTER_CIRCLE_COLOR,
            "circle-stroke-width": 2,
            "circle-fill-color": HIGHLIGHT_COLOR,
            "z-index": ["get", "zIndex"],
        },
        {
            "circle-radius": 3.5,
            "circle-stroke-color": CLUSTER_CIRCLE_COLOR,
            "circle-stroke-width": 2,
            "circle-fill-color": POLYGON_LINE_COLOR,
            "z-index": ["get", "zIndex"],
        },
    ];
};

export const getStyleWebGLDefault: (newStyle?: FeatureTypeStyleItem | undefined) => FlatStyle | FlatStyle[] = (newStyle) => {
    if (newStyle?.logo)
        return {
            "icon-src": newStyle?.logo,
            "icon-size": 34,
            "icon-scale": 1,
        };
    if (newStyle?.type) {
        const style = getRawWellKnownNames(newStyle);
        if (style) return style;
    }

    const hasStrokeColor = newStyle?.strokeColor && newStyle.strokeColor.trim() !== "";
    const hasFillColor = newStyle?.fillColor && newStyle.fillColor.trim() !== "";

    const strokeColor = hasStrokeColor ? hexToRgba(newStyle!.strokeColor, newStyle!.strokeOpacity) : POLYGON_LINE_COLOR;

    const fillColor = hasFillColor ? hexToRgba(newStyle!.fillColor, newStyle!.fillOpacity) : FILL_COLOR;

    return {
        "stroke-color": strokeColor,
        "stroke-width": newStyle ? newStyle.strokeWidth : 1,
        "fill-color": fillColor,
        "shape-stroke-line-cap": newStyle ? newStyle.strokeLinecap : "round",
        "shape-stroke-line-dash": newStyle && newStyle.strokeDashstyle ? strokeLineDash(newStyle) : undefined,
    };
};
export const getConditionsByType = (condition: FeatureTypeCondition | undefined) => {
    return condition?.map((cond) =>
        Object.keys(cond)
            .map((key) => {
                if (typeof cond[key] === "object") {
                    return [
                        key,
                        ...Object.keys(cond[key])
                            .map((nestedKey) => [nestedKey, cond[key][nestedKey]])
                            .flat(),
                    ];
                }
                return [key, cond[key]];
            })
            .flat()
    );
};

export const getConditionedFiltersByType = (cond: FeatureTypeConditionValue[][] | undefined) => {
    const filter: WebGLFilterType = [];

    cond?.forEach((c: FeatureTypeConditionValue[]) => {
        if (c![0] === "$and" || c![0] === "$or") {
            const nc = getConditionedFiltersByType(getConditionsByType(c.splice(2).filter((el) => typeof el === "object") as unknown as FeatureTypeCondition));
            if (nc.length === 1) {
                filter.push(...nc);
            } else if (nc.length > 1) {
                filter.push([c![0] === "$and" ? "all" : "any", ...nc]);
            }
            return;
        }

        const property = c![0] as string;
        let comparator = symbolComparator[c![1] as string];
        let expectedValue = c![2] as FeatureTypeConditionValue;

        if (!comparator) {
            comparator = "==";
            expectedValue = c![1];
        }

        const value = ["get", property];

        if (typeof expectedValue === "boolean") {
            expectedValue = expectedValue ? 1 : 0;
        }

        if (isDateFormat(expectedValue as string)) {
            expectedValue = new Date(expectedValue as string).getTime();
        }

        if (Array.isArray(expectedValue)) {
            if (comparator === "==" || comparator === "in") {
                const orFilters = expectedValue.map((val) => {
                    let processedVal = val;
                    if (typeof val === "boolean") processedVal = val ? 1 : 0;
                    if (isDateFormat(val as string)) processedVal = new Date(val as string).getTime();
                    return ["==", value, processedVal];
                });

                if (orFilters.length === 1) {
                    filter.push(orFilters[0]);
                } else if (orFilters.length > 1) {
                    filter.push(["any", ...orFilters]);
                }
            } else {
                filter.push([comparator, value, expectedValue[0]]);
            }
        } else {
            const additionalValues = c.slice(3);

            if (additionalValues.length > 0) {
                const orFilters = [expectedValue, ...additionalValues].map((val) => {
                    let processedVal = val;
                    if (typeof val === "boolean") processedVal = val ? 1 : 0;
                    if (isDateFormat(val as string)) processedVal = new Date(val as string).getTime();
                    return ["==", value, processedVal];
                });

                if (orFilters.length === 1) {
                    filter.push(orFilters[0]);
                } else if (orFilters.length > 1) {
                    filter.push(["any", ...orFilters]);
                }
            } else {
                filter.push([comparator, value, expectedValue]);
            }
        }
    });

    return filter;
};

export const getFilterStyleByCondition = (newTypes: FeatureTypeStyleItem[]) => {
    const filters: { filter: WebGLFilterType; style: FlatStyle | FlatStyle[] }[] = [];
    const conditions = newTypes?.filter((t, index) => t.condition && newTypes![index]);

    conditions.forEach((type, index) => {
        if (type.condition?.$or) {
            const orCondition = getConditionsByType(type.condition?.$or);
            const conditionedFilters = getConditionedFiltersByType(orCondition);

            if (conditionedFilters.length > 0) {
                const filterExpression: WebGLFilterType =
                    conditionedFilters.length === 1 ? (conditionedFilters[0] as WebGLFilterType) : (["any", ...conditionedFilters] as WebGLFilterType);

                filters.push({
                    filter: filterExpression,
                    style: getStyleWebGLDefault(newTypes![index + 1]),
                });
            }
        }

        if (type.condition?.$and) {
            const andCondition = getConditionsByType(type.condition?.$and);
            const conditionedFilters = getConditionedFiltersByType(andCondition);

            if (conditionedFilters.length > 0) {
                const filterExpression: WebGLFilterType =
                    conditionedFilters.length === 1 ? (conditionedFilters[0] as WebGLFilterType) : (["all", ...conditionedFilters] as WebGLFilterType);

                filters.push({
                    filter: filterExpression,
                    style: getStyleWebGLDefault(newTypes![index + 1]),
                });
            }
        }
    });

    return filters;
};

export const getWebGLStyle = (geoservice: CommunityGeoservice, selectedStyle?: FeatureTypeSelectedStyle[]) => {
    if (!geoservice.styles || geoservice.styles.length === 0) {
        const defaultStyle = featureDefaultStyle(geoservice.featureType);
        geoservice.styles = [defaultStyle];
    }

    const layerStyle = selectedStyle?.find((type) => type.layer === geoservice.layer);
    const newStyle = layerStyle ? layerStyle.selectedStyle : geoservice.styles[0];
    const newTypes = newStyle.types;
    const filterStyleByCondition = getFilterStyleByCondition(newTypes!);
    const isDefault = newStyle.name === DEFAULT_STYLE_NAME;

    let filterSelected = [
        {
            filter: ["all", ["==", ["get", "featureType"], GeoserviceFeatureTypeProp.POINT], ["has", FEATURE_TYPE_SELECTED_PROPERTY]],
            style: getStyleWebGLPoint(isDefault),
        },
    ];

    if (geoservice.featureType === GeoserviceFeatureTypeProp.POLYGON) {
        filterSelected = [
            {
                filter: ["all", ["==", ["get", "featureType"], GeoserviceFeatureTypeProp.POLYGON], ["has", FEATURE_TYPE_SELECTED_PROPERTY]],
                style: getStyleWebGLPolygon(isDefault),
            },
        ];
    }

    if (geoservice.featureType === GeoserviceFeatureTypeProp.LINE) {
        filterSelected = [
            {
                filter: ["all", ["==", ["get", "featureType"], GeoserviceFeatureTypeProp.LINE], ["has", FEATURE_TYPE_SELECTED_PROPERTY]],
                style: getStyleWebGLLine(isDefault),
            },
        ];
    }

    return [
        ...filterStyleByCondition,
        {
            else: true,
            filter: ["!", ["has", FEATURE_TYPE_SELECTED_PROPERTY]],
            style: getStyleWebGLDefault(newTypes![0]),
        },
        ...filterSelected,
    ];
};
