import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const GetReportsLayerFrTranslations: Translations<"fr">["GetReportsLayer"] = {
    reports_title: "Signalements",
    reports_legend: "Légende signalements",
};

export const GetReportsLayerEnTranslations: Translations<"en">["GetReportsLayer"] = {
    reports_title: "Reports",
    reports_legend: "Reports legend",
};

const { i18n } = declareComponentKeys<"reports_title" | "reports_legend">()("GetReportsLayer");
export type I18n = typeof i18n;
