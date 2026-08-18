import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const useGetInteractionsFuncsFrTranslations: Translations<"fr">["useGetInteractionsFuncs"] = {
    shortest_path_select_start: ({ layers }) => `Sélectionnez un premier objet parmi la/les couche(s) : ${layers}`,
    shortest_path_select_end: "Sélectionnez le second objet",
    shortest_path_same_object: "Sélectionnez un autre objet!",
    shortest_path_no_path: "Aucun chemin trouvé entre les objets",
    shortest_path_computing: "Calcul du plus court chemin en cours…",
    shortest_path_created: "Plus court chemin créé",
    shortest_path_not_supported: "Le plus court chemin est disponible uniquement pour les couches linéaires",
    shortest_path_not_ready: "Le plus court chemin n'est pas disponible pour cette couche",
    merge_not_adjacent: "Les objets sélectionnés ne sont pas en contact, la fusion est impossible",
};

export const useGetInteractionsFuncsEnTranslations: Translations<"en">["useGetInteractionsFuncs"] = {
    shortest_path_select_start: ({ layers }) => `Select a first object from layer(s): ${layers}`,
    shortest_path_select_end: "Select the second object for the shortest path",
    shortest_path_same_object: "Select a different object to compute the shortest path",
    shortest_path_no_path: "No topological path found between these objects",
    shortest_path_computing: "Computing the shortest path…",
    shortest_path_created: "Shortest path created",
    shortest_path_not_supported: "Shortest path is available only for linear layers",
    shortest_path_not_ready: "Shortest path is not available for this layer",
    merge_not_adjacent: "Selected objects are not in contact, merge is not possible",
};

const { i18n } = declareComponentKeys<
    | { K: "shortest_path_select_start"; P: { layers: string } }
    | "shortest_path_select_end"
    | "shortest_path_same_object"
    | "shortest_path_no_path"
    | "shortest_path_computing"
    | "shortest_path_created"
    | "shortest_path_not_supported"
    | "shortest_path_not_ready"
    | "merge_not_adjacent"
>()("useGetInteractionsFuncs");

export type I18n = typeof i18n;
