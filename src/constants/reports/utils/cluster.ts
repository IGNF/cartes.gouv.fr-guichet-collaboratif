import { Style } from "ol/style";
import { Pixel } from "ol/pixel";
import { Geometry } from "ol/geom";
import { GeometryFeatueParams } from "../types";
import { Feature, Map } from "ol";
import { Coordinate } from "ol/coordinate";
import VectorSource from "ol/source/Vector";
import { clusterReportCircleStyle, clusterReportPinStyle, clusterStyle, strokeStyleCommon } from "@/constants/styles";

export const isPointGeometryAtPixel = (pointGeom: GeometryFeatueParams, pixel: Pixel, map: Map, radiusPx = 9) => {
    if (!pointGeom) return false;
    const coord = map.getCoordinateFromPixel(pixel);
    const pt = pointGeom.getCoordinates() as Coordinate;
    const res = map.getView().getResolution() || 0;
    const tol = radiusPx * res;

    const dx = coord[0] - pt[0];
    const dy = coord[1] - pt[1];
    return Math.hypot(dx, dy) <= tol;
};

export const getClickedReport = (feature: Feature, clickedPixel: Pixel, map: Map) => {
    const features = feature.get("features") as Feature[];
    const fStyles = feature.getStyle() as Style[];
    let clickedStyle: Style | undefined;
    let clickedFeature: Feature | undefined;

    fStyles?.slice(1).forEach((style) => {
        const geometry = style.getGeometry() as GeometryFeatueParams;
        const isClickedGeometry = geometry && isPointGeometryAtPixel(geometry, clickedPixel, map);
        if (!isClickedGeometry) {
            return;
        }
        clickedStyle = style;
        clickedFeature = features.find((f) => f.get("reportData")?.id === geometry.get("reportData")?.id);
    });

    if (clickedStyle) {
        const clonedGeometry = (clickedStyle.getGeometry() as Geometry).clone();
        clonedGeometry.set("clicked", true);
        const reportStyle = clusterReportPinStyle(clonedGeometry);
        feature.setStyle([fStyles[0], ...fStyles.slice(1).filter((s) => !(s.getGeometry() as Geometry)?.get("clicked")), reportStyle]);
    }
    return clickedFeature;
};

export const clearClusterStyles = (clusterSource: VectorSource, feature: Feature | null = null) => {
    clusterSource?.getFeatures()?.forEach((clusterFeature) => {
        if (clusterFeature === feature) return;
        if (clusterFeature.get("features")?.length > 1) {
            clusterFeature.setStyle(clusterStyle(clusterFeature));
        }
    });
};

export const showClusterFeatures = (feature: Feature, resolution: number = 0, clusterSource: VectorSource) => {
    clearClusterStyles(clusterSource, feature);

    if (Array.isArray(feature.getStyle())) {
        feature.setStyle(clusterStyle(feature));
        return;
    }
    const features: Feature[] = feature.get("features");

    if (features.length === 1) return;

    const total: number = features.length;
    const center = (feature.getGeometry() as GeometryFeatueParams)?.getCoordinates() as Coordinate;
    const styles = [clusterStyle(feature)];

    const separation = Math.max(features.length + 5, 20);
    const resolutionFactor = resolution;
    const baseRadius = 30;

    for (let i = 0; i < total; i++) {
        const currentFeature = features[i];

        let radius = separation * Math.sqrt(i + 3);
        let angle = radius / (total / 2);

        if (total <= 10) {
            angle = ((2 * Math.PI) / total) * i;
            radius = baseRadius + total * 2;
        }

        const offsetX = radius * Math.cos(angle);
        const offsetY = radius * Math.sin(angle);

        const spiralCoord = [center[0] + offsetX * resolutionFactor, center[1] + offsetY * resolutionFactor];

        styles.push(strokeStyleCommon(center, spiralCoord));

        const circleStyle = clusterReportCircleStyle(spiralCoord);

        (circleStyle.getGeometry() as Geometry)?.set("reportData", currentFeature.get("reportData"));

        styles.push(circleStyle);
    }

    feature.setStyle(styles);
};
