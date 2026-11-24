import { useEffect } from "react";
import { Feature } from "ol";
import VectorSource from "ol/source/Vector";
import { getFeatureGeometryWKT } from "@/constants/utils";
import { useReportStore } from "@/store";

const SKETCH_SOURCE_EVENTS = ["addfeature", "removefeature", "changefeature"] as const;

// Geometries and labels only: tools swap styles on mere selection or hover, so style is not a reliable sign of an edit
const getSketchSignature = (features: Feature[]) => features.map((f) => `${getFeatureGeometryWKT(f)}|${f.get("name") ?? ""}`).join(";");

/**
 * Flags in the report store that the sketch was modified since edit mode was opened.
 */
export default function useSketchUnsavedChanges(drawingSource: VectorSource | undefined, active: boolean) {
    const setSketchUnsaved = useReportStore((state) => state.setSketchUnsaved);

    useEffect(() => {
        if (!active || !drawingSource) return;

        const initial = getSketchSignature(drawingSource.getFeatures());
        const handleSourceChange = () => setSketchUnsaved(getSketchSignature(drawingSource.getFeatures()) !== initial);

        SKETCH_SOURCE_EVENTS.forEach((type) => drawingSource.on(type, handleSourceChange));
        return () => {
            SKETCH_SOURCE_EVENTS.forEach((type) => drawingSource.un(type, handleSourceChange));
            setSketchUnsaved(false);
        };
    }, [active, drawingSource, setSketchUnsaved]);
}
