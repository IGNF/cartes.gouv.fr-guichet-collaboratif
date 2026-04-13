import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const CustomControlsFrTranslations: Translations<"fr">["CustomControls"] = {
    selector: "Sélecteur",
    create_report: "Soumettre un signalement",
    add_object: "Ajouter un objet",
    cut_object: "Couper un objet linéaire",
    modify_object: "Modifier la géometrie d'un objet",
    delete_object: "Supprimer un objet",
    measure_distance: "Mesurer la distance",
    measure_area: "Mesurer une surface",
    measure_azim: "Mesurer un azimut",
    please_select_object: "Veuillez sélectionner un objet",
    export_image: "Exporter la carte en image",
};

export const CustomControlsEnTranslations: Translations<"en">["CustomControls"] = {
    selector: "Selector",
    create_report: "Submit a report",
    add_object: "Add an object",
    cut_object: "Cut an object",
    modify_object: "Modify the geometry of an object",
    delete_object: "Delete an object",
    measure_distance: "Measure a distance",
    measure_area: "Measure an area",
    measure_azim: "Measure an azimuth",
    please_select_object: "Please select an object",
    export_image: "Export map as an image",
};

const { i18n } = declareComponentKeys<
    | "selector"
    | "create_report"
    | "add_object"
    | "cut_object"
    | "modify_object"
    | "delete_object"
    | "measure_distance"
    | "measure_area"
    | "measure_azim"
    | "please_select_object"
    | "export_image"
>()("CustomControls");
export type I18n = typeof i18n;
