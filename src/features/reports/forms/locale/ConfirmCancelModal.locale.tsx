import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ConfirmCancelModalFrTranslations: Translations<"fr">["ConfirmCancelModal"] = {
    cancel_title: "Confirmation",
    cancel_message: "En annulant la création de ce signalement vous supprimerez les éventuels documents et croquis associés. Voulez-vous continuer ?",
    cancel_yes: "Oui, annuler",
    cancel_no: "Non, continuer la saisie",
};

export const ConfirmCancelModalEnTranslations: Translations<"en">["ConfirmCancelModal"] = {
    cancel_title: "Confirmation",
    cancel_message: "Canceling the creation of this report will delete any associated documents and sketches. Do you want to continue?",
    cancel_yes: "Yes, cancel",
    cancel_no: "No, continue typing",
};

const { i18n } = declareComponentKeys<"cancel_title" | "cancel_message" | "cancel_yes" | "cancel_no">()("ConfirmCancelModal");
export type I18n = typeof i18n;
