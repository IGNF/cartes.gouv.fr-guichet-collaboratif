import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const OpenReplyReportModalFrTranslations: Translations<"fr">["OpenReplyReportModal"] = {
    open_title: "Ma réponse",
    send_report: "Envoyer",
    back_to_reports: "Retour aux signalements",
    "status.submit": "Reçu dans nos services",
    "status.pending0": "En demande de qualification",
    "status.pending": "En cours de traitement",
    "status.pending1": "En attente de saisie",
    "status.pending2": "En attente de validation",
    "status.valid": "Pris en compte",
    "status.valid0": "Déjà pris en compte",
    "status.reject": "Rejeté (hors spéc.)",
    "status.reject0": "Rejeté (hors de propos)",
    "status.test": "En mode test",
};

export const OpenReplyReportModalEnTranslations: Translations<"en">["OpenReplyReportModal"] = {
    open_title: "My answer",
    send_report: "Send",
    back_to_reports: "Return to reports list",
    "status.submit": "Received in our services",
    "status.pending0": "Requesting qualification",
    "status.pending": "Being processed",
    "status.pending1": "Awaiting entry",
    "status.pending2": "Awaiting validation",
    "status.valid": "Taken into account",
    "status.valid0": "Already taken into account",
    "status.reject": "Rejected (Out of spec.)",
    "status.reject0": "Rejected (Out of relevance)",
    "status.test": "In test mode",
};

const { i18n } = declareComponentKeys<
    | "open_title"
    | "send_report"
    | "back_to_reports"
    | "status.submit"
    | "status.pending0"
    | "status.pending"
    | "status.pending1"
    | "status.pending2"
    | "status.valid"
    | "status.valid0"
    | "status.reject"
    | "status.reject0"
    | "status.test"
>()("OpenReplyReportModal");
export type I18n = typeof i18n;
