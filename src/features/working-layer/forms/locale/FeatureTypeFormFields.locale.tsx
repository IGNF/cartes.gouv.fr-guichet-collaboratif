import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const FeatureTypeFormFieldsFrTranslations: Translations<"fr">["FeatureTypeFormFields"] = {
    select_placeholder: "Sélectionnez une option",
};

export const FeatureTypeFormFieldsEnTranslations: Translations<"en">["FeatureTypeFormFields"] = {
    select_placeholder: "Select an option",
};

const { i18n } = declareComponentKeys<"select_placeholder">()("FeatureTypeFormFields");

export type I18n = typeof i18n;
