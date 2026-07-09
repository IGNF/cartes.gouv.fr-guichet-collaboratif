import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ShowReportFrTranslations: Translations<"fr">["ShowReport"] = {
    report_title: ({ reportId }: { reportId: number }) => `Signalement ${reportId}`,
    report_back: "Tous les signalements",
    report_theme: "Thème",
    report_no_theme: "Aucun thème",
    report_sketch_list: "Croquis",
    report_description: "Description",
    report_document_list: "Documents",
    report_document_modify: "Modifier",
    report_tracking: "Suivi",
    report_status: "Statut",
    report_content: "Votre message",
    report_send: "Envoyer",
    report_reply: "Répondre",
    report_document_deleted_error: "Erreur dans la suppression des documents du signalement !",
    report_deleted_error: "Erreur dans la suppression du signalement !",
    report_deleted_success: ({ reportId }: { reportId: number }) => `Le signalement ${reportId} est supprimé avec succès.`,
};

export const ShowReportEnTranslations: Translations<"en">["ShowReport"] = {
    report_title: ({ reportId }: { reportId: number }) => `Report ${reportId}`,
    report_back: "All reports",
    report_theme: "Theme",
    report_no_theme: "No theme",
    report_sketch_list: "Sketches",
    report_description: "Description",
    report_document_list: "Documents",
    report_document_modify: "Modify",
    report_tracking: "Tracking",
    report_status: "Status",
    report_content: "Your message",
    report_send: "Send",
    report_reply: "Reply",
    report_document_deleted_error: "Error deleting documents from the report!",
    report_deleted_error: "Error deleting report!",
    report_deleted_success: ({ reportId }: { reportId: number }) => `Report ${reportId} is successfully deleted.`,
};

const { i18n } = declareComponentKeys<
    | { K: "report_title"; P: { reportId: number }; R: string }
    | "report_back"
    | "report_theme"
    | "report_no_theme"
    | "report_sketch_list"
    | "report_description"
    | "report_document_list"
    | "report_document_modify"
    | "report_tracking"
    | "report_status"
    | "report_content"
    | "report_reply"
    | "report_send"
    | "report_document_deleted_error"
    | "report_deleted_error"
    | { K: "report_deleted_success"; P: { reportId: number }; R: string }
>()("ShowReport");
export type I18n = typeof i18n;
