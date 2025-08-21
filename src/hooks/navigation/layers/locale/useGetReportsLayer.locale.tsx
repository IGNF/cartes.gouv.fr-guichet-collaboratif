import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const useGetReportsLayerFrTranslations: Translations<"fr">["useGetReportsLayer"] = {
    loading_report_layer_error: "Erreur dans le chargement de la couche Signalements",
};

export const useGetReportsLayerEnTranslations: Translations<"en">["useGetReportsLayer"] = {
    loading_report_layer_error: "Error loading the Reports layer",
};

const { i18n } = declareComponentKeys<"loading_report_layer_error">()("useGetReportsLayer");
export type I18n = typeof i18n;
