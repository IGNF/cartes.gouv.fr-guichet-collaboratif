import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const GetReportsLayerFrTranslations: Translations<"fr">["GetReportsLayer"] = {
    reports_title: "Signalements",
    reports_legend: "Légende signalements",
    report_reply: "Répondre",
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
    reports_title: "Reports",
    reports_legend: "Reports legend",
    report_reply: "Reply",
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
    | "reports_title"
    | "reports_legend"
    | "report_reply"
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
