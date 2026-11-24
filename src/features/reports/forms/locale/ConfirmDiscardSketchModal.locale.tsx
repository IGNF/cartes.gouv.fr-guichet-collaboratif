import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ConfirmDiscardSketchModalFrTranslations: Translations<"fr">["ConfirmDiscardSketchModal"] = {
    title: "Modifications du croquis non enregistrées",
    message: "Le croquis de ce signalement contient des modifications non enregistrées. Voulez-vous continuer ?",
    confirm: "Oui, abandonner les modifications",
    cancel: "Non, rester sur ce signalement",
};

export const ConfirmDiscardSketchModalEnTranslations: Translations<"en">["ConfirmDiscardSketchModal"] = {
    title: "Unsaved sketch changes",
    message: "The sketch of this report has unsaved changes. Do you want to continue?",
    confirm: "Yes, discard changes",
    cancel: "No, stay on this report",
};

const { i18n } = declareComponentKeys<"title" | "message" | "confirm" | "cancel">()("ConfirmDiscardSketchModal");
export type I18n = typeof i18n;
