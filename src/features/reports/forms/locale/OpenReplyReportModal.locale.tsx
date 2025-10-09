import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const OpenReplyReportModalFrTranslations: Translations<"fr">["OpenReplyReportModal"] = {
    openReplay_title: "Ma réponse au signalement ",
    openReplies_title: "Ma réponse aux signalements ",
    replayStatus_text: "Statut",
    replayContent_text: "Description ",
    send_report: "Envoyer",
    back_to_reports: "Retour aux signalements",
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
};

export const OpenReplyReportModalEnTranslations: Translations<"en">["OpenReplyReportModal"] = {
    openReplay_title: "My answer to",
    openReplies_title: "My answer to",
    replayStatus_text: "Status",
    replayContent_text: "Description",
    send_report: "Send",
    back_to_reports: "Return to reports list",
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
};

const { i18n } = declareComponentKeys<
    | "openReplay_title"
    | "openReplies_title"
    | "replayStatus_text"
    | "replayContent_text"
    | "send_report"
    | "back_to_reports"
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
>()("OpenReplyReportModal");
export type I18n = typeof i18n;
