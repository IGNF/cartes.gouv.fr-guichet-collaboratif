import imgSubmit from "../img/reports/punaise_submit.png";
import imgPending from "../img/reports/punaise_pending.png";
import imgValid from "../img/reports/punaise_valid.png";
import imgReject from "../img/reports/punaise_reject.png";
import imgTest from "../img/reports/punaise_test.png";
import { fromLonLat } from "ol/proj";
import { CommunityTheme } from "./communities/types";
import Feature from "ol/Feature";
import { Map } from "ol";
import { CommunityReport, GeometryFeatueParams, PostThemeReport, SketchFeatureType, SketchObject, SketchType } from "./reports/types";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import { Geometry, LineString, Point, Polygon } from "ol/geom";
import Layer from "ol/layer/Layer";
import VectorSource from "ol/source/Vector";
import WKT from "ol/format/WKT";
import { Coordinate } from "ol/coordinate";

const wktFormat = new WKT();
export const reportImgStatus = {
    submit: { img: imgSubmit, text: "Reçu dans nos services" },
    pending: { img: imgPending, text: "En cours de traitement" },
    valid: { img: imgValid, text: "Pris en compte" },
    reject: { img: imgReject, text: "Rejeté (hors spéc.)" },
    test: { img: imgTest, text: "En mode test" },
};

export const getLonLatFromPoint = (point: string | undefined) => {
    if (!point) return [];
    const wktGeometry = wktFormat.readGeometry(point) as GeometryFeatueParams;
    const coordinates = wktGeometry?.getCoordinates() as Coordinate;
    return fromLonLat(coordinates);
};

export const getLonLatFromLine = (sketchObject: SketchObject) => {
    if (!sketchObject) return [];
    const wktGeometry = wktFormat.readGeometry(sketchObject.geometry) as GeometryFeatueParams;
    const coordinates = wktGeometry?.getCoordinates() as Coordinate[];
    return coordinates?.map((line) => fromLonLat(line));
};

export const getLonLatFromPolygon = (sketchObject: SketchObject) => {
    if (!sketchObject) return [];
    const wktGeometry = wktFormat.readGeometry(sketchObject.geometry) as GeometryFeatueParams;
    const coordinates = wktGeometry?.getCoordinates() as Coordinate[][];
    return coordinates?.map((ring) => ring?.map((coord) => fromLonLat(coord)));
};

export const refreshReportLayer = (map: Map | null) => {
    if (!map) return;
    const mapCurrentLayers = map?.getAllLayers();
    const reportLayer = mapCurrentLayers?.find((l) => l.get("title") === "Signalements");
    if (reportLayer) {
        reportLayer.getSource()?.refresh();
    }
};

export const clearDrawingLayer = (map: Map | null) => {
    if (!map) return;
    const mapCurrentLayers = map?.getAllLayers();
    const drawingLayer = mapCurrentLayers.find((layer: Layer & { gpResultLayerId?: string }) => layer.gpResultLayerId === "drawing");
    const drawingSource = drawingLayer?.getSource() as VectorSource;
    if (drawingSource) {
        drawingSource.clear();
    }
};

export const getThemeAttributes = (theme: CommunityTheme) => {
    return Array.isArray(theme?.attributes)
        ? theme?.attributes.reduce((acc: PostThemeReport, attribute) => {
              acc[attribute.name] = attribute.default;
              return acc;
          }, {})
        : theme?.attributes || {};
};

export const getFeatureGeometryWKT = (feature: Feature) => {
    const geom4326 = feature.getGeometry()?.clone().transform("EPSG:3857", "EPSG:4326") as Geometry;
    return wktFormat.writeGeometry(geom4326);
};

export const getSketchFeatureType = (feature: Feature): SketchType => {
    const featureType = feature.getGeometry()?.getType();

    if (featureType === "LineString") return SketchFeatureType.LineString;
    if (featureType === "Polygon") return SketchFeatureType.Polygon;
    return SketchFeatureType.Point;
};

export const getFeatureDiam = (feature: Feature) => {
    const featureStyle = feature.getStyle() as Style;
    const featureText = "getText" in featureStyle && featureStyle?.getText();
    const featureType = feature.getGeometry()?.getType();
    let diam = featureStyle.getStroke()?.getWidth() ?? 1;
    if (featureType === "Point") {
        if (featureText) {
            diam = featureText.getStroke()?.getWidth() ?? 1;
        } else {
            const scale = featureStyle.getImage()?.getScale() ?? 0.5;
            diam = Array.isArray(scale) ? (scale[0] + scale[1]) / 2 : scale;
        }
    }
    return diam;
};

export const getFeaturePoint = (report: CommunityReport, featData: SketchObject, main: boolean = false) => {
    const lonLat = getLonLatFromPoint(featData.geometry);
    const feature = new Feature({
        geometry: new Point(lonLat),
        reportData: report,
        main: main,
    });

    if (featData.attributes) {
        feature.setStyle(
            new Style({
                text: new Text({
                    offsetY: -15,
                    fill: new Fill({ color: featData.style?.backcolor }),
                    text: featData.attributes.nom,
                    font: "16px sans",
                    stroke: new Stroke({
                        width: featData.style?.diam,
                        color: featData.style?.frontcolor,
                    }),
                }),
                zIndex: 1,
            })
        );
    } else {
        feature.setStyle(
            new Style({
                image: new Icon({
                    src: reportImgStatus[report.status].img,
                    scale: 0.5,
                }),
                zIndex: 1,
            })
        );
    }

    return feature;
};

export const getFeaturePolygon = (report: CommunityReport, featData: SketchObject) => {
    const lonLat = getLonLatFromPolygon(featData);
    const feature = new Feature({
        geometry: new Polygon(lonLat),
        reportData: report,
    });
    feature.setStyle(
        new Style({
            stroke: new Stroke({
                color: featData.style?.frontcolor,
                width: featData.style?.diam,
            }),
            fill: new Fill({
                color: featData.style?.backcolor,
            }),
            zIndex: 1,
        })
    );
    return feature;
};

export const getFeatureLine = (report: CommunityReport, featData: SketchObject) => {
    const lonLat = getLonLatFromLine(featData);
    const feature = new Feature({
        geometry: new LineString(lonLat),
        reportData: report,
    });
    feature.setStyle(
        new Style({
            stroke: new Stroke({
                color: featData.style?.frontcolor,
                width: featData.style?.diam,
            }),
            zIndex: 1,
        })
    );
    return feature;
};
