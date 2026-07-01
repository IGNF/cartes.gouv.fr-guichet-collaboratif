import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ReportTrackingFrTranslations: Translations<"fr">["ReportTracking"] = {
    report_status: "Statut",
    report_content: "Votre message",
    report_send: "Envoyer",
    select_status: "Séléctionner un statut",
    status_submit: "Reçu dans nos services",
    status_pending0: "En demande de qualification",
    status_pending: "En cours de traitement",
    status_pending1: "En attente de saisie",
    status_pending2: "En attente de validation",
    status_valid: "Pris en compte",
    status_valid0: "Déjà pris en compte",
    status_reject: "Rejeté (hors spéc.)",
    status_reject0: "Rejeté (hors de propos)",
    status_test: "En mode test",
    no_reply: "Aucune réponse disponible",
};

export const ReportTrackingEnTranslations: Translations<"en">["ReportTracking"] = {
    report_status: "Status",
    report_content: "Your message",
    report_send: "Send",
    select_status: "Select a status",
    status_submit: "Received in our services",
    status_pending0: "Requesting qualification",
    status_pending: "Being processed",
    status_pending1: "Awaiting entry",
    status_pending2: "Awaiting validation",
    status_valid: "Taken into account",
    status_valid0: "Already taken into account",
    status_reject: "Rejected (Out of spec.)",
    status_reject0: "Rejected (Out of relevance)",
    status_test: "In test mode",
    no_reply: "No reply available",
};

const { i18n } = declareComponentKeys<
    | "report_status"
    | "report_content"
    | "report_send"
    | "select_status"
    | "status_submit"
    | "status_pending0"
    | "status_pending"
    | "status_pending1"
    | "status_pending2"
    | "status_valid"
    | "status_valid0"
    | "status_reject"
    | "status_reject0"
    | "status_test"
    | "no_reply"
>()("ReportTracking");
export type I18n = typeof i18n;
