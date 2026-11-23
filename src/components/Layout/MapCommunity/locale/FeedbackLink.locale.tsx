import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const FeedbackLinkFrTranslations: Translations<"fr">["FeedbackLink"] = {
    feedback_label: "Je donne mon avis",
    new_window: "nouvelle fenêtre",
};

export const FeedbackLinkEnTranslations: Translations<"en">["FeedbackLink"] = {
    feedback_label: "Give my feedback",
    new_window: "new window",
};

const { i18n } = declareComponentKeys<"feedback_label" | "new_window">()("FeedbackLink");
export type I18n = typeof i18n;
