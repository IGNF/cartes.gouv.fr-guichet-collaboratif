import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ThemeFormFrTranslations: Translations<"fr">["ThemeForm"] = {
    mandatory_field: "Ce champ est obligatoire.",
    integer_status: "Veuillez saisir un nombre entier valide.",
};

export const ThemeFormEnTranslations: Translations<"en">["ThemeForm"] = {
    mandatory_field: "This field is required.",
    integer_status: "Please enter a valid integer.",
};

const { i18n } = declareComponentKeys<"mandatory_field" | "integer_status">()("ThemeForm");
export type I18n = typeof i18n;
