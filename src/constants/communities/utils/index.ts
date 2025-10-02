import { ComponentKey } from "@/i18n/types";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { ArrayGeoJSONProps, CommunityGeoservice, GeoJSONProps } from "../types";

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

export const arrayToGeoJSON = (arr: ArrayGeoJSONProps[], geoservice: CommunityGeoservice) => {
    const features = {
        type: "FeatureCollection",
        features: arr.map((el) => {
            let type = "Point";
            let lonLat =
                el.geometrie
                    ?.replace(/POINT|\(|\)/g, "")
                    .split(",")
                    .map((s1: string) => s1.split(" ").map((w) => Number(w))) || [];
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
                    featureType: geoservice.featureType,
                    ...featureTypeData,
                },
            };
        }),
    };
    return features;
};

export const getGeoJSONProps = (arr: GeoJSONProps, geoservice: CommunityGeoservice) => {
    return {
        type: arr.type,
        features: arr.features.map((e) => {
            const featureTypeData = { ...(typeof e.properties === "object" && e.properties !== null ? e.properties : {}) };
            return {
                ...e,
                properties: {
                    featureTypeData: featureTypeData,
                    geoservice: geoservice.featureType ? geoservice : undefined,
                    featureType: geoservice.featureType,
                    ...featureTypeData,
                },
            };
        }),
    };
};

export const jsonToHtmlList = (data: object): string => {
    if (Array.isArray(data)) {
        return `<ul class="feature-type-form-table_ul">${data.map((item) => `<li>${jsonToHtmlList(item)}</li>`).join("")}</ul>`;
    } else if (typeof data === "object" && data !== null) {
        return `<ul class="feature-type-form-table_ul">${Object.entries(data)
            .map(([key, value]) => `<li><strong>${key}:</strong> ${jsonToHtmlList(value)}</li>`)
            .join("")}</ul>`;
    } else {
        return String(data);
    }
};
