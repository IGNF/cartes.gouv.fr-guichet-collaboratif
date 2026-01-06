import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const TableReportDrawerFrTranslations: Translations<"fr">["TableReportDrawer"] = {
    close: "Fermer",
    filters: "Filtres",
    share: "Partager",
};

export const TableReportDrawerEnTranslations: Translations<"en">["TableReportDrawer"] = {
    close: "Close",
    filters: "Filters",
    share: "Share",
};

const { i18n } = declareComponentKeys<"close" | "filters" | "share">()("TableReportDrawer");
export type I18n = typeof i18n;
