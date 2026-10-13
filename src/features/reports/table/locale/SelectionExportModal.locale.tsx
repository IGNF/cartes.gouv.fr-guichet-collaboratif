import { declareComponentKeys } from "i18nifty";

import { Translations } from "@/i18n/types";

export const SelectionExportModalFrTranslations: Translations<"fr">["SelectionExportModal"] = {
    title: "Exporter les signalements",
    format_legend: "Veuillez choisir le format d'export",
    csv: "CSV",
    geojson: "GeoJSON",
    cancel: "Annuler",
    confirm: "Exporter",
};

export const SelectionExportModalEnTranslations: Translations<"en">["SelectionExportModal"] = {
    title: "Export reports",
    format_legend: "Please choose the export format",
    csv: "CSV",
    geojson: "GeoJSON",
    cancel: "Cancel",
    confirm: "Export",
};

const { i18n } = declareComponentKeys<"title" | "format_legend" | "csv" | "geojson" | "cancel" | "confirm">()("SelectionExportModal");

export type I18n = typeof i18n;
