import Map from "ol/Map";

// Defines slots
export enum MapOverlaySlot {
    COMMUNITY_TOOLBAR = "community-toolbar",
    WORKING_LAYER = "working-layer",
    CUSTOM_CONTROLS = "custom-controls",
    BETA_BADGE = "beta-badge",
}

const SLOT_ATTRIBUTE = "data-map-overlay-slot";
const SLOT_CLASS_NAME = "map-overlay-slot";

export const getMapOverlaySlot = (map: Map, slot: MapOverlaySlot): HTMLElement | null =>
    map.getOverlayContainerStopEvent()?.querySelector<HTMLElement>(`[${SLOT_ATTRIBUTE}="${slot}"]`) ?? null;

const createMapOverlaySlot = (slot: MapOverlaySlot): HTMLElement => {
    const element = document.createElement("div");
    element.className = SLOT_CLASS_NAME;
    element.setAttribute(SLOT_ATTRIBUTE, slot);
    return element;
};

/** Creates overlay slots and orders map controls after initialization. */
export const orderMapOverlayContainer = (map: Map) => {
    const container = map.getOverlayContainerStopEvent();
    if (!container) return;

    const slot = (name: MapOverlaySlot) => getMapOverlaySlot(map, name) ?? createMapOverlaySlot(name);
    const positionContainer = (position: string) => container.querySelector<HTMLElement>(`:scope > #position-container-${position}`);

    const orderedElements = [
        slot(MapOverlaySlot.COMMUNITY_TOOLBAR),
        slot(MapOverlaySlot.WORKING_LAYER),
        positionContainer("top-right"),
        slot(MapOverlaySlot.CUSTOM_CONTROLS),
        positionContainer("bottom-right"),
        positionContainer("bottom-left"),
        slot(MapOverlaySlot.BETA_BADGE),
    ].filter((element): element is HTMLElement => element !== null);

    // append() moves already attached elements: they end up last, in this order
    container.append(...orderedElements);
};
