import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const CommunityTitleFrTranslations: Translations<"fr">["CommunityTitle"] = {
    info_button_title: "Informations sur le guichet",
    logo_alt: "Logo du guichet",
};

export const CommunityTitleEnTranslations: Translations<"en">["CommunityTitle"] = {
    info_button_title: "Community information",
    logo_alt: "Community logo",
};

const { i18n } = declareComponentKeys<"info_button_title" | "logo_alt">()("CommunityTitle");
export type I18n = typeof i18n;
