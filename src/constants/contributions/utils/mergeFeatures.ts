import { Feature } from "ol";
import { Coordinate } from "ol/coordinate";
import { LineString, Polygon, Geometry } from "ol/geom";
import { GeoserviceFeatureTypeProp } from "@/constants/communities/types";
import { COORD_EPSILON } from "@/constants";

function coordDist(a: Coordinate, b: Coordinate): number {
    return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function coordEq(a: Coordinate, b: Coordinate): boolean {
    return coordDist(a, b) < COORD_EPSILON;
}

function findCoordIndex(coords: Coordinate[], target: Coordinate): number {
    let bestIdx = -1;
    let bestDist = COORD_EPSILON * 1000;
    for (let i = 0; i < coords.length; i++) {
        const dist = coordDist(coords[i], target);
        if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
        }
    }
    return bestIdx;
}

// Find shared edge: returns indices of shared vertices in both rings
function findSharedEdge(ring1: Coordinate[], ring2: Coordinate[]): { sharedR1: number[]; sharedR2: number[] } | null {
    const r1 = ring1.slice(0, -1);
    const r2 = ring2.slice(0, -1);
    const n1 = r1.length;

    const sharedR1: number[] = [];
    const sharedR2: number[] = [];

    for (let i = 0; i < n1; i++) {
        const idx2 = findCoordIndex(r2, r1[i]);
        if (idx2 !== -1) {
            sharedR1.push(i);
            sharedR2.push(idx2);
        }
    }

    if (sharedR1.length < 2) return null;

    return { sharedR1, sharedR2 };
}

export function mergeAdjacentPolygonRings(ring1: Coordinate[], ring2: Coordinate[]): Coordinate[] | null {
    const shared = findSharedEdge(ring1, ring2);
    if (!shared) return null;

    const r1 = ring1.slice(0, -1);
    const r2 = ring2.slice(0, -1);
    const n1 = r1.length;
    const n2 = r2.length;

    const r1SharedSet = new Set(shared.sharedR1);
    const r2SharedSet = new Set(shared.sharedR2);

    // Find transition point
    let transitionIdx1 = -1;
    for (let i = 0; i < n1; i++) {
        if (r1SharedSet.has(i) && !r1SharedSet.has((i + 1) % n1)) {
            transitionIdx1 = i;
            break;
        }
    }
    if (transitionIdx1 === -1) return null;

    // Find where we re-enter shared
    let reentryIdx1 = (transitionIdx1 + 1) % n1;
    while (!r1SharedSet.has(reentryIdx1)) {
        reentryIdx1 = (reentryIdx1 + 1) % n1;
        if (reentryIdx1 === transitionIdx1) return null;
    }

    const r1Exclusive: Coordinate[] = [];
    let i = (transitionIdx1 + 1) % n1;
    while (i !== reentryIdx1) {
        r1Exclusive.push(r1[i]);
        i = (i + 1) % n1;
    }

    // Find corresponding indices
    const transitionCoord = r1[transitionIdx1];
    const reentryCoord = r1[reentryIdx1];
    const transitionIdx2 = findCoordIndex(r2, transitionCoord);
    const reentryIdx2 = findCoordIndex(r2, reentryCoord);
    if (transitionIdx2 === -1 || reentryIdx2 === -1) return null;

    let dir: 1 | -1 = r2SharedSet.has((reentryIdx2 + 1 + n2) % n2) ? -1 : 1;

    const collectR2Exclusive = (d: 1 | -1): Coordinate[] => {
        const out: Coordinate[] = [];
        let j = (reentryIdx2 + d + n2) % n2;
        let safety = 0;
        while (j !== transitionIdx2 && safety < n2) {
            if (!r2SharedSet.has(j)) out.push(r2[j]);
            j = (j + d + n2) % n2;
            safety++;
        }
        return out;
    };

    let r2Exclusive = collectR2Exclusive(dir);
    if (r2Exclusive.length === 0) {
        dir = (dir * -1) as 1 | -1;
        r2Exclusive = collectR2Exclusive(dir);
    }

    // Build merged ring: transition vertex -> r1 exclusive -> reentry vertex -> r2 exclusive -> close
    const merged: Coordinate[] = [transitionCoord, ...r1Exclusive, reentryCoord, ...r2Exclusive];
    merged.push(merged[0]);
    return merged.length >= 4 ? merged : null;
}

export function mergeLineCoordinates(coords1: Coordinate[], coords2: Coordinate[]): Coordinate[] | null {
    const end1 = coords1[coords1.length - 1];
    const start1 = coords1[0];
    const end2 = coords2[coords2.length - 1];
    const start2 = coords2[0];

    if (coordEq(end1, start2)) {
        return [...coords1, ...coords2.slice(1)];
    }
    if (coordEq(end1, end2)) {
        return [...coords1, ...[...coords2].reverse().slice(1)];
    }
    if (coordEq(start1, start2)) {
        return [...[...coords1].reverse(), ...coords2.slice(1)];
    }
    if (coordEq(start1, end2)) {
        return [...coords2, ...coords1.slice(1)];
    }
    return null;
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
