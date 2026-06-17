import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const BetaBadgeFrTranslations: Translations<"fr">["BetaBadge"] = {
    beta_label: "VERSION BÊTA",
};

export const BetaBadgeEnTranslations: Translations<"en">["BetaBadge"] = {
    beta_label: "BETA VERSION",
};

const { i18n } = declareComponentKeys<"beta_label">()("BetaBadge");
export type I18n = typeof i18n;
