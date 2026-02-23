import { useCallback } from "react";
import { Feature, MapBrowserEvent } from "ol";
import { Map } from "ol";
import VectorSource from "ol/source/Vector";
import { HIT_DETECTION_TOLERENCE } from "@/constants";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";

interface UsePointerMoveHandlerProps {
    map: Map | null;
    isNotClickable: boolean;
    mapWorkingLayer: string;
    clickableSource: VectorSource;
    selectedFeatures: Feature[];
}

export const usePointerMoveHandler = (props: UsePointerMoveHandlerProps) => {
    const { map, isNotClickable, mapWorkingLayer, clickableSource, selectedFeatures } = props;

    return useCallback(
        (evt: MapBrowserEvent) => {
            if (isNotClickable) return;
            const features = map?.getFeaturesAtPixel(evt.pixel, {
                layerFilter: (layer) => {
                    return layer.get("name") === mapWorkingLayer || layer.get("type") === mapWorkingLayer;
                },
                hitTolerance: HIT_DETECTION_TOLERENCE,
            });

            const feature = features?.find((f) => {
                if (mapWorkingLayer === REPORTS_LAYER_TYPE) {
                    const fCluster = f.get("features");
                    if (fCluster?.length > 1) return fCluster[0];
                    return fCluster?.find((fc: Feature) => fc.get("reportData") || fc.get("new"));
                } else if (clickableSource?.hasFeature(f as Feature)) {
                    return f;
                }
                return null;
            }) as Feature;

            const targetElement = map?.getTargetElement();
            if (targetElement) {
                if (feature) {
                    if (selectedFeatures.length && !selectedFeatures.includes(feature) && selectedFeatures.find((f) => f.get("new"))) {
                        targetElement.style.cursor = "";
                        return;
                    }
                    targetElement.style.cursor = "pointer";
                    return;
                } else {
                    targetElement.style.cursor = "";
                    return;
                }
            }
        },
        [map, isNotClickable, mapWorkingLayer, clickableSource, selectedFeatures]
    );
};
