import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ThemeFormFrTranslations: Translations<"fr">["ThemeForm"] = {
    mandatory_field: "Ce champ est obligatoire.",
};

export const ThemeFormEnTranslations: Translations<"en">["ThemeForm"] = {
    mandatory_field: "This field is required.",
};

const { i18n } = declareComponentKeys<"mandatory_field">()("ThemeForm");
export type I18n = typeof i18n;
