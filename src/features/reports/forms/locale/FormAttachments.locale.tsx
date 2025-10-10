import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const FormAttachmentsFrTranslations: Translations<"fr">["FormAttachments"] = {
    report_created_error: "Erreur dans la création du signalement",
    report_created_success: "Votre signalement a été envoyé avec succès.",
    report_document_uploaded_error: "Erreur dans le chargement de document",
    report_document_uploaded_success: "Chargement du document avec succès.",
    report_updated_success: ({ reportId }: { reportId: number }) => `Le signalement ${reportId} a été mis à jour avec succès.`,
    report_updated_error: "Erreur dans la mise à jour du signalement",
    import_attachments_label: "Aidez nous à comprendre votre signalement. Ajouter par exemple des photos ou autres documents pour préciser votre message.",
    import_attachments_hint: ({ maxSizeMB }: { maxSizeMB: number }) => `Taille maximale : ${maxSizeMB} Mo. Formats supportés : JPG, PNG, PDF`,
    import_file_error_message_type: `Formats supportés : JPG, PNG, PDF`,
    import_file_error_message_size: ({ maxSizeMB }: { maxSizeMB: number }) => `Taille maximale : ${maxSizeMB} Mo.`,
};

export const FormAttachmentsEnTranslations: Translations<"en">["FormAttachments"] = {
    report_created_error: "Error in creating the report",
    report_created_success: "Your report has been sent successfully.",
    report_document_uploaded_error: "Error loading document",
    report_document_uploaded_success: "Document loaded successfully.",
    report_updated_success: ({ reportId }: { reportId: number }) => `Report ${reportId} has been successfully updated.`,
    report_updated_error: "Error in updating the report",
    import_attachments_label: "Help us understand your report. For example, add photos or other documents to clarify your message.",
    import_attachments_hint: ({ maxSizeMB }: { maxSizeMB: number }) => `Maximum size: ${maxSizeMB} MB. Supported formats: JPG, PNG, PDF`,
    import_file_error_message_type: "Supported formats: JPG, PNG, PDF",
    import_file_error_message_size: ({ maxSizeMB }: { maxSizeMB: number }) => `Maximum size: ${maxSizeMB} MB.`,
};

const { i18n } = declareComponentKeys<
    | "report_created_error"
    | "report_created_success"
    | "report_document_uploaded_error"
    | "report_document_uploaded_success"
    | { K: "report_updated_success"; P: { reportId: number }; R: string }
    | "report_updated_error"
    | "import_attachments_label"
    | { K: "import_attachments_hint"; P: { maxSizeMB: number }; R: string }
    | "import_file_error_message_type"
    | { K: "import_file_error_message_size"; P: { maxSizeMB: number }; R: string }
>()("FormAttachments");
export type I18n = typeof i18n;
