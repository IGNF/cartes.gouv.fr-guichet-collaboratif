import Layer from "ol/layer/Layer";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import { unByKey } from "ol/Observable";

export const LAYER_RENDER_HANDOVER_TIMEOUT_MS = 1000;

/**
 * Calls `onRendered` once `layer` has drawn the state its source has now, from inside that frame's `postrender`,
 * so canvas overlays changed in the callback switch in the same frame.
 * A canvas layer redraws synchronously: the callback runs immediately.
 */
export function onceLayerRendered(layer: Layer | undefined, onRendered: () => void, timeoutMs: number = LAYER_RENDER_HANDOVER_TIMEOUT_MS): () => void {
    if (!(layer instanceof WebGLVectorLayer) || !layer.getVisible()) {
        onRendered();
        return () => {};
    }

    let sourceRevision: number | undefined;
    let layerRevision = layer.getRevision();

    const stop = () => {
        unByKey(key);
        clearTimeout(timer);
    };
    const finish = () => {
        stop();
        onRendered();
    };

    const key = layer.on("postrender", () => {
        const currentSourceRevision = layer.getSource()?.getRevision();
        if (currentSourceRevision !== sourceRevision) {
            // This frame started a rebuild with the latest source state
            sourceRevision = currentSourceRevision;
            layerRevision = layer.getRevision();
            return;
        }
        if (layer.getRevision() > layerRevision) finish();
    });
    const timer = setTimeout(finish, timeoutMs);

    return stop;
}
