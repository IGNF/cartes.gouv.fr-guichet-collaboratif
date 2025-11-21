import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ReportTrackingFrTranslations: Translations<"fr">["ReportTracking"] = {
    report_status: "Statut",
    report_content: "Votre message",
    report_send: "Envoyer",
    no_reply: "Aucune réponse disponible",
};

export const ReportTrackingEnTranslations: Translations<"en">["ReportTracking"] = {
    report_status: "Status",
    report_content: "Your message",
    report_send: "Send",
    no_reply: "No reply available",
};

const { i18n } = declareComponentKeys<"report_status" | "report_content" | "report_send" | "no_reply">()("ReportTracking");
export type I18n = typeof i18n;
