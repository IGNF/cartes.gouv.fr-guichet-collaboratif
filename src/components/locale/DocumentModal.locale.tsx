import { declareComponentKeys } from "i18nifty";

import { Translations } from "@/i18n/types";

export const DocumentModalFrTranslations: Translations<"fr">["DocumentModal"] = {
    title: "Document",
    no_document: "Aucun document associé",
    open_document: "Ouvrir le document",
    download_document: "Télécharger",
    downloading: "Téléchargement…",
    download_error: "Le téléchargement du document a échoué.",
    replace_document: "Remplacer le document",
    add_document: "Ajouter un document",
    save: "Enregistrer",
    delete: "Supprimer",
    saving: "Enregistrement du document…",
    deleting: "Suppression du document…",
    operation_error: "L'opération sur le document a échoué.",
};

export const DocumentModalEnTranslations: Translations<"en">["DocumentModal"] = {
    title: "Document",
    no_document: "No associated document",
    open_document: "Open document",
    download_document: "Download",
    downloading: "Downloading…",
    download_error: "The document download failed.",
    replace_document: "Replace document",
    add_document: "Add a document",
    save: "Save",
    delete: "Delete",
    saving: "Saving document…",
    deleting: "Deleting document…",
    operation_error: "The document operation failed.",
};

const { i18n } = declareComponentKeys<
    | "title"
    | "no_document"
    | "open_document"
    | "download_document"
    | "downloading"
    | "download_error"
    | "replace_document"
    | "add_document"
    | "save"
    | "delete"
    | "saving"
    | "deleting"
    | "operation_error"
>()("DocumentModal");

export type I18n = typeof i18n;
