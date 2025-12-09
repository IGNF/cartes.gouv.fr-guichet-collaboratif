import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const EditFeatureTypeFormFrTranslations: Translations<"fr">["EditFeatureTypeForm"] = {
    state: "Nouveau",
};

export const EditFeatureTypeFormEnTranslations: Translations<"en">["EditFeatureTypeForm"] = {
    state: "New",
};

const { i18n } = declareComponentKeys<"state">()("EditFeatureTypeForm");
export type I18n = typeof i18n;
