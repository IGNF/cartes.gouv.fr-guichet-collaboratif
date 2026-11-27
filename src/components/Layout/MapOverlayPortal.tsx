import { PropsWithChildren, useMemo } from "react";
import { createPortal } from "react-dom";

import { getMapOverlaySlot, MapOverlaySlot } from "@/constants/navigation/mapOverlaySlots";
import { useMapStore } from "@/store";

interface MapOverlayPortalProps {
    slot: MapOverlaySlot;
}

/**
 * Renders its children among the map controls (OpenLayers stop-event container),
 * so that the tab order follows the visual reading order. Nothing is rendered until the map exists.
 */
export default function MapOverlayPortal(props: PropsWithChildren<MapOverlayPortalProps>) {
    const { slot, children } = props;
    const map = useMapStore((state) => state.map);
    const target = useMemo(() => (map ? getMapOverlaySlot(map, slot) : null), [map, slot]);

    return target ? createPortal(children, target) : null;
}
