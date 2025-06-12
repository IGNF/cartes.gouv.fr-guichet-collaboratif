import { CommunityReport, GeometryFeatueParams, ReportTool, SketchFeatureType, SketchReport, SketchType, toolNames } from "./types";
import CreateLabelImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/create-label.svg";
import CreateLineImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/create-line.svg";
import CreatePointImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/create-point.svg";
import CreatePolygonImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/create-polygon.svg";
import DeleteImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/delete.svg";
import EditGeomImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/edit-geom.svg";
import EditStyleImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/edit-style.svg";
import EditTextImg from "geopf-extensions-openlayers/src/packages/CSS/Controls/Drawing/img/dsfr/edit-text.svg";
import { Feature, Map } from "ol";
import { Coordinate } from "ol/coordinate";
import { Style } from "ol/style";
import { getFeatureDiam, getFeatureGeometryWKT, getFeatureLine, getFeaturePoint, getFeaturePolygon, getSketchFeatureType } from "../utils";

export const reportTools: ReportTool[] = [
    { type: "create", name: toolNames.point, imgSrc: CreatePointImg, order: 0, title: "Créer un signalement", featureType: "Point" },
    { type: "create", name: toolNames.line, imgSrc: CreateLineImg, order: 1, title: "Dessiner des lignes", featureType: "LineString" },
    { type: "create", name: toolNames.polygon, imgSrc: CreatePolygonImg, order: 2, title: "Dessiner des polygones", featureType: "Polygon" },
    { type: "create", name: toolNames.text, imgSrc: CreateLabelImg, order: 3, title: "Ecrire sur la carte", featureType: "Write" },
    { type: "edit", name: toolNames.edit, imgSrc: EditGeomImg, order: 0, title: "Editer les georèmes" },
    { type: "edit", name: toolNames.display, imgSrc: EditStyleImg, order: 1, title: "Editer le style" },
    { type: "edit", name: toolNames.tooltip, imgSrc: EditTextImg, order: 2, title: "Editer le texte" },
    { type: "edit", name: toolNames.remove, imgSrc: DeleteImg, order: 3, title: "Supprimer des objets" },
];

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
            const featureText = "getText" in featureStyle && featureStyle?.getText();

            if (featureText) {
                return {
                    type: getSketchFeatureType(feature) as SketchType,
                    geometry: getFeatureGeometryWKT(feature),
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
                geometry: getFeatureGeometryWKT(feature),
                style: {
                    backcolor: (featureStyle?.getFill()?.getColor() as string) ?? "",
                    diam: getFeatureDiam(feature),
                    frontcolor: (featureStyle.getStroke()?.getColor() as string) ?? "",
                },
            };
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
