import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ShowReportFrTranslations: Translations<"fr">["ShowReport"] = {
    report_title: ({ reportId }: { reportId: number }) => `Signalement ${reportId}`,
    report_back: "Tous les signalements",
    report_theme: "Thème",
    report_sketch_list: "Croquis",
    report_description: "Description",
    report_document_list: "Documents",
    report_document_modify: "Modifier",
    report_tracking: "Suivi",
    report_status: "Statut",
    report_content: "Votre message",
    report_send: "Envoyer",
};

export const ShowReportEnTranslations: Translations<"en">["ShowReport"] = {
    report_title: ({ reportId }: { reportId: number }) => `Report ${reportId}`,
    report_back: "All reports",
    report_theme: "Theme",
    report_sketch_list: "Sketches",
    report_description: "Description",
    report_document_list: "Documents",
    report_document_modify: "Modify",
    report_tracking: "Tracking",
    report_status: "Status",
    report_content: "Your message",
    report_send: "Send",
};

const { i18n } = declareComponentKeys<
    | { K: "report_title"; P: { reportId: number }; R: string }
    | "report_back"
    | "report_theme"
    | "report_sketch_list"
    | "report_description"
    | "report_document_list"
    | "report_document_modify"
    | "report_tracking"
    | "report_status"
    | "report_content"
    | "report_send"
>()("ShowReport");
export type I18n = typeof i18n;
