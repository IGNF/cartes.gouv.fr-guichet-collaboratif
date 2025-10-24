import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const WorkingLayerControlFrTranslations: Translations<"fr">["WorkingLayerControl"] = {
    working_layer: "Couche de travail :",
    read_only: "Lecture",
};

export const WorkingLayerControlEnTranslations: Translations<"en">["WorkingLayerControl"] = {
    working_layer: "Working layer:",
    read_only: "Read only",
};

const { i18n } = declareComponentKeys<"read_only" | "working_layer">()("WorkingLayerControl");
export type I18n = typeof i18n;
