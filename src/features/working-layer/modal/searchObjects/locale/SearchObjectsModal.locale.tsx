import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const SearchObjectsModalFrTranslations: Translations<"fr">["SearchObjectsModal"] = {
    no_filters_alert: "Veuillez ajouter une condition",
    search: "Rechercher",
    reset: "Réinitialiser",
    max_number_title: "Nombre max. de résultats",
};

export const SearchObjectsModalEnTranslations: Translations<"en">["SearchObjectsModal"] = {
    no_filters_alert: "Please add a condition",
    search: "Search",
    reset: "Reset",
    max_number_title: "Max result number",
};

const { i18n } = declareComponentKeys<"no_filters_alert" | "search" | "reset" | "max_number_title">()("SearchObjectsModal");
export type I18n = typeof i18n;
