import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const useCenterViewToReportControlFrTranslations: Translations<"fr">["useCenterViewToReportControl"] = {
    center_to_report_title: "Centrer la carte sur le signalement",
    report_to_center_title: "Déplacer le signalement au centre de la carte",
};

export const useCenterViewToReportControlEnTranslations: Translations<"en">["useCenterViewToReportControl"] = {
    center_to_report_title: "Center the map on the report",
    report_to_center_title: "Move the report to the center of the map",
};

const { i18n } = declareComponentKeys<"center_to_report_title" | "report_to_center_title">()("useCenterViewToReportControl");
export type I18n = typeof i18n;
