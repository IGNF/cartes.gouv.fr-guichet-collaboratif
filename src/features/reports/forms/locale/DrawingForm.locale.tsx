import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const DrawingFormFrTranslations: Translations<"fr">["DrawingForm"] = {
    drawing_message: "Vous pouvez ici réaliser/importer un croquis explicatif sur la carte:",
    creation_tools: "Outils de création",
    edit_tools: "Outils de modification",
    hide_sketchToEdit: "Annuler",
    show_sketchToEdit: "Ajouter",
    save_sketch: "Enregitrer",
};

export const DrawingFormEnTranslations: Translations<"en">["DrawingForm"] = {
    drawing_message: "Here you can create/import an explanatory sketch on the map:",
    creation_tools: "Creation tools",
    edit_tools: "Editing tools",
    hide_sketchToEdit: "Cancel",
    show_sketchToEdit: "Add",
    save_sketch: "Save",
};

const { i18n } = declareComponentKeys<"drawing_message" | "creation_tools" | "edit_tools" | "hide_sketchToEdit" | "show_sketchToEdit" | "save_sketch">()(
    "DrawingForm"
);
export type I18n = typeof i18n;
