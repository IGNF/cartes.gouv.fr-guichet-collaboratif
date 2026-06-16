import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const HeaderMenusFrTranslations: Translations<"fr">["HeaderMenus"] = {
    question: "Questions fréquentes",
    help: "Aide",
    new_window: "ouvre une nouvelle fenêtre",
    user_guide: "Guide d’utilisation",
    contact_us: "Nous contacter",
    service: "Services",
    explore: "Explorer les cartes",
    search: "Rechercher une donnée",
    publish: "Publier une donnée",
    create: "Créer une carte",
    discover: "Découvrir",
    board: "Tableau de bord",
    account: "Mon compte",
    disconnect: "Se déconnecter",
};

export const HeaderMenusEnTranslations: Translations<"en">["HeaderMenus"] = {
    question: "Frequently Asked Questions",
    help: "Help",
    new_window: "opens a new window",
    user_guide: "Operating manual",
    contact_us: "Contact us",
    service: "Service",
    explore: "Explore maps",
    search: "Search data",
    publish: "Publish data",
    create: "Create a map",
    discover: "Discover",
    board: "Dashboard",
    account: "My account",
    disconnect: "Disconnect",
};

const { i18n } = declareComponentKeys<
    | "question"
    | "help"
    | "new_window"
    | "user_guide"
    | "contact_us"
    | "service"
    | "explore"
    | "search"
    | "publish"
    | "create"
    | "discover"
    | "board"
    | "account"
    | "disconnect"
>()("HeaderMenus");
export type I18n = typeof i18n;
