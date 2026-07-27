import imgSubmit from "../img/reports/punaise_submit.png";
import imgPending from "../img/reports/punaise_pending.png";
import imgValid from "../img/reports/punaise_valid.png";
import imgReject from "../img/reports/punaise_reject.png";
import imgTest from "../img/reports/punaise_test.png";
import { fromLonLat } from "ol/proj";
import { AlertMessageType, CommunityGeoservice, CommunityTheme, FeatureTypeSelectedStyle, FeatureTypeStyle } from "./communities/types";
import Feature from "ol/Feature";
import { Map } from "ol";
import { CommunityReport, GeometryFeatueParams, PostThemeReport, SketchFeatureType, SketchObject, Severity } from "./reports/types";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import { Geometry, LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from "ol/geom";
import Layer from "ol/layer/Layer";
import VectorSource from "ol/source/Vector";
import WKT from "ol/format/WKT";
import { Coordinate } from "ol/coordinate";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { LocalLayer, LocalStorageData } from "./localStorage/types";
import { ComponentKey } from "@/i18n/types";
import createStarImg from "../img/reports/markerslist/star.png";
import createCircleImg from "../img/reports/markerslist/circle.png";
import createSquareImg from "../img/reports/markerslist/square.png";
import createCrossImg from "../img/reports/markerslist/cross.png";
import createXImg from "../img/reports/markerslist/x.png";
import createTriangleImg from "../img/reports/markerslist/triangle.png";
import createPointImg from "../img/reports/create_point.png";
import { createEmpty, extend, Extent, getCenter, isEmpty } from "ol/extent";
import React from "react";
import { getReportSketchFeatures, REPORTS_LAYER_TYPE } from "./reports/utils";
import { ComparatorFunc, simpleComparators } from "./mongo_parser";
import getWellKnownNames from "./wellKnownNames";
import addProjectionsToProj4 from "./projectionsToDefine";
import { FEATURE_TYPE_DATA_PROPERTY } from ".";
import { POLYGON_LINE_COLOR, FILL_COLOR, POINT_COLOR } from "./colors";

const wktFormat = new WKT();
addProjectionsToProj4();

export const parseApiColor = (color: string | undefined, fallback: string): string => {
    if (!color) return fallback;
    const match = color.match(/^(#[0-9a-fA-F]{3,8});?(\d*\.?\d+)?$/);
    if (!match) return color;
    const hex = match[1];
    const alpha = match[2] !== undefined ? parseFloat(match[2]) : 1;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
};

export const markersStyles = [
    { name: "circle", imgSrc: createCircleImg },
    { name: "square", imgSrc: createSquareImg },
    { name: "triangle", imgSrc: createTriangleImg },
    { name: "cross", imgSrc: createCrossImg },
    { name: "x", imgSrc: createXImg },
    { name: "star", imgSrc: createStarImg },
];
export const mainMarker = {
    src: createPointImg,
    anchor: [0.5, 0.5],
    scale: 1,
    preload: true,
};

export const otherMarkers = markersStyles.map((style) => {
    return {
        src: style.imgSrc,
        anchor: [0.5, 0.5],
        scale: 0.5,
        preload: true,
    };
});

type ReportImgStatusType = {
    [key: string]: { img: string; text: string; colorType: Severity };
};

export const reportImgStatus: ReportImgStatusType = {
    submit: { img: imgSubmit, text: "Reçu dans nos services", colorType: "info" },
    pending: { img: imgPending, text: "En cours de traitement", colorType: "new" },
    pending0: { img: imgPending, text: "En demande de qualification", colorType: "new" },
    pending1: { img: imgPending, text: "En attente de saisie", colorType: "new" },
    pending2: { img: imgPending, text: "En attente de validation", colorType: "info" },
    valid: { img: imgValid, text: "Pris en compte", colorType: "success" },
    valid0: { img: imgValid, text: "Déjà pris en compte", colorType: "success" },
    reject: { img: imgReject, text: "Rejeté (hors spéc.)", colorType: "warning" },
    reject0: { img: imgReject, text: "Rejeté (hors de propos)", colorType: "warning" },
    test: { img: imgTest, text: "En mode test", colorType: "new" },
};

export const STATUS_NOT_ALLOWED = ["valid", "valid0", "reject", "reject0", "test"];

export const getStatusSeverity = (status: string): Severity => reportImgStatus[status]?.colorType ?? "info";
type LonLatCoordinate = Coordinate | Coordinate[] | Coordinate[][] | Coordinate[][][];
type FeatureTypeData = { geometrie: string; capacite: number | null; type_amenagement: string | null };

export const featureExists = (newFeature: Feature, source: VectorSource) => {
    const newWkt = wktFormat.writeFeature(newFeature);
    return source.getFeatures().some((f: Feature) => {
        return wktFormat.writeFeature(f) === newWkt;
    });
};

const applyStylePoint = (features: Feature[], newStyle: FeatureTypeStyle) => {
    const condition = newStyle.types![1]?.condition;
    let conditions;
    if (condition!["$and"]) conditions = condition!["$and"]![0];
    if (condition!["$or"]) conditions = condition!["$or"]![0];
    const conditionKey = conditions ? Object.keys(conditions)[0] : "";
    const condExpression = conditions![conditionKey];
    const condExpKey = condExpression ? (Object.keys(condExpression)[0] as string) : "";
    const comparisonFunc = simpleComparators[condExpKey as keyof typeof simpleComparators] as ComparatorFunc;
    features?.forEach((feat) => {
        const newDefaultStyleType = newStyle.types![0];
        if (newDefaultStyleType.logo) {
            feat.setStyle(
                new Style({
                    image: new Icon({
                        src: newDefaultStyleType.logo,
                        scale: 1,
                    }),
                    zIndex: 2,
                })
            );
            feat.changed();
            return;
        }
        const newDefaultStyle = getWellKnownNames(newStyle.types![0])[0] as Style;
        if (!conditionKey) {
            feat.setStyle(newDefaultStyle);
            feat.changed();
            return;
        }
        const conditionValue = feat.get(conditionKey);

        if (!conditionValue) {
            feat.setStyle(newDefaultStyle);
            feat.changed();
            return;
        }

        const applyType = newStyle.types?.find((type) => {
            if (type.condition && comparisonFunc) {
                const typeCond = type.condition!["$and"] ? type.condition!["$and"]![0] : type.condition!["$or"]![0];
                if (typeCond[conditionKey]) {
                    let typeCondValue = typeCond[conditionKey]![condExpKey];
                    if (typeCondValue === null) return false;
                    if (Array.isArray(typeCondValue)) typeCondValue = typeCondValue[0];
                    if (typeCondValue === null) return false;
                    return comparisonFunc!(conditionValue, typeCondValue);
                }
            }
            return false;
        });

        if (applyType) {
            feat.setStyle(getWellKnownNames(applyType)[0] as Style);
            feat.changed();
            return;
        }
    });
};

export const changeFeatureTypeStyle = (features: Feature[], newStyle: FeatureTypeStyle) => {
    const defaultStyleType = newStyle.types![0];
    const featureType = defaultStyleType.featureType || "point";
    if (featureType === "point") {
        return applyStylePoint(features, newStyle);
    } else {
        features.forEach((feat) => {
            feat.setStyle(getWellKnownNames(defaultStyleType)[0] as Style);
            feat.changed();
            return;
        });
    }
};

export const getGeometry2D = (geometry: string, type: string = "point") => {
    if (type === "line") {
        return (
            geometry
                .replace(/,\(/g, ",")
                .split(",")
                .map((str) => str.split(" ").slice(0, -1).join(" "))
                .join(",") + ")"
        );
    } else if (type === "polygon") {
        return (
            geometry
                .replace(/,\(/g, ",")
                .split(",")
                .map((str) => str.split(" ").slice(0, -1).join(" "))
                .join(",") + ")))"
        );
    }
    return geometry;
};

export const setFeatureLayerStyle = (feat: Feature, geoservice: CommunityGeoservice, featureTypeSelectedStyle: FeatureTypeSelectedStyle[]) => {
    const layerStyle = featureTypeSelectedStyle.find((type) => type.layer === geoservice.layer);
    const defaultStyle = geoservice.styles![0]?.types![0];
    if (layerStyle) {
        feat.setStyle(getWellKnownNames(layerStyle.selectedStyle.types![0])[0] as Style);
    } else if (defaultStyle?.logo) {
        feat.setStyle(
            new Style({
                image: new Icon({
                    src: defaultStyle.logo,
                    scale: 1,
                }),
                zIndex: 2,
            })
        );
    } else {
        feat.setStyle(getWellKnownNames(defaultStyle)[0] as Style);
    }
};

export const getGeoserviceFeatureTypeGeometries = (
    items: FeatureTypeData[],
    geoservice: CommunityGeoservice,
    mapProjCode: string,
    geoProjCode: string,
    wfsSource: VectorSource
) => {
    const features: Feature[] = [];
    items.forEach((item) => {
        const featureType = geoservice.featureType;

        const ItemGeometry = item.geometrie as string;
        let feat: Feature;

        if (featureType === "line") {
            if (ItemGeometry.includes("MULTI")) {
                feat = new Feature({
                    geometry: new MultiLineString(getLonLatFromPoint(ItemGeometry, false, mapProjCode, geoProjCode) as Coordinate),
                });
            } else {
                feat = new Feature({
                    geometry: new LineString(getLonLatFromPoint(ItemGeometry, false, mapProjCode, geoProjCode) as Coordinate),
                });
            }
        } else if (featureType === "polygon") {
            let lonLat = getLonLatFromPoint(ItemGeometry, false, mapProjCode, geoProjCode);

            if (ItemGeometry.includes("MULTI")) {
                feat = new Feature({
                    geometry: new MultiPolygon(lonLat as Coordinate[][][]),
                });
            } else {
                lonLat = (ItemGeometry.includes("MULTIPOLYGON") ? lonLat![0] : lonLat) as Coordinate[][] | number[];
                feat = new Feature({
                    geometry: new Polygon(lonLat),
                });
            }
        } else {
            if (ItemGeometry.includes("MULTI")) {
                feat = new Feature({
                    geometry: new MultiPoint(getLonLatFromPoint(ItemGeometry, false, mapProjCode, geoProjCode) as number[]),
                });
            } else {
                feat = new Feature({
                    geometry: new Point(getLonLatFromPoint(ItemGeometry, false, mapProjCode, geoProjCode) as number[]),
                });
            }
        }

        feat.set(FEATURE_TYPE_DATA_PROPERTY, item);
        if (!featureExists(feat, wfsSource)) {
            features.push(feat);
        }
    });

    return features;
};

export const getLonLatFormCoordinates = (coordinates: LonLatCoordinate): LonLatCoordinate => {
    if (Array.isArray(coordinates[0])) {
        return (coordinates as LonLatCoordinate[]).map((ring) => getLonLatFormCoordinates(ring)) as LonLatCoordinate;
    } else {
        return fromLonLat(coordinates as Coordinate);
    }
};

export const getLonLatFromPoint = (
    point: string | undefined,
    lonLatCoord: boolean = true,
    mapProjCode: string = "EPSG:3857",
    geoProjCode: string = "EPSG:3857"
) => {
    if (!point) return [];
    let coordinates: LonLatCoordinate;
    let type = "point";
    if (point.includes("LINE")) type = "line";
    if (point.includes("POLYGON")) type = "polygon";
    try {
        const geometry = wktFormat.readGeometry(point, {
            dataProjection: geoProjCode,
            featureProjection: mapProjCode,
        }) as GeometryFeatueParams;
        coordinates = geometry?.getCoordinates() as LonLatCoordinate;
    } catch {
        const geom2D = getGeometry2D(point, type);
        const geometry = wktFormat.readGeometry(geom2D, {
            dataProjection: geoProjCode,
            featureProjection: mapProjCode,
        }) as GeometryFeatueParams;
        coordinates = geometry?.getCoordinates() as LonLatCoordinate;
    }
    if (!lonLatCoord) return coordinates;
    return getLonLatFormCoordinates(coordinates);
};

export const refreshReportLayer = (map: Map | null) => {
    if (!map) return;
    const mapCurrentLayers = map?.getAllLayers();
    const reportLayer = mapCurrentLayers?.find((l) => l.get("type") === REPORTS_LAYER_TYPE);
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

export const getFeatureGeometryWKT = (feature: Feature, mapProj: string = "EPSG:3857", featProj: string = "EPSG:4326") => {
    const geom4326 = feature.getGeometry()?.clone().transform(mapProj, featProj) as Geometry;
    return wktFormat.writeGeometry(geom4326);
};

export const getSketchFeatureType = (feature: Feature): SketchFeatureType => {
    const featureType = feature.getGeometry()?.getType();
    if (!featureType) return SketchFeatureType.Point;
    return (SketchFeatureType as Record<string, SketchFeatureType>)[featureType] ?? SketchFeatureType.Point;
};

export const getFeatureDiam = (feature: Feature) => {
    const featureStyle = feature.getStyle() as Style;
    const featureText = "getText" in featureStyle && featureStyle?.getText();
    const featureType = feature.getGeometry()?.getType();
    let diam = "getStroke" in featureStyle ? (featureStyle.getStroke()?.getWidth() ?? 1) : 1;
    if (featureType === "Point") {
        if (featureText) {
            diam = "getStroke" in featureText ? (featureText.getStroke()?.getWidth() ?? 1) : 1;
        } else {
            const scale = "getImage" in featureStyle ? (featureStyle.getImage()?.getScale() ?? 0.5) : 0.5;
            diam = Array.isArray(scale) ? (scale[0] + scale[1]) / 2 : scale;
        }
    }
    return diam;
};

export const getFeaturePoint = (report: CommunityReport, featData: SketchObject, main: boolean = false) => {
    const lonLat = getLonLatFromPoint(featData.geometry) as Coordinate;
    const feature = new Feature({
        geometry: new Point(lonLat),
        reportData: report,
        main: main,
    });

    let style = new Style({
        image: new Icon({
            src: reportImgStatus[report.status]?.img ?? reportImgStatus.submit.img,
            scale: 1,
        }),
        zIndex: 2,
    });

    if (featData.attributes) {
        const { nom, nature } = featData.attributes;
        if (nom) {
            style = new Style({
                text: new Text({
                    offsetY: -15,
                    fill: new Fill({ color: featData.style?.backcolor ?? FILL_COLOR }),
                    text: featData.attributes.nom,
                    font: "16px sans",
                    stroke: new Stroke({
                        width: featData.style?.diam,
                        color: featData.style?.frontcolor ?? POINT_COLOR,
                    }),
                }),
                zIndex: 1,
            });
        } else if (nature) {
            const markerStyle = markersStyles.find((m) => m.name === nature);
            if (markerStyle) {
                style = new Style({
                    image: new Icon({
                        src: markerStyle.imgSrc,
                        scale: featData.style?.diam,
                    }),
                    zIndex: 1,
                });
            }
        }
    }

    feature.setStyle(style);

    return feature;
};

export const getFeaturePolygon = (report: CommunityReport, featData: SketchObject) => {
    const isMulti = featData.type === SketchFeatureType.MultiPolygon || /MULTIPOLYGON/i.test(featData.geometry ?? "");
    const lonLat = getLonLatFromPoint(featData.geometry);
    const style = Array.isArray(featData.style) ? undefined : featData.style;
    const feature = new Feature({
        geometry: isMulti ? new MultiPolygon(lonLat as Coordinate[][][]) : new Polygon(lonLat as Coordinate[][]),
        reportData: report,
    });
    feature.setStyle(
        new Style({
            stroke: new Stroke({
                color: parseApiColor(style?.frontcolor, POLYGON_LINE_COLOR),
                width: style?.diam ?? 2,
            }),
            fill: new Fill({
                color: parseApiColor(style?.backcolor, FILL_COLOR),
            }),
            zIndex: 1,
        })
    );
    return feature;
};

export const getFeatureLine = (report: CommunityReport, featData: SketchObject) => {
    const lonLat = getLonLatFromPoint(featData.geometry) as Coordinate;
    const isMulti = featData.type === SketchFeatureType.MultiLineString || /MULTILINESTRING/i.test(featData.geometry ?? "");
    const feature = new Feature({
        geometry: isMulti ? new MultiLineString(lonLat) : new LineString(lonLat),
        reportData: report,
    });
    const style = Array.isArray(featData.style) ? undefined : featData.style;
    feature.setStyle(
        new Style({
            stroke: new Stroke({
                color: parseApiColor(style?.frontcolor, POLYGON_LINE_COLOR),
                width: style?.diam ?? 2,
            }),
            zIndex: 1,
        })
    );
    return feature;
};

export const handleCenterToFeature = (map: Map | null, feature: Feature) => {
    const geometry: GeometryFeatueParams = feature?.getGeometry() as GeometryFeatueParams;

    const featureExtent = geometry?.getExtent() || [];
    if (!isFinite(featureExtent[0]) || isEmpty(featureExtent)) {
        throw Error();
    }
    const featureCenter = getCenter(featureExtent);

    const view = map?.getView();

    const size = map?.getSize();
    const resolution = view?.getResolutionForExtent(featureExtent, size);
    const featureZoom = view?.getZoomForResolution(resolution!);

    view?.animate({
        center: featureCenter,
        zoom: Math.min(featureZoom ?? view.getZoom() ?? 19, 19),
        duration: 400,
    });
};

export const showCenterReportButtons = (show: boolean = true) => {
    const buttonsDiv = document.querySelector(".custom-button-top-right");
    const buttons = document.getElementsByClassName("center-feature");
    const customControls = document.querySelector(".custom-controls");

    if (buttonsDiv && customControls) {
        (buttonsDiv as HTMLDivElement).style.top = `${customControls?.clientHeight + 62}px`;
    }
    Array.from(buttons).forEach((button) => {
        (button as HTMLButtonElement).style.display = show ? "block" : "none";
    });
};

export const getCenterReportMessage = (message: AlertMessageType[]) => {
    return message.find(
        (message) =>
            typeof message.text === "object" &&
            React.isValidElement(message.text) &&
            typeof message.text.type === "function" &&
            (message.text.type as React.FC).displayName === "CenterMessage"
    );
};

export const REPORT_STATUS_LIST = ["submit", "pending0", "pending", "pending1", "pending2", "valid", "valid0", "reject", "reject0", "test"];

export function parseContentRange(contentRange: string) {
    let total = 0;
    let limitPerPage = 10;
    let currentPage = 1;

    if (contentRange) {
        const parts = contentRange.split("/");
        if (parts.length === 2) {
            const parsedTotal = parseInt(parts[1], 10);
            if (!isNaN(parsedTotal)) total = parsedTotal;

            const rangeParts = parts[0].split("-");
            if (rangeParts.length === 2) {
                const start = parseInt(rangeParts[0], 10);
                const end = parseInt(rangeParts[1], 10);
                if (!isNaN(start) && !isNaN(end)) {
                    limitPerPage = end - start + 1;
                    currentPage = Math.floor(start / limitPerPage) + 1;
                }
            }
        }
    }

    return { total, limitPerPage, currentPage };
}

export const addFeaturesInBatches = (source: VectorSource, features: Feature[], batchSize = 500, duration = 0) => {
    let i = 0;
    function processBatch() {
        const slice = features.slice(i, i + batchSize);
        source.addFeatures(slice);
        i += batchSize;
        if (i < features.length) {
            setTimeout(processBatch, duration);
        }
    }
    processBatch();
};

export const extentEquals = (e1: Extent, e2: Extent) => {
    return e1[0] === e2[0] && e1[1] === e2[1] && e1[2] === e2[2] && e1[3] === e2[3];
};

export const handleShowOnMap = (
    report: CommunityReport,
    map: Map | null,
    clusterSource: VectorSource<Feature<Geometry>>,
    localStorageData: LocalStorageData | null,
    t: TranslationFunction<"GetReportsLayer", ComponentKey>,
    reportTableWidth: number
) => {
    if (!map || !clusterSource) return;

    const localLayer: LocalLayer | undefined = localStorageData?.layers.find((l) => l.name === t("reports_title"));
    if (localLayer) localLayer.visibility = true;

    const view = map.getView();
    if (!view) return;

    let feature = clusterSource.getFeatures().find((f) => f.get("reportData")?.id === report.id);
    if (!feature) {
        const featData = { type: SketchFeatureType.Point, geometry: report.geometry };
        feature = getFeaturePoint(report, featData, true);
        clusterSource.addFeature(feature);
    }

    const croquisFeatures = getReportSketchFeatures(report);

    const toRemove = clusterSource.getFeatures().filter((f) => f.get("reportData")?.id === report.id && !f.get("main"));
    toRemove.forEach((f) => clusterSource.removeFeature(f));
    if (croquisFeatures.length > 0) clusterSource.addFeatures(croquisFeatures);

    const reportFeatures = [feature, ...croquisFeatures];
    const croquisExtent = createEmpty();
    reportFeatures.forEach((f) => {
        const geom = f.getGeometry();
        if (geom) extend(croquisExtent, geom.getExtent());
    });

    if (!isEmpty(croquisExtent)) {
        view.fit(croquisExtent, {
            size: map.getSize(),
            padding: [20, 100, 20, reportTableWidth],
            duration: 800,
            maxZoom: 19,
        });
        return;
    }
    handleCenterToFeature(map, feature!);
};

export const extractPointCoords = (wkt: string): { x: number; y: number } | null => {
    const match = wkt.match(/POINT\(([^ ]+) ([^)]+)\)/);
    if (match) {
        return {
            x: parseFloat(match[1]),
            y: parseFloat(match[2]),
        };
    }
    return null;
};

// Ex: 18 Décembre 2025, 12H42
export const formatFrenchDateWithCapitalMonth = (dateStr?: string): string => {
    if (!dateStr) return "-";

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";

    const day = d.getDate();
    const year = d.getFullYear();
    const month = d.toLocaleDateString("fr-FR", { month: "long" });
    const monthCapital = month.charAt(0).toUpperCase() + month.slice(1);
    const time = d
        .toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })
        .replace(":", "H");

    return `${day} ${monthCapital} ${year}, ${time}`;
};

// Ex: 2025-12-18 12:42:46
export const formatDateISO = (dateStr?: string): string => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";

    return d.toISOString().slice(0, 19).replace("T", " ");
};

export const escapeCsvValue = (value: unknown): string => {
    if (value == null || value === "") return "";

    let str = String(value);

    if (str.includes('"') || str.includes("\n") || str.includes("\r") || str.includes(",")) {
        str = `"${str.replace(/\r?\n|\r/g, " ")}"`;
    }

    return str;
};
