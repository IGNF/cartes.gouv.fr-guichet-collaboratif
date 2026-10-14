import { Feature, Map as OlMap } from "ol";
import { Coordinate } from "ol/coordinate";
import { LineString, MultiLineString, MultiPolygon, Polygon } from "ol/geom";

import { POINTER_HIT_DETECTION_TOLERENCE } from "@/constants";

export interface ContextMenuItem {
    text: string;
    callback: (payload: { coordinate?: number[] }) => void;
}

const getRemovableVertices = (feature: Feature): Coordinate[] => {
    const geometry = feature.getGeometry();

    if (geometry instanceof LineString) {
        const coordinates = geometry.getCoordinates();
        return coordinates.length > 2 ? coordinates : [];
    }

    if (geometry instanceof MultiLineString) {
        return geometry
            .getCoordinates()
            .filter((coordinates) => coordinates.length > 2)
            .flat();
    }

    if (geometry instanceof Polygon) {
        return geometry
            .getCoordinates()
            .filter((ring) => ring.length > 4)
            .flatMap((ring) => ring.slice(0, -1));
    }

    if (geometry instanceof MultiPolygon) {
        return geometry
            .getCoordinates()
            .flat()
            .filter((ring) => ring.length > 4)
            .flatMap((ring) => ring.slice(0, -1));
    }

    return [];
};

export const findVertexAtCoordinate = (map: OlMap, features: Feature[], coordinate: Coordinate): Coordinate | undefined => {
    const clickedPixel = map.getPixelFromCoordinate(coordinate);
    let closestVertex: Coordinate | undefined;
    let closestDistance = POINTER_HIT_DETECTION_TOLERENCE;

    features.forEach((feature) => {
        getRemovableVertices(feature).forEach((vertex) => {
            const vertexPixel = map.getPixelFromCoordinate(vertex);
            const distance = Math.hypot(vertexPixel[0] - clickedPixel[0], vertexPixel[1] - clickedPixel[1]);

            if (distance <= closestDistance) {
                closestDistance = distance;
                closestVertex = vertex;
            }
        });
    });

    return closestVertex;
};
