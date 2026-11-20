import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const FeatureTypeFormAutomaticFrTranslations: Translations<"fr">["FeatureTypeFormAutomatic"] = {
    wait: "Calcul des champs automatiques en cours...",
};

export const FeatureTypeFormAutomaticEnTranslations: Translations<"en">["FeatureTypeFormAutomatic"] = {
    wait: "Computing automatic fields...",
};

const { i18n } = declareComponentKeys<"wait">()("FeatureTypeFormAutomatic");
export type I18n = typeof i18n;
