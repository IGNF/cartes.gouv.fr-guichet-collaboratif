import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const FeatureTypeFormHeaderFrTranslations: Translations<"fr">["FeatureTypeFormHeader"] = {
    back: "Retour",
};

export const FeatureTypeFormHeaderEnTranslations: Translations<"en">["FeatureTypeFormHeader"] = {
    back: "Back",
};

const { i18n } = declareComponentKeys<"back">()("FeatureTypeFormHeader");
export type I18n = typeof i18n;
