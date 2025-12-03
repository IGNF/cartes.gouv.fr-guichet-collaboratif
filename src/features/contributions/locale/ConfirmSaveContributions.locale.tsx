import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ConfirmSaveContributionsFrTranslations: Translations<"fr">["ConfirmSaveContributions"] = {
    confirm_title: "Confirmation",
    confirm_description: "Etes vous sûr de vouloir enregistrer ces modifications ?",
    yes: "Oui",
    no: "Non",
};

export const ConfirmSaveContributionsEnTranslations: Translations<"en">["ConfirmSaveContributions"] = {
    confirm_title: "Alert",
    confirm_description: "Are you sure you want to save these changes?",
    yes: "Yes",
    no: "No",
};

const { i18n } = declareComponentKeys<"confirm_title" | "confirm_description" | "yes" | "no">()("ConfirmSaveContributions");
export type I18n = typeof i18n;
