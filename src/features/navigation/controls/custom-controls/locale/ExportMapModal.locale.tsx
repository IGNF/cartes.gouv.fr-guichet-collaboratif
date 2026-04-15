import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ExportMapModalFrTranslations: Translations<"fr">["ExportMapModal"] = {
    title: "Imprimer une carte",
    validate: "Imprimer la carte",
    layout: "Mise en page",
    portrait: "Portrait",
    landscape: "Paysage",
    title_input: "Titre de la carte",
    hide_title: "Désactiver le titre",
    hide_scale: "Désactiver l'échelle",
    export_format: "Format d'export",
    margin: "Marge",
    margin_small: "Pas de marge - 0mm",
    margin_medium: "Petite marge - 5mm",
    margin_big: "Moyenne marge - 10mm",
    default_title: "Ma carte",
    success_status: "Export réussi",
    error_status: "Erreur lors de l'export",
};

export const ExportMapModalEnTranslations: Translations<"en">["ExportMapModal"] = {
    title: "Print a map",
    validate: "Print the Map",
    layout: "Layout",
    portrait: "Portrait",
    landscape: "Landscape",
    title_input: "Map title",
    hide_title: "Disable title",
    hide_scale: "Disable scale",
    export_format: "Export format",
    margin: "Margin",
    margin_small: "No margin - 0mm",
    margin_medium: "Small margin - 5mm",
    margin_big: "Average Margin - 10mm",
    default_title: "My map",
    success_status: "Export successful",
    error_status: "Error during export",
};

const { i18n } = declareComponentKeys<
    | "title"
    | "validate"
    | "layout"
    | "portrait"
    | "landscape"
    | "title_input"
    | "hide_title"
    | "hide_scale"
    | "export_format"
    | "margin"
    | "margin_small"
    | "margin_medium"
    | "margin_big"
    | "default_title"
    | "success_status"
    | "error_status"
>()("ExportMapModal");
export type I18n = typeof i18n;
