import { declareComponentKeys } from "i18nifty";
import type { Translations } from "../../../i18n/types";

export const AppHeaderFrTranslations: Translations<"fr">["AppHeader"] = {
    home_link: "Accueil - cartes.gouv.fr-guichet-collaboratif",
    login: "Se connecter",
    logout: "Se déconnecter",
};

export const AppHeaderEnTranslations: Translations<"en">["AppHeader"] = {
    home_link: "Home - cartes.gouv.fr-guichet-collaboratif",
    login: "Sign in",
    logout: "Sign out",
};

const { i18n } = declareComponentKeys<"home_link" | "login" | "logout">()("AppHeader");
export type I18n = typeof i18n;
