import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const FilterAndSortReportFrTranslations: Translations<"fr">["FilterAndSortReport"] = {
    newToOld: "Du plus récent au plus ancien",
    oldToNew: "Du plus ancien au plus récent",
    loading_error: "Erreur lors du chargement des signalements.",
};

export const FilterAndSortReportEnTranslations: Translations<"en">["FilterAndSortReport"] = {
    newToOld: "From newest to oldest",
    oldToNew: "From oldest to newest",
    loading_error: "Error loading reports.",
};

const { i18n } = declareComponentKeys<"newToOld" | "oldToNew" | "loading_error">()("FilterAndSortReport");
export type I18n = typeof i18n;
