import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const EditReportFrTranslations: Translations<"fr">["EditReport"] = {
    report_deleted_error: "Erreur dans la suppression du signalement !",
    report_deleted_success: ({ reportId }: { reportId: number }) => `Le signalement ${reportId} est supprimé avec succès.`,
    report_updated_error: "Erreur dans la mise à jour du signalement",
    report_updated_success: ({ reportId }: { reportId: number }) => `Le signalement ${reportId} a été mis à jour avec succès.`,
    report_document_deleted_error: "Erreur dans la suppression des documents du signalement !",
    report_document_uploaded_error: "Erreur dans le chargement de document",
    report_document_uploaded_success: "Chargement du document avec succès.",
    report_no_permission: "Vous n'avez pas les droits nécessaires pour effectuer cette action.",
};

export const EditReportEnTranslations: Translations<"en">["EditReport"] = {
    report_deleted_error: "Error deleting report!",
    report_deleted_success: ({ reportId }: { reportId: number }) => `Report ${reportId} is successfully deleted.`,
    report_updated_error: "Error in updating the report",
    report_updated_success: ({ reportId }: { reportId: number }) => `Report ${reportId} has been successfully updated.`,
    report_document_deleted_error: "Error deleting documents from the report!",
    report_document_uploaded_error: "Error loading document",
    report_document_uploaded_success: "Document loaded successfully.",
    report_no_permission: "You do not have the necessary permissions to perform this action.",
};

const { i18n } = declareComponentKeys<
    | "report_deleted_error"
    | { K: "report_deleted_success"; P: { reportId: number }; R: string }
    | "report_updated_error"
    | { K: "report_updated_success"; P: { reportId: number }; R: string }
    | "report_document_deleted_error"
    | "report_document_uploaded_error"
    | "report_document_uploaded_success"
    | "report_no_permission"
>()("EditReport");
export type I18n = typeof i18n;
