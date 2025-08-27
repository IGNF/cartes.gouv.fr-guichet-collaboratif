import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const useGetWMSLayerFrTranslations: Translations<"fr">["useGetWMSLayer"] = {
    loading_layer_error: ({ layerTitle }: { layerTitle: string }) => `Erreur dans le chargement de la couche ${layerTitle}`,
};

export const useGetWMSLayerEnTranslations: Translations<"en">["useGetWMSLayer"] = {
    loading_layer_error: ({ layerTitle }: { layerTitle: string }) => `Error loading layer ${layerTitle}`,
};

const { i18n } = declareComponentKeys<{ K: "loading_layer_error"; P: { layerTitle: string }; R: string }>()("useGetWMSLayer");
export type I18n = typeof i18n;
