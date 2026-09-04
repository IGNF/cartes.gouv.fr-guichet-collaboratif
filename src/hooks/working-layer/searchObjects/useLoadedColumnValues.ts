import { FEATURE_TYPE_DATA_PROPERTY } from "@/constants";
import { useMapStore } from "@/store";
import VectorLayer from "ol/layer/Vector";
import WebGLVectorLayer from "ol/layer/WebGLVector";
import VectorSource from "ol/source/Vector";
import { useEffect, useMemo, useState } from "react";
import { MAX_ENUM_SUGGESTIONS } from "@/constants/communities/types";

const useLoadedColumnValues = (columnName: string | undefined): string[] => {
    const { map, mapWorkingLayer } = useMapStore();
    const [version, setVersion] = useState(0);

    const clickableSource = useMemo(() => {
        const layer = map?.getAllLayers().find((l) => l.get("name") === mapWorkingLayer && (l instanceof VectorLayer || l instanceof WebGLVectorLayer));
        return layer?.getSource() as VectorSource | undefined;
    }, [map, mapWorkingLayer]);

    useEffect(() => {
        if (!clickableSource) return;

        const onSourceChange = () => setVersion((v) => v + 1);
        clickableSource.on("addfeature", onSourceChange);
        clickableSource.on("changefeature", onSourceChange);
        clickableSource.on("removefeature", onSourceChange);
        clickableSource.on("clear", onSourceChange);

        return () => {
            clickableSource.un("addfeature", onSourceChange);
            clickableSource.un("changefeature", onSourceChange);
            clickableSource.un("removefeature", onSourceChange);
            clickableSource.un("clear", onSourceChange);
        };
    }, [clickableSource]);

    return useMemo(() => {
        if (!columnName || !clickableSource) return [];

        const distinctValues = new Set<string>();
        for (const feature of clickableSource.getFeatures()) {
            const data = feature.get(FEATURE_TYPE_DATA_PROPERTY) as Record<string, unknown> | undefined;
            const value = data?.[columnName];
            if (value === null || value === undefined || value === "") continue;
            distinctValues.add(String(value));
            if (distinctValues.size >= MAX_ENUM_SUGGESTIONS) break;
        }

        return Array.from(distinctValues).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [columnName, clickableSource, version]);
};

export default useLoadedColumnValues;
