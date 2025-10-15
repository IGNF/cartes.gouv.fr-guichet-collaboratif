import imgSubmit from "../img/reports/punaise_submit.png";
import imgPending from "../img/reports/punaise_pending.png";
import imgValid from "../img/reports/punaise_valid.png";
import imgReject from "../img/reports/punaise_reject.png";
import imgTest from "../img/reports/punaise_test.png";
import { fromLonLat } from "ol/proj";
import { AlertMessageType, CommunityGeoservice, CommunityTheme, FeatureTypeSelectedStyle, FeatureTypeStyle } from "./communities/types";
import Feature from "ol/Feature";
import { Map } from "ol";
import { CommunityReport, GeometryFeatueParams, PostThemeReport, SketchFeatureType, SketchObject } from "./reports/types";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import { Geometry, LineString, MultiLineString, MultiPoint, MultiPolygon, Point, Polygon } from "ol/geom";
import Layer from "ol/layer/Layer";
import TileLayer from "ol/layer/Tile";
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
import { Extent, getCenter, isEmpty } from "ol/extent";
import React from "react";
import { REPORTS_LAYER_TYPE } from "./reports/utils";
import { ComparatorFunc, simpleComparators } from "./mongo_parser";
import getWellKnownNames from "./wellKnownNames";
import addProjectionsToProj4 from "./projectionsToDefine";

const wktFormat = new WKT();
addProjectionsToProj4();

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
    [key: string]: { img: string; text: string; colorType: string };
};

export const reportImgStatus: ReportImgStatusType = {
    submit: { img: imgSubmit, text: "Reçu dans nos services", colorType: "info" },
    pending: { img: imgPending, text: "En cours de traitement", colorType: "new" },
    pending0: { img: imgPending, text: "En demande de qualification", colorType: "new" },
    pending1: { img: imgPending, text: "En attente de saisie", colorType: "new" },
    pending2: { img: imgPending, text: "En attente de validation", colorType: "info" },
    valid: { img: imgValid, text: "Pris en compte", colorType: "success" },
    valid0: { img: imgValid, text: "Déjà pris en compte", colorType: "success" },
    reject: { img: imgReject, text: "Rejeté (hors spéc.)", colorType: "error" },
    reject0: { img: imgReject, text: "Rejeté (hors de propos)", colorType: "error" },
    test: { img: imgTest, text: "En mode test", colorType: "new" },
};

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
    const conditions = condition ? condition!["$and"]![0] : {};
    const conditionKey = conditions ? Object.keys(conditions)[0] : "";
    const condExpression = conditions[conditionKey];
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
                const typeCond = type.condition!["$and"]![0];
                let typeCondValue = typeCond[conditionKey][condExpKey];
                if (Array.isArray(typeCondValue)) typeCondValue = typeCondValue[0];
                return comparisonFunc!(conditionValue, typeCondValue);
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

        feat.set("featureTypeData", item);
        if (feat && !featureExists(feat, wfsSource)) {
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
    let coordinates: LonLatCoordinate = [];
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

export const getFeatureGeometryWKT = (feature: Feature) => {
    const geom4326 = feature.getGeometry()?.clone().transform("EPSG:3857", "EPSG:4326") as Geometry;
    return wktFormat.writeGeometry(geom4326);
};

export const getSketchFeatureType = (feature: Feature): SketchFeatureType => {
    const featureType = feature.getGeometry()?.getType();
    if (!featureType) return SketchFeatureType.Point;
    return SketchFeatureType[featureType];
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
                    fill: new Fill({ color: featData.style?.backcolor }),
                    text: featData.attributes.nom,
                    font: "16px sans",
                    stroke: new Stroke({
                        width: featData.style?.diam,
                        color: featData.style?.frontcolor,
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
    let lonLat = getLonLatFromPoint(featData.geometry);
    lonLat = (featData.geometry.includes("MULTIPOLYGON") ? lonLat[0] : lonLat) as Coordinate[][] | number[];
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

export const getFeatureMultiLine = (report: CommunityReport, featData: SketchObject) => {
    const lonLat = getLonLatFromPoint(featData.geometry) as Coordinate;
    const feature = new Feature({
        geometry: new MultiLineString(lonLat),
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

export const getFeatureLine = (report: CommunityReport, featData: SketchObject) => {
    const lonLat = getLonLatFromPoint(featData.geometry) as Coordinate;
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

export const handleFeatureToCenter = (map: Map, feature: Feature) => {
    const viewCenter = map?.getView().getCenter();

    if (!viewCenter || !feature) return;
    const geometry: GeometryFeatueParams = feature?.getGeometry() as GeometryFeatueParams;

    const geomExtent = geometry?.getExtent() || [];
    const geomCenter = getCenter(geomExtent);
    const deltaX = viewCenter[0] - geomCenter[0];
    const deltaY = viewCenter[1] - geomCenter[1];
    geometry?.translate(deltaX, deltaY);
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

    if (featureZoom) {
        view?.setZoom(featureZoom);
    }

    view?.setCenter(featureCenter);
};

export const showCenterReportButtons = (show: boolean = true) => {
    const buttons = document.getElementsByClassName("center-feature");
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
            message.text.type.name === "CenterMessage"
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

export const transformReportsToExportData = (reports: CommunityReport[]) => {
    return reports.map((report) => {
        return {
            author: report.author?.username || "-",
            opening_date: report.opening_date ? new Date(report.opening_date).toLocaleDateString() : "-",
            departement: report.commune ? `${report.commune.title} (${report.departement?.name})` : "-",
            theme: report.attributes && report.attributes.length > 0 ? report.attributes.map((attr) => attr.theme || "").join(", ") : "-",
            status: report.status || "-",
        };
    });
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
    if (localLayer) {
        localLayer.visibility = true;
    }

    const view = map?.getView();
    if (!view || !map) return;

    let feature = clusterSource.getFeatures().find((f) => f.get("reportData")?.id === report.id);

    if (feature) {
        handleCenterToFeature(map, feature);
    } else {
        const featData = {
            type: SketchFeatureType.Point,
            geometry: report.geometry,
        };
        feature = getFeaturePoint(report, featData, true);
        clusterSource.addFeature(feature);
        handleCenterToFeature(map, feature);
    }

    const coords = getLonLatFromPoint(report.geometry) as Coordinate;
    view.setCenter(coords);

    const rasterLayers = map?.getAllLayers();
    const layers = rasterLayers?.filter((layer) => layer.getVisible() === true && layer instanceof TileLayer);
    const higherLayer = layers?.reduce((minLay, lay) => (!minLay || Number(lay.getZIndex()) < Number(minLay?.getZIndex()) ? lay : minLay));
    const theLayerZoom = higherLayer?.getMaxZoom() - 2;

    view.setZoom(theLayerZoom ?? view.getZoom());

    const pixelOffsetX = -reportTableWidth / 2;

    const applyOffset = () => {
        const pixel = map.getPixelFromCoordinate(coords);
        const pixelOffset = [pixel[0] + pixelOffsetX, pixel[1]];
        const offsetCoord = map.getCoordinateFromPixel(pixelOffset);
        view.setCenter(offsetCoord);
        map.un("postrender", applyOffset);
    };

    map.on("postrender", applyOffset);
};
