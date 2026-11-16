import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const FeatureTypeLayerLegendsFrTranslations: Translations<"fr">["FeatureTypeLayerLegends"] = {
    symbology: "Symbologie",
    select_label: "Style courant :",
    apply: "Appliquer",
    cancel: "Annuler",
};

export const FeatureTypeLayerLegendsEnTranslations: Translations<"en">["FeatureTypeLayerLegends"] = {
    symbology: "Symbology",
    select_label: "Current style:",
    apply: "Apply",
    cancel: "Cancel",
};

const { i18n } = declareComponentKeys<"symbology" | "select_label" | "apply" | "cancel">()("FeatureTypeLayerLegends");
export type I18n = typeof i18n;
