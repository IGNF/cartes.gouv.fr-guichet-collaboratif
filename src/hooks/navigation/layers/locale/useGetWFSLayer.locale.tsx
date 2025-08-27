import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const useGetWFSLayerFrTranslations: Translations<"fr">["useGetWFSLayer"] = {
    loading_layer_error: ({ layerTitle }: { layerTitle: string }) => `Erreur dans le chargement de la couche ${layerTitle}`,
};

export const useGetWFSLayerEnTranslations: Translations<"en">["useGetWFSLayer"] = {
    loading_layer_error: ({ layerTitle }: { layerTitle: string }) => `Error loading layer ${layerTitle}`,
};

const { i18n } = declareComponentKeys<{ K: "loading_layer_error"; P: { layerTitle: string }; R: string }>()("useGetWFSLayer");
export type I18n = typeof i18n;
