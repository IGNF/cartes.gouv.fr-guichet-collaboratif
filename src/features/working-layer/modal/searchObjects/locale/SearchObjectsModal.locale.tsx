import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const SearchObjectsModalFrTranslations: Translations<"fr">["SearchObjectsModal"] = {
    no_filters_alert: "Veuillez ajouter une condition",
    search: "Rechercher",
    reset: "Réinitialiser",
    max_number_title: "Nombre max. de résultats",
    search_filters: "Filtres de recherche",
    show_saved_searches: "Afficher les recherches sauvegardées",
    hide_saved_searches: "Masquer les recherches sauvegardées",
    save_current_search: "Sauvegarder la recherche actuelle",
    search_name_label: "Nom de la recherche",
    search_name_placeholder: "Ex: Bâtiments zone industrielle",
    save: "Sauvegarder",
    saved_searches_title: "Recherches sauvegardées",
    no_saved_searches: "Aucune recherche sauvegardée",
    load_search: "Charger",
    delete: "Supprimer",
    created_at: "Créée le",
    max_results: "Résultats max.",
    search_name_required: "Veuillez saisir un nom pour la recherche",
    no_filters_to_save: "Veuillez ajouter au moins une condition avant de sauvegarder",
    search_saved_successfully: "Recherche sauvegardée avec succès",
    search_loaded_successfully: "Recherche chargée avec succès",
    error_saving_search: "Erreur lors de la sauvegarde de la recherche",
    confirm_delete_search_title: "Confirmer la suppression",
    confirm_delete_search: "Êtes-vous sûr de vouloir supprimer cette recherche sauvegardée ?",
};

export const SearchObjectsModalEnTranslations: Translations<"en">["SearchObjectsModal"] = {
    no_filters_alert: "Please add a condition",
    search: "Search",
    reset: "Reset",
    max_number_title: "Max result number",
    search_filters: "Search filters",
    show_saved_searches: "Show saved searches",
    hide_saved_searches: "Hide saved searches",
    save_current_search: "Save current search",
    search_name_label: "Search name",
    search_name_placeholder: "Ex: Buildings in industrial zone",
    save: "Save",
    saved_searches_title: "Saved searches",
    no_saved_searches: "No saved searches",
    load_search: "Load",
    delete: "Delete",
    created_at: "Created on",
    max_results: "Max results",
    search_name_required: "Please enter a name for the search",
    no_filters_to_save: "Please add at least one condition before saving",
    search_saved_successfully: "Search saved successfully",
    search_loaded_successfully: "Search loaded successfully",
    error_saving_search: "Error saving search",
    confirm_delete_search_title: "Confirm deletion",
    confirm_delete_search: "Are you sure you want to delete this saved search?",
};

const { i18n } = declareComponentKeys<
    | "no_filters_alert"
    | "search"
    | "reset"
    | "max_number_title"
    | "search_filters"
    | "show_saved_searches"
    | "hide_saved_searches"
    | "save_current_search"
    | "search_name_label"
    | "search_name_placeholder"
    | "save"
    | "saved_searches_title"
    | "no_saved_searches"
    | "load_search"
    | "delete"
    | "created_at"
    | "max_results"
    | "search_name_required"
    | "no_filters_to_save"
    | "search_saved_successfully"
    | "search_loaded_successfully"
    | "error_saving_search"
    | "confirm_delete_search_title"
    | "confirm_delete_search"
>()("SearchObjectsModal");
export type I18n = typeof i18n;
