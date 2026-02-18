import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ToolsControlFrTranslations: Translations<"fr">["ToolsControl"] = {
    search_engine_placeholder: "Rechercher un lieu, ...", //une Adresse
    minimap: "Mini-carte",
};

export const ToolsControlEnTranslations: Translations<"en">["ToolsControl"] = {
    search_engine_placeholder: "Search a place, ...",
    minimap: "Mini map",
};

const { i18n } = declareComponentKeys<"search_engine_placeholder" | "minimap">()("ToolsControl");
export type I18n = typeof i18n;
