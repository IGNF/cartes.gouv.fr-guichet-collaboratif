import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const WorkingLayerLabelMapFrTranslations: Translations<"fr">["WorkingLayerLabelMap"] = {
    working_layer: "Couche de travail :",
};

export const WorkingLayerLabelMapEnTranslations: Translations<"en">["WorkingLayerLabelMap"] = {
    working_layer: "Working layer:",
};

const { i18n } = declareComponentKeys<"working_layer">()("WorkingLayerLabelMap");
export type I18n = typeof i18n;
