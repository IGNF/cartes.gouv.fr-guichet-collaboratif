import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ToolsControlFrTranslations: Translations<"fr">["ToolsControl"] = {
    search_engine_placeholder: "Rechercher un lieu, ...", //une Adresse
    minimap: "Mini-carte",
    open_button: "Ajouter une position préférée",
    favorites_title: "Vos positions préférées",
    empty_favorites: "Aucune position favorite enregistrée.",
    remove_favorite: "Retirer des favoris",
    modal_title: "Ajouter une position favorite",
    modal_helper_text: "Retrouvez vos positions préférées en cliquant dans la barre de recherche centrale de la carte",
    name_label: "Nom",
    source_label: "Choisissez une source",
    source_selected_result: "Effectuez une recherche",
    source_map_center: "Centre actuel de la carte",
    source_manual_coordinates: "Coordonnées manuelles",
    longitude_label: "Longitude",
    latitude_label: "Latitude",
    save_button: "Enregistrer la position",
    cancel_button: "Annuler",
    default_name: "Position favorite",
    error_selected_result_unavailable: "Aucun résultat de recherche selectionné.",
    location_search_placeholder: "Rechercher un lieu, une adresse, ...",
    location_suggestions_loading: "Chargement des suggestions...",
    error_select_location: "Selectionnez une suggestion de lieu.",
    error_empty_name: "Le nom de la position est obligatoire.",
    error_invalid_coordinates: "Les coordonnées saisies sont invalides.",
    error_duplicate_name: "Une position avec ce nom existe deja.",
    save_success: "Position favorite enregistrée.",
};

export const ToolsControlEnTranslations: Translations<"en">["ToolsControl"] = {
    search_engine_placeholder: "Search a place, ...",
    minimap: "Mini map",
    open_button: "Add favourite position",
    favorites_title: "Your favourite positions",
    empty_favorites: "No favourite position yet.",
    remove_favorite: "Remove from favourites",
    modal_title: "Add favourite position",
    modal_helper_text: "Find your favourite positions again by clicking in the central search bar of the map",
    name_label: "Name",
    source_label: "Choose a source",
    source_selected_result: "Search a place",
    source_map_center: "Current map center",
    source_manual_coordinates: "Manual coordinates",
    longitude_label: "Longitude",
    latitude_label: "Latitude",
    save_button: "Save position",
    cancel_button: "Cancel",
    default_name: "Starred position",
    error_selected_result_unavailable: "No search result selected.",
    location_search_placeholder: "Search a location, an address, ...",
    location_suggestions_loading: "Loading suggestions...",
    error_select_location: "Select a location suggestion.",
    error_empty_name: "Position name is required.",
    error_invalid_coordinates: "The coordinates are invalid.",
    error_duplicate_name: "A position with this name already exists.",
    save_success: "Starred position saved.",
};

const { i18n } = declareComponentKeys<
    | "search_engine_placeholder"
    | "minimap"
    | "open_button"
    | "favorites_title"
    | "empty_favorites"
    | "remove_favorite"
    | "modal_title"
    | "modal_helper_text"
    | "name_label"
    | "source_label"
    | "source_selected_result"
    | "source_map_center"
    | "source_manual_coordinates"
    | "longitude_label"
    | "latitude_label"
    | "save_button"
    | "cancel_button"
    | "default_name"
    | "error_selected_result_unavailable"
    | "location_search_placeholder"
    | "location_suggestions_loading"
    | "error_select_location"
    | "error_empty_name"
    | "error_invalid_coordinates"
    | "error_duplicate_name"
    | "save_success"
>()("ToolsControl");
export type I18n = typeof i18n;
