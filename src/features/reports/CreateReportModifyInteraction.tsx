import { useMapStore, useReportStore } from "@/store";
import { Collection } from "ol";
import { Modify } from "ol/interaction";
import { useEffect, useMemo } from "react";

const CreateReportModifyInteraction = () => {
    const { map, setClickedTool } = useMapStore();
    const { selectedFeatures } = useReportStore();

    const mainFeature = useMemo(() => selectedFeatures.find((f) => f.get("main")), [selectedFeatures]);
    const modifyInteraction = useMemo(() => new Modify({ features: new Collection([mainFeature!]) }), [mainFeature]);

    useEffect(() => {
        map?.addInteraction(modifyInteraction);
        return () => {
            map?.removeInteraction(modifyInteraction);
        };
    }, [map, modifyInteraction, setClickedTool]);

    return null;
};

export default CreateReportModifyInteraction;
