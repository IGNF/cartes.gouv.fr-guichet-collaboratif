import { Feature, Map } from "ol";
import { Coordinate, closestOnSegment, squaredDistance } from "ol/coordinate";
import { buffer, createOrUpdateFromCoordinate } from "ol/extent";
import Layer from "ol/layer/Layer";
import { Pixel } from "ol/pixel";
import VectorSource from "ol/source/Vector";
import { POINTER_HIT_DETECTION_TOLERENCE } from "@/constants";

export interface NearestFeatureHit {
    feature: Feature;
    layer: Layer;
    pixel: Pixel;
}

interface ProbeOffset {
    dx: number;
    dy: number;
    distance: number;
}

const probeOffsetsCache: Record<number, ProbeOffset[]> = {};

const PROBE_STEP = 2;

// Pixel offsets within `tolerance` (pointer excluded), sorted from the pointer outwards
const getProbeOffsets = (tolerance: number): ProbeOffset[] => {
    if (probeOffsetsCache[tolerance]) return probeOffsetsCache[tolerance];
    const offsets: ProbeOffset[] = [];
    const max = Math.floor(tolerance / PROBE_STEP) * PROBE_STEP;
    for (let dx = -max; dx <= max; dx += PROBE_STEP) {
        for (let dy = -max; dy <= max; dy += PROBE_STEP) {
            const distance = Math.hypot(dx, dy);
            if (distance > 0 && distance <= tolerance) offsets.push({ dx, dy, distance });
        }
    }
    offsets.sort((a, b) => a.distance - b.distance);
    probeOffsetsCache[tolerance] = offsets;
    return offsets;
};

const getGeometryPixelDistance = (feature: Feature, coordinate: Coordinate, resolution: number) => {
    const geometry = feature.getGeometry();
    if (!geometry) return Infinity;
    if (geometry.intersectsCoordinate(coordinate)) return 0;
    const closest = geometry.getClosestPoint(coordinate);
    return Math.hypot(closest[0] - coordinate[0], closest[1] - coordinate[1]) / resolution;
};

// Skips the probing around the pointer when no geometry is close enough to be reached by it.
// Twice the tolerance, to leave room for the rendered stroke width; a symbol larger than that is still hit under the pointer.
const hasFeatureNearby = (map: Map, layerFilter: (layer: Layer) => boolean, coordinate: Coordinate, resolution: number, tolerance: number) => {
    const reach = tolerance * 2;
    const extent = buffer(createOrUpdateFromCoordinate(coordinate), resolution * reach);
    return map.getAllLayers().some((layer) => {
        if (!layer.getVisible() || !layerFilter(layer)) return false;
        const source = layer.getSource();
        if (!(source instanceof VectorSource)) return true;
        return source.forEachFeatureInExtent(extent, (feature) => getGeometryPixelDistance(feature, coordinate, resolution) <= reach || undefined) === true;
    });
};

// Finds the nearest rendered feature within `tolerance` pixels by probing outward;
// ties are resolved by geometric distance to the pointer.
export const getNearestFeatureAtPixel = (
    map: Map | null | undefined,
    pixel: Pixel,
    layerFilter: (layer: Layer) => boolean,
    tolerance: number = POINTER_HIT_DETECTION_TOLERENCE
): NearestFeatureHit | undefined => {
    if (!map) return;
    const coordinate = map.getCoordinateFromPixel(pixel);
    const resolution = map.getView().getResolution();
    if (!coordinate || !resolution) return;

    const candidates: (NearestFeatureHit & { distance: number })[] = [];
    const probeAt = (probe: Pixel, distance: number) => {
        map.forEachFeatureAtPixel(
            probe,
            (feature, layer) => {
                if (feature instanceof Feature && !candidates.some((c) => c.feature === feature)) {
                    candidates.push({ feature, layer, pixel: probe, distance });
                }
                return false;
            },
            { layerFilter }
        );
    };

    probeAt(pixel, 0);

    if (!candidates.length && hasFeatureNearby(map, layerFilter, coordinate, resolution, tolerance)) {
        for (const { dx, dy, distance } of getProbeOffsets(tolerance)) {
            if (candidates.length && distance > candidates[0].distance) break;
            probeAt([pixel[0] + dx, pixel[1] + dy], distance);
        }
    }
    if (!candidates.length) return;

    let nearest = candidates[0];
    let nearestGeometryDistance = getGeometryPixelDistance(nearest.feature, coordinate, resolution);
    for (const candidate of candidates.slice(1)) {
        const geometryDistance = getGeometryPixelDistance(candidate.feature, coordinate, resolution);
        if (geometryDistance < nearestGeometryDistance) {
            nearest = candidate;
            nearestGeometryDistance = geometryDistance;
        }
    }
    return { feature: nearest.feature, layer: nearest.layer, pixel: nearest.pixel };
};

export const getClosestSourceFeature = (
    map: Map | null | undefined,
    layer: Layer | null | undefined,
    coordinate: Coordinate,
    tolerance: number = POINTER_HIT_DETECTION_TOLERENCE
): Feature | undefined => {
    const resolution = map?.getView().getResolution();
    const source = layer?.getSource();
    if (!map || !layer?.isVisible(map.getView()) || !(source instanceof VectorSource) || !resolution) return;

    let closest: Feature | undefined;
    let closestDistance = tolerance;
    const extent = buffer(createOrUpdateFromCoordinate(coordinate), resolution * tolerance);
    source.forEachFeatureInExtent(extent, (feature) => {
        const distance = getGeometryPixelDistance(feature, coordinate, resolution);
        if (distance <= closestDistance) {
            closest = feature;
            closestDistance = distance;
        }
    });
    return closest;
};

// Returns the segment of the line `coordinates` nearest to `coordinate`: its index and the closest point on it
export const getClosestSegment = (coordinates: Coordinate[], coordinate: Coordinate): { index: number; point: Coordinate } => {
    let nearest = { index: 0, point: coordinates[0] };
    let minSquaredDistance = Infinity;
    for (let i = 0; i < coordinates.length - 1; i++) {
        const start = coordinates[i];
        const end = coordinates[i + 1];
        const closest = closestOnSegment(coordinate, [start, end]);
        const distance = squaredDistance(coordinate, closest);
        if (distance < minSquaredDistance) {
            const squaredLength = squaredDistance(start, end);
            const ratio = squaredLength ? Math.sqrt(squaredDistance(start, closest) / squaredLength) : 0;
            minSquaredDistance = distance;
            nearest = { index: i, point: start.map((value, k) => (k < 2 ? closest[k] : value + ratio * (end[k] - value))) };
        }
    }
    return nearest;
};
