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
    copy_object: "Copier un objet",
    paste_object: "Coller un objet",
    shortest_path: "Créer un plus court chemin",
    merge_objects: "Fusionner 2 objets en contact",
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
    copy_object: "Copy an object",
    paste_object: "Paste an object",
    shortest_path: "Create a shortest path",
    merge_objects: "Merge 2 touching objects",
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
    | "copy_object"
    | "paste_object"
    | "shortest_path"
    | "merge_objects"
>()("CustomControls");
export type I18n = typeof i18n;
