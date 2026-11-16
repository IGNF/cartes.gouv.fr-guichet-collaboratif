import PanelDOM from "geopf-extensions-openlayers/src/packages/Controls/PanelDOM";
import { EventTypes } from "ol/Observable";
import Layer from "ol/layer/Layer";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { LAYER_FEATURE_TYPE } from "@/constants";
import { CommunityLayer } from "@/constants/communities/types";
import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { useTranslation } from "@/i18n";
import { useCommunityStore, useMapStore } from "@/store";
import FeatureTypeLayerLegends from "./FeatureTypeLayerLegends";
import ReportLegends from "./ReportLegends";

interface LayerSwitcherEditEvent {
    layer: Layer;
}

interface ActiveSymbology {
    layer: Layer;
    container: HTMLElement;
    content: HTMLElement;
    communityLayer?: CommunityLayer;
}

export default function LayerSymbologyPanel() {
    const { communityLayers } = useCommunityStore();
    const { mapSwitcher } = useMapStore();
    const [active, setActive] = useState<ActiveSymbology>();
    const activeRef = useRef<ActiveSymbology | undefined>(undefined);
    const { t } = useTranslation({ FeatureTypeLayerLegends });

    const setActiveSymbology = useCallback((symbology?: ActiveSymbology) => {
        activeRef.current = symbology;
        setActive(symbology);
    }, []);

    const closePanel = useCallback(() => {
        const container = activeRef.current?.container;
        if (!container) return;

        const panel = container.closest("dialog");
        panel?.classList.remove("GPlayerStylePanelOpened", "gpf-visible");
        panel?.classList.add("GPlayerStylePanelClosed", "gpf-hidden");
        container.remove();
        setActiveSymbology(undefined);
    }, [setActiveSymbology]);

    const closeInfoPanel = useCallback(() => {
        const panel = mapSwitcher?.element.querySelector<HTMLElement>('dialog[id^="GPlayerInfoPanel"]');
        panel?.classList.remove("GPlayerInfoPanelOpened", "gpf-visible");
        panel?.classList.add("GPlayerInfoPanelClosed", "gpf-hidden");
        mapSwitcher?.element.querySelectorAll(".GPlayerInfoOpened").forEach((button) => {
            button.classList.replace("GPlayerInfoOpened", "GPlayerInfoClosed");
        });
    }, [mapSwitcher]);

    useEffect(() => {
        const handleEdit = (event: unknown) => {
            const layer = (event as LayerSwitcherEditEvent).layer;
            const type = layer.get("type");
            if (type !== LAYER_FEATURE_TYPE && type !== REPORTS_LAYER_TYPE) return;

            const communityLayer =
                type === LAYER_FEATURE_TYPE
                    ? communityLayers?.find((candidate) => candidate.type === LAYER_FEATURE_TYPE && candidate.geoservice.layer === layer.get("name"))
                    : undefined;
            if (type === LAYER_FEATURE_TYPE && !communityLayer) return;

            const panel = mapSwitcher?.element.querySelector<HTMLElement>('dialog[id^="GPlayerStylePanel"]');
            const body = panel?.querySelector<HTMLElement>(":scope > .gpf-panel__body");
            if (!panel || !body || !mapSwitcher) return;

            const isOpenForLayer = activeRef.current?.layer === layer && panel.classList.contains("GPlayerStylePanelOpened");
            closePanel();
            if (isOpenForLayer) return;

            closeInfoPanel();
            body.replaceChildren();

            const header = PanelDOM._createPanelHeaderElement.call(mapSwitcher, {
                icon: "ign-layerswitcher",
                title: t("symbology"),
            });
            const closeButton = header.querySelector<HTMLButtonElement>(".GPpanelClose");
            closeButton?.addEventListener("click", closePanel);

            const content = document.createElement("div");
            content.id = panel.id.replace("GPlayerStylePanel", "GPlayerStyleContent");
            content.className = "layer-symbology-content gpf-panel__content fr-modal__content";

            const container = document.createElement("div");
            container.className = "layer-symbology";
            container.append(header, content);
            body.appendChild(container);

            panel.classList.remove("GPlayerStylePanelClosed", "gpf-hidden");
            panel.classList.add("GPlayerStylePanelOpened", "gpf-visible");
            setActiveSymbology({ layer, container, content, communityLayer });
        };

        mapSwitcher?.on("layerswitcher:edit" as EventTypes, handleEdit);

        return () => {
            mapSwitcher?.un("layerswitcher:edit" as EventTypes, handleEdit);
        };
    }, [closeInfoPanel, closePanel, communityLayers, mapSwitcher, setActiveSymbology, t]);

    useEffect(() => {
        const handleInfoClick = (event: MouseEvent) => {
            const target = event.target;
            if (!(target instanceof Element) || !target.closest('[id^="GPinfo_ID_"]')) return;
            closePanel();
        };

        mapSwitcher?.element.addEventListener("click", handleInfoClick, { capture: true });
        return () => mapSwitcher?.element.removeEventListener("click", handleInfoClick, { capture: true });
    }, [closePanel, mapSwitcher]);

    useEffect(() => () => closePanel(), [closePanel]);

    if (!active) return null;

    return createPortal(
        active.communityLayer ? (
            <FeatureTypeLayerLegends key={active.communityLayer.id} communityLayer={active.communityLayer} onClose={closePanel} />
        ) : (
            <ReportLegends />
        ),
        active.content
    );
}
