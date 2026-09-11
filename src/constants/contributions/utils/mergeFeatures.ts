import { cleanCoords, featureCollection, lineString, polygon, union } from "@turf/turf";
import { Feature } from "ol";
import { Coordinate } from "ol/coordinate";
import { LineString, Polygon, Geometry } from "ol/geom";

import { GeoserviceFeatureTypeProp } from "@/constants/communities/types";
import { COORD_EPSILON } from "@/constants";

const NODE_MATCH_MARGIN = COORD_EPSILON * 1000;

function coordDist(a: Coordinate, b: Coordinate): number {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

export function mergeAdjacentPolygonRings(ring1: Coordinate[], ring2: Coordinate[]): Coordinate[] | null {
    const merged = mergePolygonCoordinates([ring1], [ring2]);
    return merged?.[0] ?? null;
}

function mergePolygonCoordinates(coordinates1: Coordinate[][], coordinates2: Coordinate[][]): Coordinate[][] | null {
    const merged = union(featureCollection([polygon(coordinates1), polygon(coordinates2)]));

    // A disconnected result is dismissed (Multygeom)
    if (!merged || merged.geometry.type !== "Polygon") return null;

    return merged.geometry.coordinates;
}

type EndpointPairType = "end1-start2" | "end1-end2" | "start1-start2" | "start1-end2";

interface EndpointPair {
    type: EndpointPairType;
    dist: number;
}

function findClosestEndpointPair(coords1: Coordinate[], coords2: Coordinate[]): EndpointPair | null {
    const end1 = coords1[coords1.length - 1];
    const start1 = coords1[0];
    const end2 = coords2[coords2.length - 1];
    const start2 = coords2[0];

    const candidates: EndpointPair[] = [
        { type: "end1-start2", dist: coordDist(end1, start2) },
        { type: "end1-end2", dist: coordDist(end1, end2) },
        { type: "start1-start2", dist: coordDist(start1, start2) },
        { type: "start1-end2", dist: coordDist(start1, end2) },
    ];

    const best = candidates.reduce((min, candidate) => (candidate.dist < min.dist ? candidate : min));
    if (best.dist >= NODE_MATCH_MARGIN) return null;
    return best;
}

export function mergeLineCoordinates(coords1: Coordinate[], coords2: Coordinate[]): Coordinate[] | null {
    if (coords1.length < 2 || coords2.length < 2) return null;

    const pair = findClosestEndpointPair(coords1, coords2);
    if (!pair) return null;

    let merged: Coordinate[];
    switch (pair.type) {
        case "end1-start2":
            merged = [...coords1, ...coords2.slice(1)];
            break;
        case "end1-end2":
            merged = [...coords1, ...[...coords2].reverse().slice(1)];
            break;
        case "start1-start2":
            merged = [...[...coords1].reverse(), ...coords2.slice(1)];
            break;
        case "start1-end2":
            merged = [...coords2, ...coords1.slice(1)];
            break;
    }

    return cleanCoords(lineString(merged)).geometry.coordinates;
}

export function mergeFeatureGeometries(feat1: Feature, feat2: Feature, featureType: GeoserviceFeatureTypeProp): Geometry | null {
    if (featureType === GeoserviceFeatureTypeProp.LINE) {
        const geom1 = feat1.getGeometry() as LineString;
        const geom2 = feat2.getGeometry() as LineString;
        if (!geom1 || !geom2) return null;

        const merged = mergeLineCoordinates(geom1.getCoordinates(), geom2.getCoordinates());
        return merged ? new LineString(merged) : null;
    }

    if (featureType === GeoserviceFeatureTypeProp.POLYGON) {
        const geom1 = feat1.getGeometry() as Polygon;
        const geom2 = feat2.getGeometry() as Polygon;
        if (!geom1 || !geom2) return null;

        const merged = mergePolygonCoordinates(geom1.getCoordinates(), geom2.getCoordinates());
        return merged ? new Polygon(merged) : null;
    }

    return null;
}
