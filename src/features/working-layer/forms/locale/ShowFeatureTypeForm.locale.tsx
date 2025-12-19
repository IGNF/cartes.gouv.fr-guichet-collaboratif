import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ShowFeatureTypeFormFrTranslations: Translations<"fr">["ShowFeatureTypeForm"] = {
    value_empty: "(vide)",
    value_yes: "Oui",
    value_no: "Non",
    cancel: "Annuler",
    state: "Nouveau",
    edit: "Éditer",
};

export const ShowFeatureTypeFormEnTranslations: Translations<"en">["ShowFeatureTypeForm"] = {
    value_empty: "(vide)",
    value_yes: "Oui",
    value_no: "Non",
    cancel: "Cancel",
    state: "New",
    edit: "Edit",
};

const { i18n } = declareComponentKeys<"value_empty" | "value_yes" | "value_no" | "cancel" | "state" | "edit">()("ShowFeatureTypeForm");
export type I18n = typeof i18n;
