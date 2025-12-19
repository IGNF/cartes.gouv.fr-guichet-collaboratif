import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const FeatureTypeFormHeaderFrTranslations: Translations<"fr">["FeatureTypeFormHeader"] = {
    back: "Retour",
    edit: "Éditer",
    close: "Fermer",
    objects_count: ({ count }: { count: number }) => `${count} objets`,
};

export const FeatureTypeFormHeaderEnTranslations: Translations<"en">["FeatureTypeFormHeader"] = {
    back: "Back",
    edit: "Edit",
    close: "Close",
    objects_count: ({ count }: { count: number }) => `${count} objects`,
};

const { i18n } = declareComponentKeys<"back" | "edit" | "close" | { K: "objects_count"; P: { count: number }; R: string }>()("FeatureTypeFormHeader");
export type I18n = typeof i18n;
