import { Circle as CircleStyle, Fill, Icon, Stroke, Style, Text } from "ol/style";
import { reportImgStatus } from "./utils";
import { Circle, Geometry, LineString, Point } from "ol/geom";
import { Coordinate } from "ol/coordinate";
import { CLUSTER_CIRCLE_COLOR, CLUSTER_REPORT_CIRCLE_COLOR, CLUSTER_REPORT_CIRCLE_STROKE_COLOR, SELECTION_CIRCLE_COLOR, WHITE_COLOR } from "./colors";
import { GeometryFeatueParams } from "./reports/types";
import { Map } from "ol";
import { FeatureLike } from "ol/Feature";

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
        radius: Math.min(size * 1.5, 30),
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

export const strokeStyleCommun = (start: Coordinate, end: number[]) =>
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
