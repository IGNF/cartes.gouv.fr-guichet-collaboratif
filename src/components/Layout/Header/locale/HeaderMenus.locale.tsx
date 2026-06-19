import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const HeaderMenusFrTranslations: Translations<"fr">["HeaderMenus"] = {
    question: "Questions fréquentes",
    help: "Aide",
    new_window: "ouvre une nouvelle fenêtre",
    user_guide: "Guide d’utilisation",
    status: "Niveau de service",
    contact_us: "Nous contacter",
    service: "Services",
    explore: "Explorer les cartes",
    search: "Rechercher une donnée",
    publish: "Publier une donnée",
    create: "Créer une carte",
    discover: "Découvrir",
    board: "Tableau de bord",
    account: "Mon espace",
    disconnect: "Se déconnecter",
};

export const HeaderMenusEnTranslations: Translations<"en">["HeaderMenus"] = {
    question: "Frequently Asked Questions",
    help: "Help",
    new_window: "opens a new window",
    user_guide: "Operating manual",
    status: "Service level",
    contact_us: "Contact us",
    service: "Service",
    explore: "Explore maps",
    search: "Search data",
    publish: "Publish data",
    create: "Create a map",
    discover: "Discover",
    board: "Dashboard",
    account: "My space",
    disconnect: "Disconnect",
};

const { i18n } = declareComponentKeys<
    | "question"
    | "help"
    | "new_window"
    | "user_guide"
    | "status"
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
