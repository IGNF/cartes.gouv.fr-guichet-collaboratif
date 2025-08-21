import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const CreateReportFrTranslations: Translations<"fr">["CreateReport"] = {
    report_created_error: "Erreur dans la création du signalement",
    report_created_success: "Votre signalement a été envoyé avec succès.",
    report_document_uploaded_error: "Erreur dans le chargement de document",
    report_document_uploaded_success: "Chargement du document avec succès.",
};

export const CreateReportEnTranslations: Translations<"en">["CreateReport"] = {
    report_created_error: "Error in creating the report",
    report_created_success: "Your report has been sent successfully.",
    report_document_uploaded_error: "Error loading document",
    report_document_uploaded_success: "Document loaded successfully.",
};

const { i18n } = declareComponentKeys<
    "report_created_error" | "report_created_success" | "report_document_uploaded_error" | "report_document_uploaded_success"
>()("CreateReport");
export type I18n = typeof i18n;
