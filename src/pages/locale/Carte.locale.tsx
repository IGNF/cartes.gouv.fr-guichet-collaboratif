import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const CarteFrTranslations: Translations<"fr">["Carte"] = {
    loading_user: "Connexion...",
    loading_community: "Chargement...",
};

export const CarteEnTranslations: Translations<"en">["Carte"] = {
    loading_user: "Connecting...",
    loading_community: "Loading community...",
};

const { i18n } = declareComponentKeys<"loading_user" | "loading_community">()("Carte");
export type I18n = typeof i18n;
