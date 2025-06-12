import imgSubmit from "../img/reports/punaise_submit.png";
import imgPending from "../img/reports/punaise_pending.png";
import imgValid from "../img/reports/punaise_valid.png";
import imgReject from "../img/reports/punaise_reject.png";
import imgTest from "../img/reports/punaise_test.png";
import { fromLonLat, toLonLat } from "ol/proj";
import { CommunityTheme } from "./communities/types";
import Feature from "ol/Feature";
import { Map } from "ol";
import {
    CommunityReport,
    GeometryFeatueParams,
    GeometryType,
    PostThemeReport,
    SketchFeatureType,
    SketchObject,
    SketchReport,
    SketchType,
} from "./reports/types";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import { LineString, Point, Polygon } from "ol/geom";
import Layer from "ol/layer/Layer";
import VectorSource from "ol/source/Vector";

export const reportImgStatus = {
    submit: { img: imgSubmit, text: "Reçu dans nos services" },
    pending: { img: imgPending, text: "En cours de traitement" },
    valid: { img: imgValid, text: "Pris en compte" },
    reject: { img: imgReject, text: "Rejeté (hors spéc.)" },
    test: { img: imgTest, text: "En mode test" },
};

export const getLonLatFromPoint = (point: GeometryType | undefined) => {
    if (!point) return [];
    const lonLat = point.replace("POINT(", "").replace(")", "").split(" ").map(Number);
    return fromLonLat(lonLat);
};

export const getLonLatFromLine = (sketchObject: SketchObject) => {
    if (!sketchObject) return [];
    const lonLat = sketchObject.geometry
        .replace("LINESTRING(", "")
        .replace(")", "")
        .split(",")
        .map((line) => fromLonLat(line.split(" ").map(Number)));
    return lonLat;
};

export const getLonLatFromPolygon = (sketchObject: SketchObject) => {
    if (!sketchObject) return [];
    const lonLat = sketchObject.geometry
        .replace("MULTIPOLYGON(((", "")
        .replace(")))", "")
        .split(",")
        .map((line) => fromLonLat(line.split(" ").map(Number)));
    return lonLat;
};

function extractPairs(arr: number[]): number[][] {
    const result: number[][] = [];

    function recurse(sub: number[]) {
        for (const item of sub) {
            if (Array.isArray(item)) {
                if (item.length === 2 && !item.some(Array.isArray)) {
                    // If it's a 2-element array with no nested arrays inside
                    result.push(item as number[]);
                } else {
                    recurse(item); // Continue recursion
                }
            }
        }
    }

    recurse(arr);
    return result;
}

export const getLonLatFromFeature = (feature: Feature | undefined): number[] | string[] => {
    if (!feature) return [0, 0];
    const geometry: GeometryFeatueParams = feature.getGeometry() as GeometryFeatueParams;
    if (!geometry) return [0, 0];
    if (geometry.getType() !== SketchFeatureType.Point) {
        const coordinates = extractPairs(geometry?.getCoordinates()).map((geom: number[]) => {
            return toLonLat(geom).join(" ");
        });
        return coordinates;
    }
    return toLonLat(geometry?.getCoordinates());
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

export const getFeatureSketchGeometry = (feature: Feature) => {
    const featureType = feature.getGeometry()?.getType();

    if (featureType === "LineString") return `LINESTRING(${getLonLatFromFeature(feature)?.join(",")})`;
    if (featureType === "Polygon") return `MULTIPOLYGON(((${getLonLatFromFeature(feature)?.join(",")})))`;
    return `POINT(${getLonLatFromFeature(feature)?.join(" ")})`;
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

export const getReportSketch = (features: Feature[], map: Map, edit: boolean = false): SketchReport => {
    const mainPointFeature = features.find((f) => {
        if (edit) return f.get("main");
        return f.getGeometry()?.getType() === "Point";
    });
    const newFeatures = features.filter((f) => f !== mainPointFeature);
    return {
        name: "GeoCroquis Collaboratif",
        desc: "export espace collaboratif",
        objects: newFeatures.map((feature) => {
            const featureStyle = feature.getStyle() as Style;
            const featureText = "getText" in featureStyle && featureStyle?.getText();

            if (featureText) {
                return {
                    type: getSketchFeatureType(feature) as SketchType,
                    geometry: getFeatureSketchGeometry(feature) as GeometryType,
                    style: {
                        backcolor: (featureText?.getFill()?.getColor() as string) ?? "",
                        diam: getFeatureDiam(feature),
                        frontcolor: (featureText.getStroke()?.getColor() as string) ?? "",
                    },
                    attributes: {
                        nom: featureText?.getText() ?? "",
                    },
                };
            }

            return {
                type: getSketchFeatureType(feature) as SketchType,
                geometry: getFeatureSketchGeometry(feature) as GeometryType,
                style: {
                    backcolor: (featureStyle?.getFill()?.getColor() as string) ?? "",
                    diam: getFeatureDiam(feature),
                    frontcolor: (featureStyle.getStroke()?.getColor() as string) ?? "",
                },
            };
        }),
        contexte: {
            lat: getLonLatFromFeature(mainPointFeature)![0] ?? "0",
            lon: getLonLatFromFeature(mainPointFeature)![1],
            zoom: map?.getView().getZoom() ?? 10,
        },
    };
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
        geometry: new Polygon([lonLat]),
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

export const getReportSketchFeatures = (report: CommunityReport | undefined) => {
    if (!report?.sketch) return [];
    return report.sketch.objects.map((featData) => {
        if (featData.type === SketchFeatureType.LineString) {
            return getFeatureLine(report, featData);
        }
        if (featData.type === SketchFeatureType.Polygon) {
            return getFeaturePolygon(report, featData);
        }
        return getFeaturePoint(report, featData);
    });
};

export const getReportAllFeatures = (report: CommunityReport) => {
    const mainFeatData = {
        type: "Point" as SketchType,
        geometry: report.geometry,
    };
    let allFeatures: Feature[] = [getFeaturePoint(report, mainFeatData, true)];
    if (report.sketch) {
        const sketchFeatures = getReportSketchFeatures(report);
        if (sketchFeatures) allFeatures = [...allFeatures, ...sketchFeatures];
    }
    return allFeatures.flat();
};
