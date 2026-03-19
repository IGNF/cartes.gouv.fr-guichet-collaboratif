import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const FilterAndSortReportFrTranslations: Translations<"fr">["FilterAndSortReport"] = {
    apply: "Appliquer",
    dateCreation: "Date de création",
    dateUpdating: "Date de mise à jour",
    filterBy: "Trier par",
    sortBy: "Trier par",
    reset: "Effacer",
    selectOption: "Sélectionner une option",
    newToOld: "Du plus récent au plus ancien",
    oldToNew: "Du plus ancien au plus récent",
    loading_error: "Erreur lors du chargement des signalements.",
    status: "Statut",
    theme: "Thème",
    author: "Auteur",
    departement: "Département",
    depatement_placeholder: "Saisir un numéro de département",
    author_placeholder: "Id uniquement",
};

export const FilterAndSortReportEnTranslations: Translations<"en">["FilterAndSortReport"] = {
    apply: "Apply",
    filterBy: "Filter by",
    sortBy: "Sort by",
    reset: "Reset",
    selectOption: "Select an option",
    dateCreation: "Creation date",
    dateUpdating: "Updating date",
    newToOld: "From newest to oldest",
    oldToNew: "From oldest to newest",
    loading_error: "Error loading reports.",
    status: "Status",
    theme: "Theme",
    author: "Author",
    departement: "(French) Department",
    depatement_placeholder: "Enter a department number",
    author_placeholder: "Id only",
};

const { i18n } = declareComponentKeys<
    | "newToOld"
    | "oldToNew"
    | "loading_error"
    | "apply"
    | "filterBy"
    | "sortBy"
    | "dateCreation"
    | "dateUpdating"
    | "selectOption"
    | "reset"
    | "status"
    | "theme"
    | "author"
    | "departement"
    | "depatement_placeholder"
    | "author_placeholder"
>()("FilterAndSortReport");
export type I18n = typeof i18n;
