import { Circle as CircleStyle, Fill, Icon, RegularShape, Stroke, Style, Text } from "ol/style";
import { reportImgStatus } from "./utils";
import { Circle, Geometry, LineString, Point } from "ol/geom";
import { Coordinate } from "ol/coordinate";
import { CLUSTER_CIRCLE_COLOR, CLUSTER_REPORT_CIRCLE_COLOR, CLUSTER_REPORT_CIRCLE_STROKE_COLOR, SELECTION_CIRCLE_COLOR, WHITE_COLOR } from "./colors";
import { GeometryFeatueParams } from "./reports/types";
import { Map } from "ol";
import { FeatureLike } from "ol/Feature";
import { CommunityGeoservice, FeatureTypeSelectedStyle, FeatureTypeStyle, FeatureTypeStyleItem, RegularShapeStyleProps } from "./communities/types";
import { FlatStyle } from "ol/style/flat";
import { getRawWellKnownNames } from "./wellKnownNames";
import { symbolComparator } from "./mongo_parser";
import { DEFAULT_STYLE_NAME } from ".";
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

export const hexToRgba = (hex: string, opacity = 1) => {
    if (!hex) return "#fff";
    hex = hex.replace(/^#/, "");

    if (hex.length === 3) {
        hex = hex
            .split("")
            .map((ch) => ch + ch)
            .join("");
    }

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    const alpha = Math.min(1, Math.max(0, Number(opacity)));

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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
            strokeColor: "#fff",
            strokeOpacity: 1,
            strokeWidth: 1,
            title: "point",
            strokeDashstyle: undefined,
            strokeLinecap: undefined,
            fillColor: "#13a7eb",
            fillOpacity: 1,
            zIndex: 2,
        });
    }
    return [
        getCircleStyle({
            pointRadius: 8,
            strokeColor: "#13a7eb",
            strokeOpacity: 1,
            strokeWidth: 2,
            title: "point",
            strokeDashstyle: undefined,
            strokeLinecap: undefined,
            fillColor: "#fafa00",
            fillOpacity: 1,
            zIndex: 2,
        }),
        getCircleStyle({
            pointRadius: 3,
            strokeColor: "#13a7eb",
            strokeOpacity: 1,
            strokeWidth: 2,
            title: "point",
            strokeDashstyle: undefined,
            strokeLinecap: undefined,
            fillColor: "#fafa00",
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
            strokeColor: isDefaultStyle ? "#fff" : "#13a7eb",
            strokeOpacity: 1,
            strokeWidth: 7,
            title: "line",
            strokeDashstyle: undefined,
            strokeLinecap: "round",
            zIndex: 2,
        }),
        getLineOrPolygonStyle({
            pointRadius: 6,
            fillColor: "",
            fillOpacity: 1,
            strokeColor: isDefaultStyle ? "#13a7eb" : "#fafa00",
            strokeOpacity: 1,
            strokeWidth: 4,
            title: "line",
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
            fillColor: isDefaultStyle ? "#fff" : "#c89c4a",
            fillOpacity: isDefaultStyle ? 0.2 : 0.8,
            strokeColor: isDefaultStyle ? "#fff" : "#13a7eb",
            strokeOpacity: 1,
            strokeWidth: 4,
            title: "polygon",
            strokeDashstyle: "",
            strokeLinecap: "butt",
            zIndex: 2,
        }),
        getLineOrPolygonStyle({
            pointRadius: 0,
            fillColor: isDefaultStyle ? "#fff" : "#fafa00",
            fillOpacity: 0.2,
            strokeColor: isDefaultStyle ? "#13a7eb" : "#fafa00",
            strokeOpacity: 1,
            strokeWidth: 2,
            title: "polygon",
            strokeDashstyle: "",
            strokeLinecap: "butt",
            zIndex: 2,
        }),
    ];
};

export const featureDefaultStyle = (type: string = "point"): FeatureTypeStyle => {
    return {
        name: DEFAULT_STYLE_NAME,
        types: [
            {
                title: "Par défaut",
                type: type === "point" ? "circle" : type,
                featureType: type,
                pointRadius: 6,
                fillColor: "#ee9900",
                fillOpacity: 0.4,
                strokeColor: "#ee9900",
                strokeWidth: 2,
                strokeDashstyle: undefined,
                strokeLinecap: undefined,
                strokeOpacity: 1,
            },
        ],
    };
};

export const getSelectedFeatureTypeStyle = (type: string, style: FeatureTypeStyle) => {
    const isDefaultStyle = style.name === featureDefaultStyle().name;
    if (type === "point") return featureTypeSelectedPointCircleStyle(isDefaultStyle);
    if (type === "line") return featureTypeSelectedLineStyle(isDefaultStyle);
    if (type === "polygon") return featureTypeSelectedPolygonStyle(isDefaultStyle);
};

