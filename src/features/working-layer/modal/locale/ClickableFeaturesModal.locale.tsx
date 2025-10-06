import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ClickableFeaturesModalFrTranslations: Translations<"fr">["ClickableFeaturesModal"] = {
    close: "Fermer",
    title: "Veuillez choisir un objet",
};

export const ClickableFeaturesModalEnTranslations: Translations<"en">["ClickableFeaturesModal"] = {
    close: "Close",
    title: "Please choose an object",
};

const { i18n } = declareComponentKeys<"close" | "title">()("ClickableFeaturesModal");
export type I18n = typeof i18n;
