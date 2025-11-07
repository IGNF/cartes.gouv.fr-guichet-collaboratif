import { ComponentKey } from "@/i18n/types";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { ArrayGeoJSONProps, CommunityGeoservice, GeoJSONProps, LonLatNumber, ObjectProps } from "../types";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY } from "@/constants";

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

    if (controlButton) {
        controlButton.setAttribute("aria-label", t("control_layer_swticher_aria_label"));
        controlButton.classList.add("gpf-btn--primary", "fr-btn--primary");
        controlButton.classList.remove("gpf-btn--tertiary", "fr-btn--tertiary");
    }
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

export const getValideProperties = (featureTypeData: ObjectProps) => {
    const validProperties: ObjectProps = {};
    Object.keys(featureTypeData).forEach((key: string) => {
        let value = featureTypeData[key];
        if (typeof value === "boolean") {
            value = value ? 1 : 0;
        }
        if (value === null) return;
        if (isDateFormat(value as string)) value = new Date(value as string).getTime();
        validProperties[key] = value;
    });
    return validProperties;
};

export const arrayToGeoJSON = (arr: ArrayGeoJSONProps[], geoservice: CommunityGeoservice) => {
    const features: GeoJSONProps = {
        type: "FeatureCollection",
        features: [],
    };
    arr.forEach((el) => {
        let type = "Point";
        let lonLat: LonLatNumber = el.geometrie
            ?.replace(/POINT|MULTIPOLYGON|MULTILINE|LINESTRING|\(|\)/g, "")
            .split(",")
            .map((s1: string) =>
                s1.split(" ").map((w) => {
                    return Number(w);
                })
            ) || [0, 0];
        if (el.geometrie?.includes("MULTIPOLYGON")) {
            lonLat = [[lonLat as number[]]];
            type = "MultiPolygon";
        }
        if (el.geometrie?.includes("MULTILINE") || el.geometrie?.includes("LINESTRING")) {
            type = "LineString";
        }
        if (el.geometrie?.includes("POINT")) {
            lonLat = (lonLat as number[])[0];
        }

        const featureTypeData: ObjectProps = { ...el, id: el.id ?? el.cleabs };
        delete featureTypeData.geometrie;

        const validProperties: ObjectProps = getValideProperties(featureTypeData);

        const properties: { [key: string]: string | number | object | null | undefined } = {
            featureType: geoservice.featureType,
            ...validProperties,
        };

        properties[FEATURE_TYPE_DATA_PROPERTY] = featureTypeData;
        properties[FEATURE_TYPE_GEOSERVICE_PROPERTY] = geoservice.featureType ? geoservice : undefined;

        features.features.push({
            type: "Feature",
            id: el.cleabs,
            geometry: {
                type: type,
                coordinates: lonLat,
            },
            geometry_name: "geometrie",
            properties,
        });
    });
    return features;
};

export const getGeoJSONProps = (arr: GeoJSONProps, geoservice: CommunityGeoservice) => {
    return {
        type: arr.type,
        features: arr.features.map((e) => {
            const featureTypeData: ObjectProps = {
                ...(typeof e.properties === "object" && e.properties !== null ? e.properties : {}),
                id: e.id ?? e.cleabs,
            };

            const validProperties: ObjectProps = getValideProperties(featureTypeData);

            const properties: { [key: string]: string | number | object | null | undefined } = {
                featureType: geoservice.featureType,
                ...validProperties,
            };

            properties[FEATURE_TYPE_DATA_PROPERTY] = featureTypeData;
            properties[FEATURE_TYPE_GEOSERVICE_PROPERTY] = geoservice.featureType ? geoservice : undefined;
            return {
                ...e,
                properties,
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

export const isDateFormat = (value: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return typeof value === "string" && regex.test(value);
};
