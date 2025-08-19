import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const NotConnectedFrTranslations: Translations<"fr">["NotConnected"] = {
    not_connected_message: "Vous n'êtes pas connecté !",
    login: "Se connecter",
};

export const NotConnectedEnTranslations: Translations<"en">["NotConnected"] = {
    not_connected_message: "You are not logged in!",
    login: "Sign in",
};

const { i18n } = declareComponentKeys<"not_connected_message" | "login">()("NotConnected");
export type I18n = typeof i18n;
