import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const AttachmentListFrTranslations: Translations<"fr">["AttachmentList"] = {
    no_attachments: "Aucun document associé",
    delete_file: ({ fileName }: { fileName: string }) => `Supprimer ${fileName}`,
    attchment_deleted_error: ({ fileName }: { fileName: string }) => `Erreur dans la suppression du document ${fileName}`,
    attchment_deleted_success: ({ fileName }: { fileName: string }) => `Suppression du document ${fileName} avec succès`,
    view_file: ({ fileName }: { fileName: string }) => `Voir ${fileName}`,
    view: "Voir",
    confirm_delete_title: "Attention",
    confirm_delete_description: ({ fileName }: { fileName: string }) => `Êtes-vous sûr de vouloir supprimer le document ${fileName} ?`,
    yes: "Oui",
    no: "Non",
};

export const AttachmentListEnTranslations: Translations<"en">["AttachmentList"] = {
    no_attachments: "No associated attachments",
    delete_file: ({ fileName }: { fileName: string }) => `Delete ${fileName}`,
    attchment_deleted_error: ({ fileName }: { fileName: string }) => `Error deleting attachment ${fileName}`,
    attchment_deleted_success: ({ fileName }: { fileName: string }) => `Successfully deleted attachment ${fileName}`,
    view_file: ({ fileName }: { fileName: string }) => `View ${fileName}`,
    view: "View",
    confirm_delete_title: "Warning",
    confirm_delete_description: ({ fileName }: { fileName: string }) => `Are you sure you want to delete the document ${fileName}?`,
    yes: "Yes",
    no: "No",
};

const { i18n } = declareComponentKeys<
    | "no_attachments"
    | { K: "delete_file"; P: { fileName: string }; R: string }
    | { K: "attchment_deleted_error"; P: { fileName: string }; R: string }
    | { K: "attchment_deleted_success"; P: { fileName: string }; R: string }
    | { K: "view_file"; P: { fileName: string }; R: string }
    | "view"
    | "confirm_delete_title"
    | { K: "confirm_delete_description"; P: { fileName: string }; R: string }
    | "yes"
    | "no"
>()("AttachmentList");
export type I18n = typeof i18n;
