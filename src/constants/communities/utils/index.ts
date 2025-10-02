import { ComponentKey } from "@/i18n/types";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { ArrayGeoJSONProps, CommunityGeoservice, FeatureTypeSelectedStyle, GeoJSONProps } from "../types";
import { hexToRgba } from "@/constants/styles";

export const translateLayerSwitcherControl = (t: TranslationFunction<"useGetMapControls", ComponentKey>) => {
    const switcherControl = document.querySelector('div[id^="GPlayerSwitcher-"]');
    const controlButton = switcherControl?.querySelector('button[id^="GPshowLayersListPicto-"]');
    const controlPanelTitle = switcherControl?.querySelector('div[id^="GPlayersHeaderTitle-"]');
    const controlPanelIcon = switcherControl?.querySelector("label.GPpanelIcon");
    const controlPanelClose = switcherControl?.querySelector('button[id^="GPlayersPanelClose-"]');
    const constrolIconsRemove = switcherControl?.querySelectorAll('button[id^="GPremove_ID_"]');
    const constrolIconsEdit = switcherControl?.querySelectorAll('button[id^="GPedit_ID_"]');
    const constrolIconsInfo = switcherControl?.querySelectorAll('button[id^="GPinfo_ID_"]');
    const constrolIconsAdvancedTools = switcherControl?.querySelectorAll('button[id^="GPshowAdvancedTools_ID_"]');
    const constrolIconsDragAndDrop = switcherControl?.querySelectorAll('div[id^="GPdragndropPicto_ID_"]');
    const constrolIconsVisibility = switcherControl?.querySelectorAll('button[id^="GPvisibilityPicto_ID_"]');
    const constrolIconsExtent = switcherControl?.querySelectorAll('button[id^="GPextent_ID_"]');
    const constrolIconsOpacity = switcherControl?.querySelectorAll('div[id^="GPopacity_ID_"]');

    if (controlButton) controlButton.setAttribute("aria-label", t("control_layer_swticher_aria_label"));
    if (controlPanelTitle) controlPanelTitle.innerHTML = t("control_layer_swticher_pannel_title");
    if (controlPanelIcon) controlPanelIcon.setAttribute("title", t("control_layer_swticher_pannel_title"));
    if (controlPanelClose) {
        controlPanelClose.setAttribute("title", t("close_panel_title"));
        controlPanelClose.firstElementChild!.innerHTML = t("close_panel_text");
    }

    if (constrolIconsRemove) {
        for (let index = 0; index < constrolIconsRemove?.length; index++) {
            constrolIconsRemove[index].setAttribute("title", t("control_layer_swticher_pannel_icon_title_remove"));
            constrolIconsEdit![index]?.setAttribute("title", t("control_layer_swticher_pannel_icon_title_edit"));
            constrolIconsInfo![index]?.setAttribute("title", t("control_layer_swticher_pannel_icon_title_info"));
            constrolIconsAdvancedTools![index]?.setAttribute("title", t("control_layer_swticher_pannel_icon_title_advanced_tools"));
            constrolIconsDragAndDrop![index]?.setAttribute("title", t("control_layer_swticher_pannel_icon_title_drag_drop"));
            constrolIconsVisibility![index]?.setAttribute("title", t("control_layer_swticher_pannel_icon_title_visibility"));
            constrolIconsExtent![index]?.setAttribute("title", t("control_layer_swticher_pannel_icon_title_extent"));
            constrolIconsOpacity![index]?.setAttribute("title", t("control_layer_swticher_pannel_icon_title_opacity"));
        }
    }
};

export const translateZoomControl = (t: TranslationFunction<"useGetMapControls", ComponentKey>) => {
    const zoomInBtn = document.querySelector('button[id="GPzoomIn"]');
    const zoomOutBtn = document.querySelector('button[id="GPzoomOut"]');

    if (zoomInBtn) zoomInBtn.setAttribute("aria-label", t("control_zoom_in"));
    if (zoomOutBtn) zoomOutBtn.setAttribute("aria-label", t("control_zoom_out"));
};

export const translateSearchEngineControl = (t: TranslationFunction<"useGetMapControls", ComponentKey>) => {
    const searchEngineBtn = document.querySelector('button[id^="GPshowSearchEnginePicto-"]');

    if (searchEngineBtn) searchEngineBtn.setAttribute("title", t("control_search_engine_btn"));
};

export const arrayToGeoJSON = (arr: ArrayGeoJSONProps[], geoservice: CommunityGeoservice, featureTypeSelectedStyle: FeatureTypeSelectedStyle[]) => {
    const layerStyle = featureTypeSelectedStyle.find((type) => type.layer === geoservice.layer);
    const defaultStyle = geoservice.styles ? geoservice.styles![0]?.types![0] : null;
    const newStyle = layerStyle ? layerStyle.selectedStyle.types![0] : defaultStyle;
    const features = {
        type: "FeatureCollection",
        features: arr.map((el) => {
            let type = "Point";
            let lonLat =
                el.geometrie
                    ?.replace(/POINT|\(|\)/g, "")
                    .split(",")
                    .map((s1: string) => s1.split(" ").map((w) => Number(w))) || [];
            const style = {
                strokeColor: newStyle ? hexToRgba(newStyle.strokeColor, newStyle.strokeOpacity) : "#fff",
                strokeWidth: newStyle ? newStyle.strokeWidth : 1,
                fillColor: newStyle ? hexToRgba(newStyle.fillColor, newStyle.fillOpacity) : "#fff",
            };
            if (el.geometrie?.includes("MULTIPOLYGON")) {
                lonLat = el.geometrie
                    .replace(/MULTIPOLYGON|\(|\)/g, "")
                    .split(",")
                    .map((s1: string) => s1.split(" ").map((w) => Number(w)));
                type = "MultiPolygon";
            }
            if (el.geometrie?.includes("MULTILINE")) {
                lonLat = el.geometrie
                    .replace(/MULTILINE|\(|\)/g, "")
                    .split(",")
                    .map((s1: string) => s1.split(" ").map((w) => Number(w)));
                type = "LineString";
            }

            const featureTypeData = { ...el };
            delete featureTypeData.geometrie;

            return {
                type: "Feature",
                id: el.cleabs,
                geometry: {
                    type: type,
                    coordinates: lonLat,
                },
                geometry_name: "geometrie",
                properties: {
                    featureTypeData,
                    geoservice: geoservice.featureType ? geoservice : undefined,
                    ...style,
                },
            };
        }),
    };
    return features;
};

export const getGeoJSONProps = (arr: GeoJSONProps, geoservice: CommunityGeoservice, featureTypeSelectedStyle: FeatureTypeSelectedStyle[]) => {
    const layerStyle = featureTypeSelectedStyle.find((type) => type.layer === geoservice.layer);
    const defaultStyle = geoservice.styles ? geoservice.styles![0]?.types![0] : null;
    const newStyle = layerStyle ? layerStyle.selectedStyle.types![0] : defaultStyle;
    return {
        type: arr.type,
        features: arr.features.map((e) => {
            const style = {
                strokeColor: newStyle ? hexToRgba(newStyle.strokeColor, newStyle.strokeOpacity) : "#2b4ae6ff",
                strokeWidth: newStyle ? newStyle.strokeWidth : 1,
                fillColor: newStyle ? hexToRgba(newStyle.fillColor, newStyle.fillOpacity) : "#2724c0ff",
            };
            return {
                ...e,
                properties: {
                    featureTypeData: e.properties,
                    geoservice: geoservice.featureType ? geoservice : undefined,
                    ...style,
                },
            };
        }),
    };
};
