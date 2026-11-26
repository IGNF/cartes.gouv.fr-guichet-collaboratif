import { Feature, Map } from "ol";
import { Coordinate } from "ol/coordinate";
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

// Pixel offsets within `tolerance`, sorted from the pointer outwards
const getProbeOffsets = (tolerance: number): ProbeOffset[] => {
    if (probeOffsetsCache[tolerance]) return probeOffsetsCache[tolerance];
    const offsets: ProbeOffset[] = [];
    for (let dx = -tolerance; dx <= tolerance; dx++) {
        for (let dy = -tolerance; dy <= tolerance; dy++) {
            const distance = Math.hypot(dx, dy);
            if (distance <= tolerance) offsets.push({ dx, dy, distance });
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

// Cheap spatial-index lookup to skip probing when nothing is near the pointer.
// The search is twice the tolerance wide because point symbols can be larger than the tolerance.
const hasFeatureNearby = (map: Map, layerFilter: (layer: Layer) => boolean, coordinate: Coordinate, resolution: number, tolerance: number) => {
    const extent = buffer(createOrUpdateFromCoordinate(coordinate), resolution * tolerance * 2);
    return map.getAllLayers().some((layer) => {
        if (!layer.getVisible() || !layerFilter(layer)) return false;
        const source = layer.getSource();
        return !(source instanceof VectorSource) || source.forEachFeatureInExtent(extent, () => true) === true;
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
    if (!coordinate || !resolution || !hasFeatureNearby(map, layerFilter, coordinate, resolution, tolerance)) return;

    const candidates: (NearestFeatureHit & { distance: number })[] = [];
    for (const { dx, dy, distance } of getProbeOffsets(tolerance)) {
        // Stop once the nearest probe distance with a hit has been fully explored
        if (candidates.length && distance > candidates[0].distance) break;
        const probe: Pixel = [pixel[0] + dx, pixel[1] + dy];
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
    source: VectorSource | null | undefined,
    coordinate: Coordinate,
    tolerance: number = POINTER_HIT_DETECTION_TOLERENCE
): Feature | undefined => {
    const resolution = map?.getView().getResolution();
    if (!source || !resolution) return;

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
