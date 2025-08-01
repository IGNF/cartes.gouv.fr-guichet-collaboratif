import type { GenericTranslations } from "i18nifty";

export const languages = ["fr", "en"] as const;

export const fallbackLanguage = "fr";

export const languagesDisplayNames: Record<Language, string> = {
    fr: "Français",
    en: "English",
};

export type Language = (typeof languages)[number];

export type ComponentKey = import("../components/Layout/AppFooter").I18n;

export type Translations<L extends Language> = GenericTranslations<ComponentKey, Language, typeof fallbackLanguage, L>;
