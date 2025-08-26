import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const DrawingControlFrTranslations: Translations<"fr">["DrawingControl"] = {
    layer_title: "Dessins",
    layer_description: "Mes dessins",
    control_label: "Soumettre un signalement",
};

export const DrawingControlEnTranslations: Translations<"en">["DrawingControl"] = {
    layer_title: "Drawing",
    layer_description: "My drawings",
    control_label: "Create report",
};

const { i18n } = declareComponentKeys<"layer_title" | "layer_description" | "control_label">()("DrawingControl");
export type I18n = typeof i18n;
