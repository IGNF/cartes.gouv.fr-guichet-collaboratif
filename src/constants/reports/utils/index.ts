import { ClickedMapReportProps, CommunityReport, GeometryFeatueParams, SketchFeatureType, SketchObject, SketchReport } from "../types";
import { Feature, Map } from "ol";
import { Coordinate } from "ol/coordinate";
import {
    getFeatureDiam,
    getFeatureGeometryWKT,
    getFeatureLine,
    getFeatureMultiLine,
    getFeaturePoint,
    getFeaturePolygon,
    getSketchFeatureType,
    markersStyles,
} from "../../utils";
import ImageStyle from "ol/style/Image";
import KML from "ol/format/KML";
import GPX from "ol/format/GPX";
import GeoJSON from "ol/format/GeoJSON";
import VectorSource from "ol/source/Vector";
import { Style } from "ol/style";
import { getClickedReport, showClusterFeatures } from "./cluster";

export const REPORTS_LAYER_TYPE = "reports";

export const getReportSketch = (features: Feature[], map: Map, edit: boolean = false): SketchReport => {
    const mainFeature = features.find((f) => {
        if (edit) return f.get("main");
        return f.getGeometry()?.getType() === "Point";
    });
    const mainGeometry = mainFeature?.getGeometry() as GeometryFeatueParams;
    const mainCoordinates = mainGeometry?.getCoordinates() as Coordinate;
    const newFeatures = features.filter((f) => f !== mainFeature);
    return {
        name: "GeoCroquis Collaboratif",
        desc: "export espace collaboratif",
        objects: newFeatures.map((feature) => {
            const featureStyle = feature.getStyle() as Style;

            const sketch: SketchObject = {
                type: getSketchFeatureType(feature) as SketchFeatureType,
                geometry: getFeatureGeometryWKT(feature),
            };

            if (featureStyle) {
                const featureImage = ("getImage" in featureStyle && (featureStyle?.getImage() as ImageStyle & { getSrc: () => string })) || null;
                const markerStyle = markersStyles.find((m) => m.imgSrc === featureImage?.getSrc());
                const featureText = "getText" in featureStyle && featureStyle?.getText();

                sketch.style = {
                    backcolor: "getFill" in featureStyle ? (featureStyle?.getFill()?.getColor() as string) : "",
                    diam: getFeatureDiam(feature),
                    frontcolor: "getStroke" in featureStyle ? (featureStyle.getStroke()?.getColor() as string) : "",
                };

                if (featureText) {
                    sketch.attributes = {
                        nom: featureText?.getText() ?? "",
                    };
                }

                if (markerStyle) {
                    sketch.attributes = {
                        nature: markerStyle.name,
                    };
                }
            }

            return sketch;
        }),
        contexte: {
            lat: mainCoordinates![0] ?? "0",
            lon: mainCoordinates![1],
            zoom: map?.getView().getZoom() ?? 10,
        },
    };
};

export const getReportSketchFeatures = (report: CommunityReport | undefined) => {
    if (!report?.sketch) return [];
    return report.sketch.objects.map((featData) => {
        if (featData.type === SketchFeatureType.MultiLineString) {
            return getFeatureMultiLine(report, featData);
        }
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
        type: SketchFeatureType.Point,
        geometry: report.geometry,
    };
    let allFeatures: Feature[] = [getFeaturePoint(report, mainFeatData, true)];
    if (report.sketch) {
        const sketchFeatures = getReportSketchFeatures(report);
        if (sketchFeatures) allFeatures = [...allFeatures, ...sketchFeatures];
    }
    return allFeatures.flat();
};

export const verifyFileTypeFromContent = (content: string) => {
    if (content.includes("<kml")) return "KML";
    if (content.includes("<gpx")) return "GPX";
    try {
        const json = JSON.parse(content);
        if (json.type && json.features) return "GeoJSON";
    } catch {
        throw Error();
    }
    throw Error();
};

export const readImportedFile = (file: File, drawingSource: VectorSource) => {
    const reader = new FileReader();
    reader.onload = function (event: ProgressEvent<FileReader>) {
        let content = event.target?.result || "";
        if (content instanceof ArrayBuffer) {
            content = new TextDecoder().decode(content);
        }
        const fileType = verifyFileTypeFromContent(content as string);
        switch (fileType) {
            case "KML":
                createSketchKML(content, drawingSource);
                break;
            case "GPX":
                createSketchGPX(content, drawingSource);
                break;
            case "GeoJSON":
                createSketchGEOJSON(content, drawingSource);
                break;
            default:
                break;
        }
    };
    reader.readAsText(file);
};

const setFeatureStyleKML = (feature: Feature) => {
    const fStyle = feature.getStyle();
    if (typeof fStyle === "function") {
        let newStyle = fStyle(feature, 1) as Style | Style[];
        if (Array.isArray(newStyle)) newStyle = newStyle[0];
        const color = newStyle.getStroke()?.getColor();
        if (Array.isArray(color)) newStyle.getStroke()?.setColor(`rgb(${color.join(",")})`);
        feature.setStyle(newStyle);
    }
};

export const createSketchKML = (content: string, drawingSource: VectorSource) => {
    try {
        const features = new KML().readFeatures(content, { dataProjection: "EPSG:4326", featureProjection: "EPSG:3857" });
        features.forEach((feature) => {
            setFeatureStyleKML(feature);
        });
        drawingSource.addFeatures(features);
    } catch {
        throw Error();
    }
};

export const createSketchGPX = (content: string, drawingSource: VectorSource) => {
    try {
        const features = new GPX().readFeatures(content, { dataProjection: "EPSG:4326", featureProjection: "EPSG:3857" });
        drawingSource.addFeatures(features);
    } catch {
        throw Error();
    }
};
export const createSketchGEOJSON = (content: string, drawingSource: VectorSource) => {
    try {
        const features = new GeoJSON().readFeatures(content, { dataProjection: "EPSG:4326", featureProjection: "EPSG:3857" });
        drawingSource.addFeatures(features);
    } catch {
        throw Error();
    }
};

export const REPORT_TABLE_LIMIT_OPTIONS = [2, 5, 10, 15, 20, 30];

export const getClickedMapReport = ({ feature, map, pixel, clusterSource, features, handleCloseDrawer }: ClickedMapReportProps) => {
    let clickedFeature;
    const currentFeature = feature as Feature;
    const currentFeatures = currentFeature.get("features");
    if (currentFeatures?.length === 1) {
        clickedFeature = currentFeatures[0];
    } else {
        if (Array.isArray(currentFeature.getStyle())) {
            clickedFeature = getClickedReport(currentFeature, pixel, map);
        }
    }
    if (!clickedFeature) {
        showClusterFeatures(currentFeature, map.getView().getResolution(), clusterSource);
        handleCloseDrawer();
        return;
    }
    const currentFeatureStyle = clickedFeature.getStyle() as Style;
    const currentZIndex = currentFeatureStyle && "getStyle" in currentFeatureStyle ? (currentFeatureStyle?.getZIndex() ?? 1) : 1;
    if (clickedFeature.get("new") && clickedFeature.get("main")) {
        features.push({
            feature: clickedFeature,
            zIndex: currentZIndex,
        });
        return;
    }
    if (clickedFeature.get("reportData") && clickedFeature.get("main")) {
        features.push({
            feature: clickedFeature,
            zIndex: currentZIndex,
        });
        return;
    }
};
