import { declareComponentKeys } from "i18nifty";
import type { Translations } from "../../../i18n/types";

export const AppHeaderFrTranslations: Translations<"fr">["AppHeader"] = {
    home_title: "Retour à l'accueil du site - cartes.gouv.fr - République Française",
    home_service: "Accueil - cartes.gouv.fr - Institut National de l'Information Géographique et Forestière",
    login: "Se connecter",
    logout: "Se déconnecter",
    my_space: "Mon espace",
    badge_label: "Contribuer",
};

export const AppHeaderEnTranslations: Translations<"en">["AppHeader"] = {
    home_title: "Back to home page - cartes.gouv.fr - French Republic",
    home_service: "Home - cartes.gouv.fr - National Institute of Geographic and Forest Information",
    login: "Sign in",
    logout: "Sign out",
    my_space: "My space",
    badge_label: "Contribute",
};

const { i18n } = declareComponentKeys<"home_title" | "login" | "logout" | "my_space" | "home_service" | "badge_label">()("AppHeader");
export type I18n = typeof i18n;