export const getStyleWebGLPolygon: (isDefault: boolean) => FlatStyle[] = (isDefault: boolean = false): FlatStyle[] => {
    return [
        {
            "stroke-color": hexToRgba(isDefault ? "#fff" : "#13a7eb", 1),
            "stroke-width": 2,
            "fill-color": hexToRgba(isDefault ? "#fff" : "#ee9900", 0.4),
        },
        {
            "stroke-color": hexToRgba(isDefault ? "#fff" : "#13a7eb", 1),
            "stroke-width": 6,
        },
        {
            "stroke-color": hexToRgba(isDefault ? "#13a7eb" : "#fafa00", 1),
            "stroke-width": 3,
        },
    ];
};

export const getStyleWebGLLine: (isDefault: boolean) => FlatStyle[] = (isDefault: boolean = false): FlatStyle[] => {
    return [
        {
            "stroke-color": hexToRgba(isDefault ? "#fff" : "#13a7eb", 1),
            "stroke-width": 7,
            "stroke-line-cap": "round",
        },
        {
            "stroke-color": hexToRgba(isDefault ? "#13a7eb" : "#fafa00", 1),
            "stroke-width": 4,
            "stroke-line-cap": "round",
        },
    ];
};

export const getStyleWebGLPoint: (isDefault: boolean) => FlatStyle | FlatStyle[] = (isDefault: boolean = false): FlatStyle | FlatStyle[] => {
    if (isDefault) {
        return {
            "circle-radius": 6,
            "circle-stroke-color": hexToRgba("#fff", 1),
            "circle-stroke-width": 2,
            "circle-fill-color": hexToRgba("#13a7eb", 1),
            "z-index": ["get", "zIndex"],
        };
    }
    return [
        {
            "circle-radius": 8,
            "circle-stroke-color": hexToRgba("#13a7eb", 1),
            "circle-stroke-width": 2,
            "circle-fill-color": hexToRgba("#fafa00", 1),
            "z-index": ["get", "zIndex"],
        },
        {
            "circle-radius": 3.5,
            "circle-stroke-color": hexToRgba("#13a7eb", 1),
            "circle-stroke-width": 2,
            "circle-fill-color": hexToRgba("#c89c4a", 1),
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

    return {
        "stroke-color": newStyle ? hexToRgba(newStyle.strokeColor, newStyle.strokeOpacity) : "#fff",
        "stroke-width": newStyle ? newStyle.strokeWidth : 1,
        "fill-color": newStyle ? hexToRgba(newStyle.fillColor, newStyle.fillOpacity) : "#fff",
        "shape-stroke-line-cap": newStyle ? newStyle.strokeLinecap : "round",
        "shape-stroke-line-dash": newStyle && newStyle.strokeDashstyle ? strokeLineDash(newStyle) : undefined,
    };
};

export const getFilterStyleByCondition = (newTypes: FeatureTypeStyleItem[]) => {
    const conditions = newTypes
        ?.filter((t, index) => t.condition && newTypes![index])
        .map((type) => {
            return type.condition?.$and.map((cond) =>
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
        });
    const filters = conditions?.map((cond, index) => {
        const filter: (string | number | number[] | string[])[][] = [];
        let property: string = "";
        cond?.forEach((c) => {
            let comparator = symbolComparator[c![1] as string];
            if (!comparator) comparator = "==";
            property = c![0] as string;
            const value = ["get", property];
            let expectedValue = c![2] as number | string | string[] | number[];
            if (!expectedValue) expectedValue = c![1];
            if (typeof expectedValue === "boolean") {
                expectedValue = expectedValue ? 1 : 0;
            }
            if (isDateFormat(expectedValue as string)) expectedValue = new Date(expectedValue as string).getTime();
            filter.push(Array.isArray(expectedValue) ? [comparator, value, ...expectedValue] : [comparator, value, expectedValue]);
        });

        return {
            filter: ["all", ["!", ["has", "selected"]], ["has", property], ...filter],
            style: getStyleWebGLDefault(newTypes![index + 1]),
        };
    });
    return filters ?? [];
};

export const getWebGLStyle = (geoservice: CommunityGeoservice, selectedStyle?: FeatureTypeSelectedStyle[]) => {
    const layerStyle = selectedStyle?.find((type) => type.layer === geoservice.layer);
    const newStyle = layerStyle ? layerStyle.selectedStyle : geoservice.styles![0];
    const newTypes = newStyle.types;
    const filterStyleByCondition = getFilterStyleByCondition(newTypes!);
    const isDefault = newStyle.name === DEFAULT_STYLE_NAME;
    let filterSelected = [
        {
            filter: ["all", ["==", ["get", "featureType"], "point"], ["has", "selected"]],
            style: getStyleWebGLPoint(isDefault),
        },
    ];
    if (geoservice.featureType === "polygon") {
        filterSelected = [
            {
                filter: ["all", ["==", ["get", "featureType"], "polygon"], ["has", "selected"]],
                style: getStyleWebGLPolygon(isDefault),
            },
        ];
    }
    if (geoservice.featureType === "line") {
        filterSelected = [
            {
                filter: ["all", ["==", ["get", "featureType"], "line"], ["has", "selected"]],
                style: getStyleWebGLLine(isDefault),
            },
        ];
    }
    return [
        ...filterStyleByCondition,
        {
            else: true,
            filter: ["!", ["has", "selected"]],
            style: getStyleWebGLDefault(newTypes![0]),
        },
        ...filterSelected,
    ];
};
