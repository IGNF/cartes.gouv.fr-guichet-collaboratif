import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const FeatureTypeFormActionsFrTranslations: Translations<"fr">["FeatureTypeFormActions"] = {
    delete: "Supprimer",
    cancel: "Annuler",
    save: "Sauvegarder",
    all_objects: ({ count }: { count: number }) => `les ${count} objets`,
};

export const FeatureTypeFormActionsEnTranslations: Translations<"en">["FeatureTypeFormActions"] = {
    delete: "Delete",
    cancel: "Cancel",
    save: "Save",
    all_objects: ({ count }: { count: number }) => `all ${count} objects`,
};

const { i18n } = declareComponentKeys<"save" | "delete" | "cancel" | { K: "all_objects"; P: { count: number }; R: string }>()("FeatureTypeFormActions");
export type I18n = typeof i18n;
