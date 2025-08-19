import type { GenericTranslations } from "i18nifty";

export const languages = ["fr", "en"] as const;

export const fallbackLanguage = "fr";

export const languagesDisplayNames: Record<Language, string> = {
    fr: "Français",
    en: "English",
};

export type Language = (typeof languages)[number];

export type ComponentKey =
    | import("../components/Layout/locale/AppFooter.locale").I18n
    | import("../components/Layout/locale/AppHeader.locale").I18n
    | import("../components/Layout/locale/MapToolbar.locale").I18n
    | import("../pages/locale/NotConnected.locale").I18n
    | import("../pages/locale/NotFound.locale").I18n;

export type Translations<L extends Language> = GenericTranslations<ComponentKey, Language, typeof fallbackLanguage, L>;
