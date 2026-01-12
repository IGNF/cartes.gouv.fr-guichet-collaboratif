import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const useDeleteReportFrTranslations: Translations<"fr">["useDeleteReport"] = {
    report_document_deleted_error: "Erreur dans la suppression des documents du signalement !",
    report_deleted_error: "Erreur dans la suppression du signalement !",
    report_deleted_success: ({ reportId }: { reportId: number }) => `Le signalement ${reportId} est supprimé avec succès.`,
};

export const useDeleteReportEnTranslations: Translations<"en">["useDeleteReport"] = {
    report_document_deleted_error: "Error deleting documents from the report!",
    report_deleted_error: "Error deleting report!",
    report_deleted_success: ({ reportId }: { reportId: number }) => `Report ${reportId} is successfully deleted.`,
};

const { i18n } = declareComponentKeys<
    "report_document_deleted_error" | "report_deleted_error" | { K: "report_deleted_success"; P: { reportId: number }; R: string }
>()("useDeleteReport");
export type I18n = typeof i18n;
