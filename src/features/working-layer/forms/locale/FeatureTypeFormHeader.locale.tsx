import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const FeatureTypeFormHeaderFrTranslations: Translations<"fr">["FeatureTypeFormHeader"] = {
    back: "Retour",
    edit: "Éditer",
    close: "Fermer",
};

export const FeatureTypeFormHeaderEnTranslations: Translations<"en">["FeatureTypeFormHeader"] = {
    back: "Back",
    edit: "Edit",
    close: "Close",
};

const { i18n } = declareComponentKeys<"back" | "edit" | "close">()("FeatureTypeFormHeader");
export type I18n = typeof i18n;
