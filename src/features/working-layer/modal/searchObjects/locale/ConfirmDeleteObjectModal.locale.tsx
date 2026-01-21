import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ConfirmDeleteObjectModalFrTranslations: Translations<"fr">["ConfirmDeleteObjectModal"] = {
    title: "Attention",
    yes: "Oui",
    no: "Non",
    description: "Êtes-vous sûr de vouloir supprimer cet objet ?",
};

export const ConfirmDeleteObjectModalEnTranslations: Translations<"en">["ConfirmDeleteObjectModal"] = {
    title: "Attention",
    yes: "Yes",
    no: "No",
    description: "Are you sure about deleting this object?",
};

const { i18n } = declareComponentKeys<"title" | "yes" | "no" | "description">()("ConfirmDeleteObjectModal");
export type I18n = typeof i18n;
