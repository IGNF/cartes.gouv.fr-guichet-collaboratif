import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const FeatureTypeFormActionsFrTranslations: Translations<"fr">["FeatureTypeFormActions"] = {
    delete: "Supprimer",
    cancel: "Annuler",
    save: "Sauvegarder",
};

export const FeatureTypeFormActionsEnTranslations: Translations<"en">["FeatureTypeFormActions"] = {
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
};

const { i18n } = declareComponentKeys<"save" | "delete" | "cancel">()("FeatureTypeFormActions");
export type I18n = typeof i18n;
