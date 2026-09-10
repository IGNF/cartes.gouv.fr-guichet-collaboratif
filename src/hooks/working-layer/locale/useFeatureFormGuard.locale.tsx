import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const useFeatureFormGuardFrTranslations: Translations<"fr">["useFeatureFormGuard"] = {
    finish_before_new: "Veuillez compléter le formulaire de l'objet créé avant d'en ajouter un nouveau",
    finish_before_close: "Veuillez compléter le formulaire de l'objet créé avant de le fermer",
    finish_before_view: "Veuillez compléter le formulaire de l'objet créé avant de revenir à la consultation",
};

export const useFeatureFormGuardEnTranslations: Translations<"en">["useFeatureFormGuard"] = {
    finish_before_new: "Please complete the form for the new object before adding a new one",
    finish_before_close: "Please complete the form for the new object before closing it",
    finish_before_view: "Please complete the form for the new object before returning to view mode",
};

const { i18n } = declareComponentKeys<"finish_before_new" | "finish_before_close" | "finish_before_view">()("useFeatureFormGuard");

export type I18n = typeof i18n;
