import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const SketchListFrTranslations: Translations<"fr">["SketchList"] = {
    no_sketch: "Aucun croquis associé",
    display_error: "Impossible d'afficher ce croquis : sa géométrie est vide ou non définie.",
    delete: "Supprimer",
};

export const SketchListEnTranslations: Translations<"en">["SketchList"] = {
    no_sketch: "No sketch associated",
    display_error: "Unable to display this sketch: its geometry is empty or undefined.",
    delete: "Delete",
};

const { i18n } = declareComponentKeys<"no_sketch" | "display_error" | "delete">()("SketchList");
export type I18n = typeof i18n;
