import { useCallback } from "react";
import { createEmpty, extend } from "ol/extent";
import { Feature } from "ol";
import { Map } from "ol";
import VectorSource from "ol/source/Vector";
import { showClusterFeatures } from "@/constants/reports/utils/cluster";

interface UseClusterClickHandlerProps {
    map: Map | null;
    reportClusterSource: VectorSource;
}

export const useClusterClickHandler = (props: UseClusterClickHandlerProps) => {
    const { map, reportClusterSource } = props;

    return useCallback(
        (clusterFeature: Feature): boolean => {
            if (!map) return false;

            const clusterMembers = clusterFeature.get("features");
            if (!clusterMembers || clusterMembers.length <= 1) return false;

            const view = map.getView();
            const currentZoom = view.getZoom();
            const maxZoom = view.getMaxZoom();
            const resolution = view.getResolution();

            if (!currentZoom || !maxZoom || !resolution) return false;

            if (currentZoom >= maxZoom) {
                showClusterFeatures(clusterFeature, resolution, reportClusterSource);
                return true;
            }
            const extent = createEmpty();
            clusterMembers.forEach((feature: Feature) => {
                const geom = feature.getGeometry();
                if (geom) {
                    extend(extent, geom.getExtent());
                }
            });

            const center = view.getCenter();
            if (!center) return false;

            const extentCenter = [(extent[2] + extent[0]) / 2, (extent[3] + extent[1]) / 2];
            const dx = extentCenter[0] - center[0];
            const dy = extentCenter[1] - center[1];
            const distance = Math.sqrt(dx * dx + dy * dy);

            const duration = Math.min(Math.max(distance * 2, 300), 1000);

            const targetZoom = Math.min(currentZoom + 2, maxZoom);

            view.animate({
                center: extentCenter,
                zoom: targetZoom,
                duration,
            });

            return true;
        },
        [map, reportClusterSource]
    );
};
