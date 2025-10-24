import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const MesureLengthControlFrTranslations: Translations<"fr">["MesureLengthControl"] = {
    button_title: "Mesurer la distance",
};

export const MesureLengthControlEnTranslations: Translations<"en">["MesureLengthControl"] = {
    button_title: "Measure distance",
};

const { i18n } = declareComponentKeys<"button_title">()("MesureLengthControl");
export type I18n = typeof i18n;
