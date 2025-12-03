import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ReviewContributionsFrTranslations: Translations<"fr">["ReviewContributions"] = {
    previous: "Contribution précedente",
    next: "Contribution suivante",
};

export const ReviewContributionsEnTranslations: Translations<"en">["ReviewContributions"] = {
    previous: "Previous contribution",
    next: "Next contribution",
};

const { i18n } = declareComponentKeys<"previous" | "next">()("ReviewContributions");
export type I18n = typeof i18n;
