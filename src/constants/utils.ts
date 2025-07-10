import imgSubmit from "../img/reports/punaise_submit.png";
import imgPending from "../img/reports/punaise_pending.png";
import imgValid from "../img/reports/punaise_valid.png";
import imgReject from "../img/reports/punaise_reject.png";
import imgTest from "../img/reports/punaise_test.png";
import { fromLonLat } from "ol/proj";
import { CommunityTheme } from "./communities/types";
import Feature from "ol/Feature";
import { Map } from "ol";
import { CommunityReport, GeometryFeatueParams, PostThemeReport, SketchFeatureType, SketchObject } from "./reports/types";
import { Fill, Icon, Stroke, Style, Text } from "ol/style";
import { Geometry, LineString, MultiLineString, Point, Polygon } from "ol/geom";
import Layer from "ol/layer/Layer";
import VectorSource from "ol/source/Vector";
import WKT from "ol/format/WKT";
import { Coordinate } from "ol/coordinate";
import createStarImg from "../img/reports/marketlist/star.png";
import createCircleImg from "../img/reports/marketlist/circle.png";
import createSquareImg from "../img/reports/marketlist/square.png";
import createCrossImg from "../img/reports/marketlist/cross.png";
import createXImg from "../img/reports/marketlist/x.png";
import createTriangleImg from "../img/reports/marketlist/triangle.png";
import createPointImg from "../img/reports/create_point.png";
import { getCenter } from "ol/extent";

const wktFormat = new WKT();

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

export const reportImgStatus = {
    submit: { img: imgSubmit, text: "Reçu dans nos services" },
    pending: { img: imgPending, text: "En cours de traitement" },
    valid: { img: imgValid, text: "Pris en compte" },
    reject: { img: imgReject, text: "Rejeté (hors spéc.)" },
    test: { img: imgTest, text: "En mode test" },
};

type LonLatCoordinate = Coordinate | Coordinate[] | Coordinate[][] | Coordinate[][][];

export const getLonLatFormCoordinates = (coordinates: LonLatCoordinate): LonLatCoordinate => {
    if (Array.isArray(coordinates[0])) {
        return (coordinates as LonLatCoordinate).map((ring) => getLonLatFormCoordinates(ring as LonLatCoordinate)) as LonLatCoordinate;
    } else {
        return fromLonLat(coordinates as Coordinate);
    }
};

export const getLonLatFromPoint = (point: string | undefined) => {
    if (!point) return [];
    const wktGeometry = wktFormat.readGeometry(point) as GeometryFeatueParams;
    const coordinates = wktGeometry?.getCoordinates() as LonLatCoordinate;
    return getLonLatFormCoordinates(coordinates);
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
            src: reportImgStatus[report.status].img,
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
    const view = map?.getView();

    const size = map?.getSize();
    const resolution = view?.getResolutionForExtent(featureExtent, size);

    const featureZoom = view?.getZoomForResolution(resolution!);

    if (featureZoom) {
        view?.setZoom(featureZoom);
    }
    const featureCenter = getCenter(featureExtent);
    view?.setCenter(featureCenter);
};
