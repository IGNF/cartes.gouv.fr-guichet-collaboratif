import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const FeatureTypeFormFieldsFrTranslations: Translations<"fr">["FeatureTypeFormFields"] = {
    select_placeholder: "Sélectionnez une option",
    yes: "Oui",
    no: "Non",
    null: "Nul",
    upload_file_label: "Ajouter un fichier",
    upload_files_label: "Ajouter des fichiers",
    upload_file_hint: "Taille Maximum: 500 MB. Formats supportés: jpg, png, pdf. Plusieurs fichiers possibles.",
};

export const FeatureTypeFormFieldsEnTranslations: Translations<"en">["FeatureTypeFormFields"] = {
    select_placeholder: "Select an option",
    yes: "Yes",
    no: "No",
    null: "Null",
    upload_file_label: "Add file",
    upload_files_label: "Add files",
    upload_file_hint: "Maximum size: 500 MB. Supported formats: jpg, png, pdf. Multiple files possible.",
};

const { i18n } = declareComponentKeys<"select_placeholder" | "yes" | "no" | "null" | "upload_file_label" | "upload_files_label" | "upload_file_hint">()(
    "FeatureTypeFormFields"
);

export type I18n = typeof i18n;
