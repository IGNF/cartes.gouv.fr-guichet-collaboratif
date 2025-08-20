import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const AttachmentListFrTranslations: Translations<"fr">["AttachmentList"] = {
    no_attachments: "Aucun document associé",
    alt_img_uploaded_file: "Icone du fichier chargé",
    delete_file: ({ fileName }: { fileName: string }) => `Supprimer ${fileName}`,
    attchment_deleted_error: ({ fileName }: { fileName: string }) => `Erreur dans la suppression du document ${fileName}`,
    attchment_deleted_success: ({ fileName }: { fileName: string }) => `Suppression du document ${fileName} avec succès`,
};

export const AttachmentListEnTranslations: Translations<"en">["AttachmentList"] = {
    no_attachments: "No associated attachments",
    alt_img_uploaded_file: "Uploaded file icon",
    delete_file: ({ fileName }: { fileName: string }) => `Delete ${fileName}`,
    attchment_deleted_error: ({ fileName }: { fileName: string }) => `Error deleting attachment ${fileName}`,
    attchment_deleted_success: ({ fileName }: { fileName: string }) => `Successfully deleted attachment ${fileName}`,
};

const { i18n } = declareComponentKeys<
    | "no_attachments"
    | "alt_img_uploaded_file"
    | { K: "delete_file"; P: { fileName: string }; R: string }
    | { K: "attchment_deleted_error"; P: { fileName: string }; R: string }
    | { K: "attchment_deleted_success"; P: { fileName: string }; R: string }
>()("AttachmentList");
export type I18n = typeof i18n;
