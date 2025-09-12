import { Circle as CircleStyle, Fill, Icon, RegularShape, Stroke, Style, Text } from "ol/style";
import { reportImgStatus } from "./utils";
import { Circle, Geometry, LineString, Point } from "ol/geom";
import { Coordinate } from "ol/coordinate";
import { CLUSTER_CIRCLE_COLOR, CLUSTER_REPORT_CIRCLE_COLOR, CLUSTER_REPORT_CIRCLE_STROKE_COLOR, SELECTION_CIRCLE_COLOR, WHITE_COLOR } from "./colors";
import { GeometryFeatueParams } from "./reports/types";
import { Map } from "ol";
import { FeatureLike } from "ol/Feature";
import { FeatureTypeStyleItem, RegularShapeStyleProps } from "./communities/types";

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

export const strokeLineDash = function ({ strokeWidth, strokeDashstyle }: { strokeWidth: number; strokeDashstyle: string }) {
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
    hex = hex.replace("#", "");

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
        zIndex: 1,
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
    });
};
