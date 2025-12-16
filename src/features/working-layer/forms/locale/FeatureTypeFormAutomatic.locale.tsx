import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const FeatureTypeFormAutomaticFrTranslations: Translations<"fr">["FeatureTypeFormAutomatic"] = {
    wait: "Calcul en cours...",
    no: "Non",
    yes: "Oui",
    empty: "(Vide)",
};

export const FeatureTypeFormAutomaticEnTranslations: Translations<"en">["FeatureTypeFormAutomatic"] = {
    wait: "Still computing...",
    no: "No",
    yes: "Yes",
    empty: "Empty",
};

const { i18n } = declareComponentKeys<"wait" | "yes" | "no" | "empty">()("FeatureTypeFormAutomatic");
export type I18n = typeof i18n;
