import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const useGetInteractionsFuncsFrTranslations: Translations<"fr">["useGetInteractionsFuncs"] = {
    shortest_path_select_start: "Selectionnez un premier objet",
    shortest_path_select_end: "Selectionnez le second objet",
    shortest_path_same_object: "Selectionnez un autre objet!",
    shortest_path_no_path: "Aucun chemin trouvé entre les objets",
    shortest_path_created: "Plus court chemin créé",
    shortest_path_not_supported: "Le plus court chemin est disponible uniquement pour les couches lineaires",
    shortest_path_not_ready: "Le plus court chemin n'est pas disponible pour cette couche",
};

export const useGetInteractionsFuncsEnTranslations: Translations<"en">["useGetInteractionsFuncs"] = {
    shortest_path_select_start: "Select the first object for the shortest path",
    shortest_path_select_end: "Select the second object for the shortest path",
    shortest_path_same_object: "Select a different object to compute the shortest path",
    shortest_path_no_path: "No topological path found between these objects",
    shortest_path_created: "Shortest path created",
    shortest_path_not_supported: "Shortest path is available only for linear layers",
    shortest_path_not_ready: "Shortest path is not available for this layer",
};

const { i18n } = declareComponentKeys<
    | "shortest_path_select_start"
    | "shortest_path_select_end"
    | "shortest_path_same_object"
    | "shortest_path_no_path"
    | "shortest_path_created"
    | "shortest_path_not_supported"
    | "shortest_path_not_ready"
>()("useGetInteractionsFuncs");

export type I18n = typeof i18n;
