import { solveShortestPath, type ShortestPathRequest } from "./shortestPathCore";
import type { Coordinate } from "ol/coordinate";

export interface ShortestPathWorkerRequest extends ShortestPathRequest {
    id: number;
}

export interface ShortestPathWorkerResponse {
    id: number;
    path: Coordinate[] | null;
}

self.onmessage = (event: MessageEvent<ShortestPathWorkerRequest>) => {
    const { id, ...request } = event.data;
    let path: Coordinate[] | null;
    try {
        path = solveShortestPath(request);
    } catch {
        path = null;
    }
    const response: ShortestPathWorkerResponse = { id, path };
    (self as unknown as Worker).postMessage(response);
};
