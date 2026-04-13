import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const GetReportsLayerFrTranslations: Translations<"fr">["GetReportsLayer"] = {
    error: "Erreur lors du chargement des signalements",
    reports_title: "Signalements",
    reports_legend: "Légende signalements",
    report_reply: "Répondre",
    selected_lines: "Nombre de lignes sélectionnée(s) :",
    no_lines: "Pas de lignes sélectionnées",
    no_result: "Aucun résultat ne correspond à votre recherche.",
    result_count: "Nombre de résultats :",
    theme: "Thème",
    creation: "Création",
    status: "Statut",
    select_all: "Sélectionner tous les signalements de la page courante.",
    delete_button: "Supprimer un signalement",
    export_button: "Exporter le(s) signalement(s)",
    results_per_page: "Nombre de lignes par page",
    "tableHeaders.id": "Identifiant",
    "tableHeaders.status": "Statut",
    "tableHeaders.comment": "Commentaire",
    "tableHeaders.author": "Pseudo",
    "tableHeaders.id_author": "Identifiant de l'auteur",
    "tableHeaders.opening_date": "Date de création",
    "tableHeaders.updating_date": "Date de mise à jour",
    "tableHeaders.closing_date": "Date de fermeture",
    "tableHeaders.attributs": "Attributs",
    "tableHeaders.departement": "Département",
    "tableHeaders.document": "Document",
    "tableHeaders.reply": "Réponse",
};

export const GetReportsLayerEnTranslations: Translations<"en">["GetReportsLayer"] = {
    error: "Error while loading reports",
    reports_title: "Reports",
    reports_legend: "Reports legend",
    report_reply: "Reply",
    selected_lines: "Number of lines selected:",
    no_lines: "No lines selected",
    no_result: "No results match your search.",
    result_count: "Result number:",
    theme: "Theme",
    creation: "Creation",
    status: "Status",
    select_all: "Select all reports on the current page.",
    delete_button: "Delete a report",
    export_button: "Export a report",
    results_per_page: "Number of lines per page",
    "tableHeaders.id": "ID",
    "tableHeaders.status": "Status",
    "tableHeaders.comment": "Comment",
    "tableHeaders.author": "Username",
    "tableHeaders.id_author": "Author ID",
    "tableHeaders.opening_date": "Creation date",
    "tableHeaders.updating_date": "Update date",
    "tableHeaders.closing_date": "Closing date",
    "tableHeaders.attributs": "Attributes",
    "tableHeaders.departement": "Department",
    "tableHeaders.document": "Document",
    "tableHeaders.reply": "Reply",
};

const { i18n } = declareComponentKeys<
    | "error"
    | "reports_title"
    | "reports_legend"
    | "report_reply"
    | "selected_lines"
    | "no_lines"
    | "no_result"
    | "result_count"
    | "theme"
    | "creation"
    | "status"
    | "select_all"
    | "delete_button"
    | "export_button"
    | "results_per_page"
    | "tableHeaders.id"
    | "tableHeaders.status"
    | "tableHeaders.comment"
    | "tableHeaders.author"
    | "tableHeaders.id_author"
    | "tableHeaders.opening_date"
    | "tableHeaders.updating_date"
    | "tableHeaders.closing_date"
    | "tableHeaders.attributs"
    | "tableHeaders.departement"
    | "tableHeaders.document"
    | "tableHeaders.reply"
>()("GetReportsLayer");
export type I18n = typeof i18n;
