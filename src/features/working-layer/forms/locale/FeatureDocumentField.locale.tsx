import { declareComponentKeys } from "i18nifty";

import { Translations } from "@/i18n/types";

export const FeatureDocumentFieldFrTranslations: Translations<"fr">["FeatureDocumentField"] = {
    view_document: "Voir le document",
    add_document: "Ajouter un document",
    document_load_error: "Impossible de charger le document.",
    no_document: "Aucun document associé",
    pending_document_warning: "Ce fichier est encore local. Enregistrez les contributions pour le transmettre et l'associer à l'objet.",
};

export const FeatureDocumentFieldEnTranslations: Translations<"en">["FeatureDocumentField"] = {
    view_document: "View document",
    add_document: "Add document",
    document_load_error: "Unable to load the document.",
    no_document: "No associated document",
    pending_document_warning: "This file is still local. Save the contributions to upload it and associate it with the feature.",
};

const { i18n } = declareComponentKeys<"view_document" | "add_document" | "document_load_error" | "no_document" | "pending_document_warning">()(
    "FeatureDocumentField"
);

export type I18n = typeof i18n;
