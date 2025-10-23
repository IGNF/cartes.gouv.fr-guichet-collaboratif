import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const CustomControlsFrTranslations: Translations<"fr">["CustomControls"] = {
    selector: "Sélecteur",
    create_report: "Soumettre un signalement",
    add_object: "Ajouter un objet",
    cut_object: "Couper un objet",
    delete_object: "Supprimer un objet",
    measure_distance: "Mesurer la distance",
};

export const CustomControlsEnTranslations: Translations<"en">["CustomControls"] = {
    selector: "Selector",
    create_report: "Submit a report",
    add_object: "Add an object",
    cut_object: "Cut an object",
    delete_object: "Delete an object",
    measure_distance: "Measure distance",
};

const { i18n } = declareComponentKeys<"selector" | "create_report" | "add_object" | "cut_object" | "delete_object" | "measure_distance">()("CustomControls");
export type I18n = typeof i18n;
