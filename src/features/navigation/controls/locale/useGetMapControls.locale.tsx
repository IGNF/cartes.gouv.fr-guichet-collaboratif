import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const useGetMapControlsFrTranslations: Translations<"fr">["useGetMapControls"] = {
    full_screen_label: "Basculer en mode plein écran",
    search_engine_placeholder: "Rechercher un lieu, une adresse",
    control_layer_swticher_aria_label: "Afficher/masquer le gestionnaire de couches",
    control_layer_swticher_pannel_title: "Couches de données",
    control_layer_swticher_pannel_icon_title_remove: "Supprimer la couche",
    control_layer_swticher_pannel_icon_title_edit: "Editer la couche",
    control_layer_swticher_pannel_icon_title_info: "Informations/légende",
    control_layer_swticher_pannel_icon_title_advanced_tools: "Plus d'outils",
    control_layer_swticher_pannel_icon_title_drag_drop: "Déplacer la couche",
    control_layer_swticher_pannel_icon_title_visibility: "Afficher/masquer la couche",
    control_layer_swticher_pannel_icon_title_extent: "Zoomer dans l'étendue",
    control_layer_swticher_pannel_icon_title_opacity: "Opacité",
    control_zoom_in: "Zoomer",
    control_zoom_out: "Dézoomer",
    control_search_engine_btn: "Rechercher",
    close_panel_title: "Fermer le panneau",
    close_panel_text: "Fermer",
    minimap: "Mini-carte",
};

export const useGetMapControlsEnTranslations: Translations<"en">["useGetMapControls"] = {
    full_screen_label: "Switch to full screen mode",
    search_engine_placeholder: "Search for a place, an address",
    control_layer_swticher_aria_label: "Show/hide the layer manager",
    control_layer_swticher_pannel_title: "Data layers",
    control_layer_swticher_pannel_icon_title_remove: "Delete layer",
    control_layer_swticher_pannel_icon_title_edit: "Edit layer",
    control_layer_swticher_pannel_icon_title_info: "Information/Legend",
    control_layer_swticher_pannel_icon_title_advanced_tools: "Advanced tools",
    control_layer_swticher_pannel_icon_title_drag_drop: "Move layer",
    control_layer_swticher_pannel_icon_title_visibility: "Show/hide layer",
    control_layer_swticher_pannel_icon_title_extent: "Zoom into the extent",
    control_layer_swticher_pannel_icon_title_opacity: "Opacity",
    control_zoom_in: "Zoom In",
    control_zoom_out: "Zoom Out",
    control_search_engine_btn: "Search",
    close_panel_title: "Close panel",
    close_panel_text: "Close",
    minimap: "Mini-map",
};

const { i18n } = declareComponentKeys<
    | "full_screen_label"
    | "search_engine_placeholder"
    | "control_layer_swticher_aria_label"
    | "control_layer_swticher_pannel_title"
    | "close_panel_title"
    | "close_panel_text"
    | "control_layer_swticher_pannel_icon_title_remove"
    | "control_layer_swticher_pannel_icon_title_edit"
    | "control_layer_swticher_pannel_icon_title_info"
    | "control_layer_swticher_pannel_icon_title_advanced_tools"
    | "control_layer_swticher_pannel_icon_title_drag_drop"
    | "control_layer_swticher_pannel_icon_title_visibility"
    | "control_layer_swticher_pannel_icon_title_extent"
    | "control_layer_swticher_pannel_icon_title_opacity"
    | "control_zoom_in"
    | "control_zoom_out"
    | "control_search_engine_btn"
    | "minimap"
>()("useGetMapControls");
export type I18n = typeof i18n;
