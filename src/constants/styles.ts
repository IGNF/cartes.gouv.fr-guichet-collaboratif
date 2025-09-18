import { Circle as CircleStyle, Fill, Icon, RegularShape, Stroke, Style, Text } from "ol/style";
import { reportImgStatus } from "./utils";
import { Circle, Geometry, LineString, Point } from "ol/geom";
import { Coordinate } from "ol/coordinate";
import { CLUSTER_CIRCLE_COLOR, CLUSTER_REPORT_CIRCLE_COLOR, CLUSTER_REPORT_CIRCLE_STROKE_COLOR, SELECTION_CIRCLE_COLOR, WHITE_COLOR } from "./colors";
import { GeometryFeatueParams } from "./reports/types";
import { Map } from "ol";
import { FeatureLike } from "ol/Feature";
import { FeatureTypeStyle, FeatureTypeStyleItem, RegularShapeStyleProps } from "./communities/types";

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

export const clusterReportPinStyle = (geometry: Geometry | undefined = undefined) =>
    new Style({
        geometry,
        image: new Icon({
            src: reportImgStatus.submit.img,
            scale: 1,
            anchor: [0.5, 1],
        }),
        zIndex: 3,
    });

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
        name: "par_defaut",
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
