import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ContributionListFrTranslations: Translations<"fr">["ContributionList"] = {
    objects_created: ({ featId }) => `Création d'objet : ${featId}`,
    objects_modified: ({ featId }) => `Modification d'objet : ${featId}`,
    objects_deleted: ({ featId }) => `Supression d'objet : ${featId}`,
    list_title: "Liste des contributions",
    cancel: "Annuler",
    cancel_all: "Tout annuler",
    close: "Fermer",
};

export const ContributionListEnTranslations: Translations<"en">["ContributionList"] = {
    objects_created: ({ featId }) => `Object creation: ${featId}`,
    objects_modified: ({ featId }) => `Object modification: ${featId}`,
    objects_deleted: ({ featId }) => `Object deletion: ${featId}`,
    list_title: "List of contributions",
    cancel: "Cancel",
    cancel_all: "Cancel all",
    close: "Close",
};

const { i18n } = declareComponentKeys<
    | { K: "objects_created"; P: { featId: number }; R: string }
    | { K: "objects_modified"; P: { featId: number }; R: string }
    | { K: "objects_deleted"; P: { featId: number }; R: string }
    | "list_title"
    | "cancel"
    | "cancel_all"
    | "close"
>()("ContributionList");
export type I18n = typeof i18n;
