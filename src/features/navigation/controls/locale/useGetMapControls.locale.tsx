import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const useGetMapControlsFrTranslations: Translations<"fr">["useGetMapControls"] = {
    full_screen_label: "Basculer en mode plein écran",
    search_engine_placeholder: "Rechercher un lieu, une adresse",
};

export const useGetMapControlsEnTranslations: Translations<"en">["useGetMapControls"] = {
    full_screen_label: "Switch to full screen mode",
    search_engine_placeholder: "Search for a place, an address",
};

const { i18n } = declareComponentKeys<"full_screen_label" | "search_engine_placeholder">()("useGetMapControls");
export type I18n = typeof i18n;
