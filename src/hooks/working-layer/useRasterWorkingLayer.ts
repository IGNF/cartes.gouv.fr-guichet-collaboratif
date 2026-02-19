import { useMemo } from "react";
import { useCommunityStore } from "@/store/useCommunityStore";
import { useMapStore } from "@/store";

export function useRasterWorkingLayer() {
    const { map, mapWorkingLayer } = useMapStore();
    const { communityLayers } = useCommunityStore();

    const currentGeoservice = useMemo(
        () => communityLayers?.find((layer) => layer?.geoservice?.layer === mapWorkingLayer)?.geoservice,
        [communityLayers, mapWorkingLayer]
    );

    const isRasterLayer = useMemo(() => !!(currentGeoservice && (currentGeoservice.type === "WMS" || currentGeoservice.type === "WMTS")), [currentGeoservice]);

    const isRasterLayerQueryable = useMemo(() => {
        if (!isRasterLayer) return true;
        const rasterOlLayer = map?.getAllLayers().find((layer) => layer.get("name") === mapWorkingLayer);
        return rasterOlLayer?.get("queryable") === true;
    }, [isRasterLayer, map, mapWorkingLayer]);

    return { isRasterLayer, isRasterLayerQueryable };
}
