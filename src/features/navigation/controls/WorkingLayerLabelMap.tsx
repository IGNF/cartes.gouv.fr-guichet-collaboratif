import { useCommunityStore, useMapStore } from "@/store";

import { useTranslation } from "@/i18n";
import { useEffect, useMemo, useState } from "react";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";

let timer: ReturnType<typeof setTimeout> | undefined;

const WorkingLayerLabelMap = () => {
    const { communityLayers } = useCommunityStore();
    const { mapWorkingLayer } = useMapStore();

    const [rightStyle, setRightStyle] = useState(0);

    const scaleControlDiv = document.querySelector(".ol-scale-line.ol-unselectable");

    const mapWorkingGeoservice = useMemo(
        () => communityLayers?.find((layer) => layer?.geoservice?.layer === mapWorkingLayer)?.geoservice,
        [mapWorkingLayer, communityLayers]
    );

    let workingLayerTitle = mapWorkingGeoservice?.title;

    if (mapWorkingLayer === REPORTS_LAYER_TYPE) {
        workingLayerTitle = "Signalements";
    }

    const { t } = useTranslation({ WorkingLayerLabelMap });

    const observer = useMemo(
        () =>
            new ResizeObserver((entries) => {
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => {
                    setRightStyle(entries[0].contentRect.width);
                }, 50);
            }),
        []
    );

    useEffect(() => {
        if (scaleControlDiv) {
            observer.observe(scaleControlDiv);
        }

        return () => {
            if (scaleControlDiv) {
                observer.unobserve(scaleControlDiv);
            }
        };
    }, [scaleControlDiv, observer]);

    return (
        <div className="working-layer-label-map" style={{ right: 72 + rightStyle, height: scaleControlDiv?.clientHeight || 32 }}>
            {t("working_layer")} {workingLayerTitle}
        </div>
    );
};

export default WorkingLayerLabelMap;
