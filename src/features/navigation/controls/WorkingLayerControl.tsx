import { useEffect, useCallback, useMemo, memo } from "react";
import { useCommunityStore, useLocalStorageStore, useMapStore } from "@/store";
import BaseLayer from "ol/layer/Base";

import { REPORTS_LAYER_TYPE } from "@/constants/reports/utils";
import { useTranslation } from "@/i18n";
import Select from "@codegouvfr/react-dsfr/Select";
import Tooltip from "@mui/material/Tooltip";
import Fade from "@mui/material/Fade";
import { CommunityLayerRoleType } from "@/constants/communities/types";

const WorkingLayerControl = () => {
    const { community, mapLayers, communityLayers } = useCommunityStore();
    const { map, mapSwitcher, mapWorkingLayer, showMapWorkingLayerSelect, setMapWorkingLayer, setShowMapWorkingLayerSelect } = useMapStore();
    const { localStorageData, setLocalStorage } = useLocalStorageStore();

    const { t } = useTranslation({ WorkingLayerControl });

    const reportLayer = useMemo(() => mapLayers.find((layer) => layer.name === REPORTS_LAYER_TYPE), [mapLayers]);

    const workingLayers = useMemo(() => {
        const layers = mapLayers
            ?.filter((l) => l !== reportLayer)
            .map((layer) => {
                const communityLayer = communityLayers?.find((lr) => lr?.geoservice?.layer === layer.name);
                return {
                    value: layer.name,
                    label: `${layer.title} ${communityLayer?.role === CommunityLayerRoleType.VISU ? `[${t("read_only")}]` : ""}`,
                };
            })
            .sort((l1, l2) => l1.label.localeCompare(l2.label));
        if (reportLayer) layers.push({ value: reportLayer?.name, label: reportLayer?.title });
        return layers;
    }, [mapLayers, reportLayer, communityLayers, t]);

    const getLayerVisibilityButton = useCallback((olLayer: BaseLayer) => {
        // Use open layer id instead of our layer name
        const gpLayerId = (olLayer as unknown as { gpLayerId?: number }).gpLayerId;
        if (gpLayerId === undefined) return null;

        const switcherControl = document.querySelector('div[id^="GPlayerSwitcher-"]');
        return switcherControl?.querySelector(`button[id^='GPvisibilityPicto_ID_${gpLayerId}-']`);
    }, []);

    const refreshLayerSwitcherState = useCallback(() => {
        mapSwitcher?.changed();
        map?.render();
    }, [map, mapSwitcher]);

    const layerSwitcherButton = document.querySelector("button[id^='GPshowLayersListPicto-']");

    const handleLayerSwitcherClick = useCallback(() => {
        if (layerSwitcherButton?.getAttribute("aria-pressed") === "true") {
            setShowMapWorkingLayerSelect(false);
        } else {
            setShowMapWorkingLayerSelect(true);
        }
    }, [layerSwitcherButton, setShowMapWorkingLayerSelect]);

    const handleLayerSwitcherMouseOver = useCallback(() => {
        if (layerSwitcherButton?.getAttribute("aria-pressed") === "false") {
            setShowMapWorkingLayerSelect(false);
        }
    }, [layerSwitcherButton, setShowMapWorkingLayerSelect]);

    const handleLayerSwitcherMouseLeave = useCallback(() => {
        if (layerSwitcherButton?.getAttribute("aria-pressed") === "false") {
            setShowMapWorkingLayerSelect(true);
        }
    }, [layerSwitcherButton, setShowMapWorkingLayerSelect]);

    useEffect(() => {
        if (!mapWorkingLayer && workingLayers[0]) {
            let initWorkingLayer = localStorageData?.activeLayer;
            if (!initWorkingLayer) initWorkingLayer = workingLayers[0].value;
            setMapWorkingLayer(initWorkingLayer);
        }
    }, [mapWorkingLayer, workingLayers, localStorageData, setMapWorkingLayer]);

    useEffect(() => {
        if (!mapWorkingLayer || !map) return;

        const mapLayer = map
            .getLayers()
            .getArray()
            .find((layer) => layer.get("name") === mapWorkingLayer || layer.get("type") === mapWorkingLayer);

        if (!mapLayer) return;

        if (!mapLayer.getVisible()) {
            const visibilityButton = getLayerVisibilityButton(mapLayer);
            if (visibilityButton instanceof HTMLButtonElement) {
                visibilityButton.click();
            } else {
                mapLayer.setVisible(true);
            }
        }

        refreshLayerSwitcherState();
    }, [getLayerVisibilityButton, map, mapWorkingLayer, refreshLayerSwitcherState]);

    useEffect(() => {
        if (layerSwitcherButton) {
            layerSwitcherButton.addEventListener("click", handleLayerSwitcherClick);
            layerSwitcherButton.addEventListener("mouseover", handleLayerSwitcherMouseOver);
            layerSwitcherButton.addEventListener("mouseleave", handleLayerSwitcherMouseLeave);
        }
        return () => {
            if (layerSwitcherButton) {
                layerSwitcherButton.removeEventListener("click", handleLayerSwitcherClick);
                layerSwitcherButton.removeEventListener("mouseover", handleLayerSwitcherMouseOver);
                layerSwitcherButton.removeEventListener("mouseleave", handleLayerSwitcherMouseLeave);
            }
        };
    }, [layerSwitcherButton, handleLayerSwitcherClick, handleLayerSwitcherMouseOver, handleLayerSwitcherMouseLeave]);

    const handleWorkingLayerChange = useCallback(
        (value: string) => {
            if (!community) return;
            if (localStorageData) {
                const newLocalData = { ...localStorageData, activeLayer: value };
                setLocalStorage(community?.name, newLocalData);
            }

            setMapWorkingLayer(value);
        },
        [community, localStorageData, setLocalStorage, setMapWorkingLayer]
    );

    if (!showMapWorkingLayerSelect) return null;

    return (
        <Tooltip placement="left" arrow title={t("working_layer")} slots={{ transition: Fade }} enterDelay={0} leaveDelay={0}>
            <div className="map-toolbar-bottom-select">
                <Select
                    label=""
                    nativeSelectProps={{
                        value: mapWorkingLayer,
                        onChange: (e) => handleWorkingLayerChange(e.target.value),
                    }}
                >
                    {workingLayers?.map((option, index) => (
                        <option key={`working-layer-${index}`} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </Select>
                <div className="separator"></div>
            </div>
        </Tooltip>
    );
};

export default memo(WorkingLayerControl);
