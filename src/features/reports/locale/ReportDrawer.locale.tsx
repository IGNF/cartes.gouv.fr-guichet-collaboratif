import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ReportDrawerFrTranslations: Translations<"fr">["ReportDrawer"] = {
    close: "Fermer",
};

export const ReportDrawerEnTranslations: Translations<"en">["ReportDrawer"] = {
    close: "Close",
};

const { i18n } = declareComponentKeys<"close">()("ReportDrawer");
export type I18n = typeof i18n;
