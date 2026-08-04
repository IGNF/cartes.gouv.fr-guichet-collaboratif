import type { Coordinate } from "ol/coordinate";

export interface ShortestPathRequest {
    lines: Coordinate[][];
    startLineIndices: number[];
    endLineIndices: number[];
    startRef: Coordinate;
    endRef: Coordinate;
}

const coordKey = (coord: Coordinate) => `${coord[0].toFixed(6)}|${coord[1].toFixed(6)}`;

const addEdge = (adjacency: Map<string, Map<string, number>>, fromKey: string, toKey: string, weight: number) => {
    let neighbors = adjacency.get(fromKey);
    if (!neighbors) {
        neighbors = new Map();
        adjacency.set(fromKey, neighbors);
    }
    const existing = neighbors.get(toKey);
    if (existing === undefined || weight < existing) {
        neighbors.set(toKey, weight);
    }
};

/** Builds an undirected weighted graph from raw line geometries. */
const buildGraphFromLines = (lines: Coordinate[][]) => {
    const adjacency = new Map<string, Map<string, number>>();
    const nodeCoords = new Map<string, Coordinate>();
    const lineNodeKeys: string[][] = [];

    lines.forEach((coords) => {
        const nodeKeys: string[] = [];
        for (let i = 0; i < coords.length; i++) {
            const coord = coords[i];
            const key = coordKey(coord);
            if (!nodeCoords.has(key)) nodeCoords.set(key, coord);
            nodeKeys.push(key);

            if (i === coords.length - 1) continue;
            const nextCoord = coords[i + 1];
            const nextKey = coordKey(nextCoord);
            if (!nodeCoords.has(nextKey)) nodeCoords.set(nextKey, nextCoord);

            const weight = Math.hypot(nextCoord[0] - coord[0], nextCoord[1] - coord[1]);
            addEdge(adjacency, key, nextKey, weight);
            addEdge(adjacency, nextKey, key, weight);
        }
        lineNodeKeys.push(nodeKeys);
    });

    return { adjacency, nodeCoords, lineNodeKeys };
};

const getClosestNodeKey = (nodeKeys: string[], nodeCoords: Map<string, Coordinate>, reference: Coordinate) => {
    let closestKey: string | null = null;
    let minDistance = Number.POSITIVE_INFINITY;

    for (const key of nodeKeys) {
        const coord = nodeCoords.get(key);
        if (!coord) continue;
        const distance = Math.hypot(reference[0] - coord[0], reference[1] - coord[1]);
        if (distance < minDistance) {
            minDistance = distance;
            closestKey = key;
        }
    }

    return closestKey;
};

/** Binary minimal heap keyed by distance */
class MinHeap {
    private heap: { key: string; dist: number }[] = [];

    get size() {
        return this.heap.length;
    }

    push(key: string, dist: number) {
        const heap = this.heap;
        heap.push({ key, dist });
        let i = heap.length - 1;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (heap[parent].dist <= heap[i].dist) break;
            [heap[parent], heap[i]] = [heap[i], heap[parent]];
            i = parent;
        }
    }

    pop() {
        const heap = this.heap;
        const top = heap[0];
        const last = heap.pop()!;
        if (heap.length > 0) {
            heap[0] = last;
            let i = 0;
            const n = heap.length;
            for (;;) {
                const left = 2 * i + 1;
                const right = 2 * i + 2;
                let smallest = i;
                if (left < n && heap[left].dist < heap[smallest].dist) smallest = left;
                if (right < n && heap[right].dist < heap[smallest].dist) smallest = right;
                if (smallest === i) break;
                [heap[smallest], heap[i]] = [heap[i], heap[smallest]];
                i = smallest;
            }
        }
        return top;
    }
}

/** Dijkstra from https://github.com/Viglino/ol-ext/blob/master/src/geom/Dijkstra.js
 * without direction function
 * **/
const computeShortestPath = (adjacency: Map<string, Map<string, number>>, nodeCoords: Map<string, Coordinate>, startKey: string, endKey: string) => {
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const heap = new MinHeap();

    distances.set(startKey, 0);
    heap.push(startKey, 0);

    while (heap.size > 0) {
        const { key: currentKey, dist: currentDistance } = heap.pop();
        // Skip if a shortest path has already been found
        if (currentDistance > (distances.get(currentKey) ?? Number.POSITIVE_INFINITY)) continue;
        if (currentKey === endKey) break;

        const neighbors = adjacency.get(currentKey);
        if (!neighbors) continue;

        neighbors.forEach((weight, neighborKey) => {
            const nextDistance = currentDistance + weight;
            if (nextDistance < (distances.get(neighborKey) ?? Number.POSITIVE_INFINITY)) {
                distances.set(neighborKey, nextDistance);
                previous.set(neighborKey, currentKey);
                heap.push(neighborKey, nextDistance);
            }
        });
    }

    if ((distances.get(endKey) ?? Number.POSITIVE_INFINITY) === Number.POSITIVE_INFINITY) return null;

    const pathKeys: string[] = [];
    let current: string | null = endKey;
    while (current) {
        pathKeys.unshift(current);
        current = previous.get(current) ?? null;
    }

    if (pathKeys.length === 0) return null;
    return pathKeys.map((key) => nodeCoords.get(key)).filter(Boolean) as Coordinate[];
};

/** End-to-end shortest path resolution */
export const solveShortestPath = (request: ShortestPathRequest): Coordinate[] | null => {
    const { lines, startLineIndices, endLineIndices, startRef, endRef } = request;
    const { adjacency, nodeCoords, lineNodeKeys } = buildGraphFromLines(lines);

    const startKeys = startLineIndices.flatMap((i) => lineNodeKeys[i] ?? []);
    const endKeys = endLineIndices.flatMap((i) => lineNodeKeys[i] ?? []);

    const startKey = getClosestNodeKey(startKeys, nodeCoords, startRef);
    const endKey = getClosestNodeKey(endKeys, nodeCoords, endRef);
    if (!startKey || !endKey) return null;

    return computeShortestPath(adjacency, nodeCoords, startKey, endKey);
};
