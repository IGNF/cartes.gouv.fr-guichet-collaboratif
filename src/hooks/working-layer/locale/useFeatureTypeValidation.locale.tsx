import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const useFeatureTypeValidationFrTranslations: Translations<"fr">["useFeatureTypeValidation"] = {
    value_empty: "(vide)",
    value_null: "Aucune valeur",
    value_yes: "Oui",
    value_no: "Non",

    upload_label: "Importer un fichier",
    upload_multiple_label: "Importer des fichiers",

    error_required: "Ce champ est requis.",
    error_min_value: "La valeur est inférieure au minimum autorisé.",
    error_max_value: "La valeur est supérieure au maximum autorisé.",
    error_min_length: "Le texte est trop court.",
    error_max_length: "Le texte est trop long.",
    error_pattern: "Le format n'est pas valide.",
    error_integer: "Veuillez entrer un nombre entier.",
    error_date: "Veuillez entrer une date valide.",
    error_boolean: "Valeur booléenne invalide.",
    error_document: "Erreur lors du téléchargement du fichier.",
};

export const useFeatureTypeValidationEnTranslations: Translations<"en">["useFeatureTypeValidation"] = {
    value_empty: "(empty)",
    value_null: "No value",
    value_yes: "Yes",
    value_no: "No",

    upload_label: "Upload file",
    upload_multiple_label: "Upload files",

    error_required: "This field is required.",
    error_min_value: "Value is below the required minimum.",
    error_max_value: "Value exceeds the allowed maximum.",
    error_min_length: "The text is too short.",
    error_max_length: "The text is too long.",
    error_pattern: "The format is invalid.",
    error_integer: "Please enter an integer.",
    error_date: "Please enter a valid date.",
    error_boolean: "Invalid boolean value.",
    error_document: "File upload error.",
};

const { i18n } = declareComponentKeys<
    | "value_empty"
    | "value_null"
    | "value_yes"
    | "value_no"
    | "upload_label"
    | "upload_multiple_label"
    | "error_required"
    | "error_min_value"
    | "error_max_value"
    | "error_min_length"
    | "error_max_length"
    | "error_pattern"
    | "error_integer"
    | "error_date"
    | "error_boolean"
    | "error_document"
>()("useFeatureTypeValidation");

export type I18n = typeof i18n;
