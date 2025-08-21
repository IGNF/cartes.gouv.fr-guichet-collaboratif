import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const useGetWMTSLayerFrTranslations: Translations<"fr">["useGetWMTSLayer"] = {
    loading_layer_error: ({ layerTitle }: { layerTitle: string }) => `Erreur dans le chargement de la couche ${layerTitle}`,
};

export const useGetWMTSLayerEnTranslations: Translations<"en">["useGetWMTSLayer"] = {
    loading_layer_error: ({ layerTitle }: { layerTitle: string }) => `Error loading layer ${layerTitle}`,
};

const { i18n } = declareComponentKeys<{ K: "loading_layer_error"; P: { layerTitle: string }; R: string }>()("useGetWMTSLayer");
export type I18n = typeof i18n;
