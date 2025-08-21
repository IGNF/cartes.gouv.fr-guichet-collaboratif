import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const DrawerComponentFrTranslations: Translations<"fr">["DrawerComponent"] = {
    button_title: "Fermer",
};

export const DrawerComponentEnTranslations: Translations<"en">["DrawerComponent"] = {
    button_title: "Close",
};

const { i18n } = declareComponentKeys<"button_title">()("DrawerComponent");
export type I18n = typeof i18n;
