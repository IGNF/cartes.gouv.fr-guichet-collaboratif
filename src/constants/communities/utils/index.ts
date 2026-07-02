import { ComponentKey } from "@/i18n/types";
import { TranslationFunction } from "i18nifty/typeUtils/TranslationFunction";
import { ArrayGeoJSONProps, CommunityGeoservice, GeoJSONProps, LonLatNumber, ObjectProps } from "../types";
import { FEATURE_TYPE_DATA_PROPERTY, FEATURE_TYPE_GEOSERVICE_PROPERTY } from "@/constants";
import { Map } from "ol";
import VectorSource from "ol/source/Vector";
import { Pixel } from "ol/pixel";

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
        if (controlPanelClose.firstElementChild) controlPanelClose.firstElementChild.innerHTML = t("close_panel_text");
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

export const translateZoomControl = (t: TranslationFunction<"ToolsControl", ComponentKey>) => {
    const zoomInBtn = document.querySelector('button[id="GPzoomIn"]');
    const zoomOutBtn = document.querySelector('button[id="GPzoomOut"]');

    if (zoomInBtn) {
        zoomInBtn.setAttribute("aria-label", t("control_zoom_in") || "Zoom In");
    }

    if (zoomOutBtn) {
        zoomOutBtn.setAttribute("aria-label", t("control_zoom_out") || "Zoom Out");
    }
};

export const translateSearchEngineControl = (t: TranslationFunction<"useGetMapControls", ComponentKey>) => {
    const searchEngineBtn = document.querySelector('button[id^="GPshowSearchEnginePicto-"]');

    if (searchEngineBtn) {
        searchEngineBtn.setAttribute("aria-label", t("control_search_engine_btn") || "Search");
    }
};

export const getWebGLValidProperties = (featureTypeData: ObjectProps) => {
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

export const getLonLatFromGeometry = (geometryValue: string) => {
    let type = "Point";
    let lonLat: LonLatNumber = [0, 0];

    if (geometryValue.includes("MULTIPOLYGON")) {
        type = "MultiPolygon";
        lonLat = geometryValue
            .replace(/MULTIPOLYGON|\(|\)/g, "")
            .split(",")
            .map((s1: string) =>
                s1
                    .trim()
                    .split(" ")
                    .map((w) => Number(w))
            );
        lonLat = [[lonLat as unknown as number[]]];
    } else if (geometryValue.includes("POLYGON")) {
        type = "Polygon";
        lonLat = geometryValue
            .replace(/POLYGON|\(|\)/g, "")
            .split(",")
            .map((s1: string) =>
                s1
                    .trim()
                    .split(" ")
                    .map((w) => Number(w))
            );
        lonLat = [lonLat as unknown as number[]];
    } else if (geometryValue.includes("MULTILINESTRING") || geometryValue.includes("MULTILINE")) {
        type = "MultiLineString";
        lonLat = geometryValue
            .replace(/MULTILINESTRING|MULTILINE|\(|\)/g, "")
            .split(",")
            .map((s1: string) =>
                s1
                    .trim()
                    .split(" ")
                    .map((w) => Number(w))
            );
    } else if (geometryValue.includes("LINESTRING")) {
        type = "LineString";
        lonLat = geometryValue
            .replace(/LINESTRING|\(|\)/g, "")
            .split(",")
            .map((s1: string) =>
                s1
                    .trim()
                    .split(" ")
                    .map((w) => Number(w))
            );
    } else if (geometryValue.includes("MULTIPOINT")) {
        type = "MultiPoint";
        lonLat = geometryValue
            .replace(/MULTIPOINT|\(|\)/g, "")
            .split(",")
            .map((s1: string) =>
                s1
                    .trim()
                    .split(" ")
                    .map((w) => Number(w))
            );
    } else if (geometryValue.includes("POINT")) {
        type = "Point";
        lonLat = geometryValue
            .replace(/POINT|\(|\)/g, "")
            .trim()
            .split(" ")
            .map((w) => Number(w));
    } else {
        console.error(`[arrayToGeoJSON] Unknown geometry type in: ${geometryValue}`);
    }

    return { type, lonLat };
};

export const arrayToGeoJSON = (arr: ArrayGeoJSONProps[], geoservice: CommunityGeoservice) => {
    const features: GeoJSONProps = {
        type: "FeatureCollection",
        features: [],
    };

    const geometryFieldName = geoservice.geometryName || "geometrie";

    arr.forEach((el, index) => {
        const geometryValue = String(el[geometryFieldName]);

        if (!geometryValue) {
            console.warn(`[arrayToGeoJSON] Feature ${index} missing geometry field "${geometryFieldName}". Available fields:`, Object.keys(el));
            return;
        }

        const { type, lonLat } = getLonLatFromGeometry(geometryValue);

        const featureTypeData: ObjectProps = { ...el, id: el[`${geoservice.idName}`] };

        delete featureTypeData[geometryFieldName];

        const validProperties: ObjectProps = getWebGLValidProperties(featureTypeData);

        const properties: { [key: string]: string | number | object | null | undefined } = {
            featureType: geoservice.featureType,
            ...validProperties,
        };

        properties[FEATURE_TYPE_DATA_PROPERTY] = featureTypeData;
        properties[FEATURE_TYPE_GEOSERVICE_PROPERTY] = geoservice.featureType ? geoservice : undefined;

        const feature = {
            type: "Feature",
            id: el[`${geoservice.idName}`],
            geometry: {
                type: type,
                coordinates: lonLat,
            },
            geometry_name: geometryFieldName,
            properties,
        };

        features.features.push(feature);
    });
    return features;
};

export const getGeoJSONProps = (arr: GeoJSONProps, geoservice: CommunityGeoservice) => {
    return {
        type: arr.type,
        crs: {
            type: "name",
            properties: {
                name: geoservice.columns?.find((c) => c.name === geoservice.geometryName)?.crs ?? "EPSG:3857",
            },
        },
        features: arr.features.map((el) => {
            const featureTypeData: ObjectProps = {
                ...(typeof el.properties === "object" && el.properties !== null ? el.properties : {}),
                id: el[`${geoservice.idName}`],
            };

            const validProperties: ObjectProps = getWebGLValidProperties(featureTypeData);

            const properties: { [key: string]: string | number | object | null | undefined } = {
                featureType: geoservice.featureType,
                ...validProperties,
            };

            properties[FEATURE_TYPE_DATA_PROPERTY] = featureTypeData;
            properties[FEATURE_TYPE_GEOSERVICE_PROPERTY] = geoservice.featureType ? geoservice : undefined;
            return {
                ...el,
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
    const regex = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}:\d{2}.*)?$/;
    return typeof value === "string" && regex.test(value);
};

export const getFeaturesInPixelBySource = (map: Map | null, source: VectorSource, pixel: Pixel, hitTolerance: number = 0) => {
    if (!map) return;
    const coordinate = map?.getCoordinateFromPixel(pixel);
    const resolution = map?.getView().getResolution();
    const buffer = (resolution || 0) * hitTolerance;
    const extent = [coordinate![0] - buffer, coordinate![1] - buffer, coordinate![0] + buffer, coordinate![1] + buffer];

    if (source && "getFeaturesInExtent" in source) {
        const featuresAt = source?.getFeaturesInExtent!(extent);
        return featuresAt;
    }
};
