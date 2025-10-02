import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const FeatureTypeLayerLegendsFrTranslations: Translations<"fr">["FeatureTypeLayerLegends"] = {
    select_label: "Style courant :",
    yes: "Ok",
    cancel: "Annuler",
    close: "Fermer",
};

export const FeatureTypeLayerLegendsEnTranslations: Translations<"en">["FeatureTypeLayerLegends"] = {
    select_label: "Current style:",
    yes: "Ok",
    cancel: "Cancel",
    close: "Close",
};

const { i18n } = declareComponentKeys<"select_label" | "yes" | "cancel" | "close">()("FeatureTypeLayerLegends");
export type I18n = typeof i18n;
