import { declareComponentKeys } from "i18nifty";

import { Translations } from "@/i18n/types";

export const SelectionExportModalFrTranslations: Translations<"fr">["SelectionExportModal"] = {
    title: "Exporter les signalements",
    format_legend: "Choisissez le format d'export",
    csv: "CSV",
    csv_hint: "Pour utiliser vos données dans un tableur",
    geojson: "GeoJSON",
    geojson_hint: "Données géographiques adaptées aux SIG (croquis inclus)",
    cancel: "Annuler",
    confirm: "Exporter",
};

export const SelectionExportModalEnTranslations: Translations<"en">["SelectionExportModal"] = {
    title: "Export reports",
    format_legend: "Choose the export format",
    csv: "CSV",
    csv_hint: "Spreadsheet-compatible table",
    geojson: "GeoJSON",
    geojson_hint: "Geographic data including adapted to GIS (sketches included)",
    cancel: "Cancel",
    confirm: "Export",
};

const { i18n } = declareComponentKeys<"title" | "format_legend" | "csv" | "csv_hint" | "geojson" | "geojson_hint" | "cancel" | "confirm">()(
    "SelectionExportModal"
);

export type I18n = typeof i18n;
