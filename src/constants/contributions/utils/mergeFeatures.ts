import { Feature } from "ol";
import { Coordinate } from "ol/coordinate";
import { LineString, Polygon, Geometry } from "ol/geom";
import { GeoserviceFeatureTypeProp } from "@/constants/communities/types";

const COORD_EPSILON = 1e-6;

function coordEq(a: Coordinate, b: Coordinate): boolean {
    return Math.abs(a[0] - b[0]) < COORD_EPSILON && Math.abs(a[1] - b[1]) < COORD_EPSILON;
}

export function mergeLineCoordinates(coords1: Coordinate[], coords2: Coordinate[]): Coordinate[] | null {
    if (coordEq(coords1[coords1.length - 1], coords2[0])) {
        return [...coords1, ...coords2.slice(1)];
    }
    if (coordEq(coords1[coords1.length - 1], coords2[coords2.length - 1])) {
        return [...coords1, ...[...coords2].reverse().slice(1)];
    }
    if (coordEq(coords1[0], coords2[0])) {
        return [...[...coords1].reverse(), ...coords2.slice(1)];
    }
    if (coordEq(coords1[0], coords2[coords2.length - 1])) {
        return [...coords2, ...coords1.slice(1)];
    }
    return null;
}

export function mergeAdjacentPolygonRings(ring1: Coordinate[], ring2: Coordinate[]): Coordinate[] | null {
    const r1 = ring1.slice(0, -1);
    const r2 = ring2.slice(0, -1);
    const n1 = r1.length;
    const n2 = r2.length;

    const r2Has = (c: Coordinate) => r2.some((v) => coordEq(v, c));
    const r1Has = (c: Coordinate) => r1.some((v) => coordEq(v, c));

    let startIdx = -1;
    for (let i = 0; i < n1; i++) {
        if (r2Has(r1[i]) && !r2Has(r1[(i + 1) % n1])) {
            startIdx = i;
            break;
        }
    }
    if (startIdx === -1) return null;

    const startVertex = r1[startIdx];

    const r1Exclusive: Coordinate[] = [];
    let i = (startIdx + 1) % n1;
    while (!r2Has(r1[i])) {
        r1Exclusive.push(r1[i]);
        i = (i + 1) % n1;
        if (r1Exclusive.length > n1) return null;
    }
    const exitVertex = r1[i];

    const exitIdxR2 = r2.findIndex((v) => coordEq(v, exitVertex));
    if (exitIdxR2 === -1) return null;

    const nextFwd = r2[(exitIdxR2 + 1) % n2];
    const r2Direction = r1Has(nextFwd) ? -1 : 1;

    const r2Exclusive: Coordinate[] = [];
    let j = (exitIdxR2 + r2Direction + n2) % n2;
    while (!coordEq(r2[j], startVertex)) {
        r2Exclusive.push(r2[j]);
        j = (j + r2Direction + n2) % n2;
        if (r2Exclusive.length > n2) return null;
    }

    const merged = [startVertex, ...r1Exclusive, exitVertex, ...r2Exclusive];
    return [...merged, merged[0]];
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

        const ring1 = geom1.getLinearRing(0)?.getCoordinates();
        const ring2 = geom2.getLinearRing(0)?.getCoordinates();
        if (!ring1 || !ring2) return null;

        const merged = mergeAdjacentPolygonRings(ring1, ring2);
        return merged ? new Polygon([merged]) : null;
    }

    return null;
}
