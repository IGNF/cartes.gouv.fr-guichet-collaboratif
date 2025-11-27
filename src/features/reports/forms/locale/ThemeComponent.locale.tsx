import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ThemeComponentFrTranslations: Translations<"fr">["ThemeComponent"] = {
    select_theme: "Choisir un thème *:",
    draw_sketch: "Dessiner un croquis",
    submit_theme: "Enregistrer le thème",
};

export const ThemeComponentEnTranslations: Translations<"en">["ThemeComponent"] = {
    select_theme: "Choose a theme *:",
    draw_sketch: "Draw a sketch",
    submit_theme: "Save the theme",
};

const { i18n } = declareComponentKeys<"select_theme" | "draw_sketch" | "submit_theme">()("ThemeComponent");
export type I18n = typeof i18n;
