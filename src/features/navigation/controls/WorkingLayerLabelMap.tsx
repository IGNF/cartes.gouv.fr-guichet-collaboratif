import { useCommunityStore, useMapStore } from "@/store";

import { useTranslation } from "@/i18n";
import { useEffect, useMemo, useState } from "react";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";

const WorkingLayerLabelMap = () => {
    const { communityLayers } = useCommunityStore();
    const { mapWorkingLayer } = useMapStore();

    const [rightStyle, setRightStyle] = useState(0);
    const [scaleControlHeight, setScaleControlHeight] = useState(32);

    const mapWorkingGeoservice = useMemo(
        () => communityLayers?.find((layer) => layer?.geoservice?.layer === mapWorkingLayer)?.geoservice,
        [mapWorkingLayer, communityLayers]
    );

    let workingLayerTitle = mapWorkingGeoservice?.title;

    if (mapWorkingLayer === REPORTS_LAYER_TYPE) {
        workingLayerTitle = "Signalements";
    }

    const { t } = useTranslation({ WorkingLayerLabelMap });

    useEffect(() => {
        const scaleControlElement = document.querySelector(".ol-scale-line.ol-unselectable") as HTMLElement | null;
        if (!scaleControlElement) return;

        let timer: ReturnType<typeof setTimeout> | undefined;
        const observer = new ResizeObserver((entries) => {
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => {
                const nextRect = entries[0].contentRect;
                setRightStyle(nextRect.width);
                setScaleControlHeight(nextRect.height || 32);
            }, 50);
        });

        observer.observe(scaleControlElement);

        return () => {
            observer.unobserve(scaleControlElement);
            if (timer) clearTimeout(timer);
        };
    }, []);

    return (
        <div className="working-layer-label-map" style={{ right: 72 + rightStyle, height: scaleControlHeight }}>
            {t("working_layer")} {workingLayerTitle}
        </div>
    );
};

export default WorkingLayerLabelMap;
