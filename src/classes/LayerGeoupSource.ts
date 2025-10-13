import LayerGroup from "ol/layer/Group";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";

export class LayerGroupSource extends LayerGroup {
    constructor(options: {
        layers: (VectorLayer | WebGLVectorLayer)[];
        properties: { title: string; type: string; description: string; source: VectorSource | null };
    }) {
        super(options);
    }

    getSource(): VectorSource | null {
        const firstLayer = this.getLayers().item(0);
        return (firstLayer as WebGLVectorLayer)?.getSource?.();
    }

    setSource(source: VectorSource): void {
        const firstLayer = this.getLayers().item(0);
        if (firstLayer && "setSource" in firstLayer) {
            (firstLayer as WebGLVectorLayer).setSource(source);
        }
    }
}
