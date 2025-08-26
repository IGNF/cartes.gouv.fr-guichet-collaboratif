import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const useReportToolsFrTranslations: Translations<"fr">["useReportTools"] = {
    point_title: "Créer un marqueur",
    line_title: "Dessiner des lignes",
    polygon_title: "Dessiner des polygones",
    text_title: "Ecrire sur la carte",
    import_title: "Importer un fichier gpx, kml ou geojson",
    edit_title: "Modifier la géométrie ou déplacer le texte",
    display_title: "Editer le style",
    tooltip_title: "Editer le texte",
    remove_title: "Supprimer des objets",
};

export const useReportToolsEnTranslations: Translations<"en">["useReportTools"] = {
    point_title: "Create a marker",
    line_title: "Draw lines",
    polygon_title: "Draw polygons",
    text_title: "Write on the map",
    import_title: "Import a gpx, kml or geojson file",
    edit_title: "Change geometry or move text",
    display_title: "Edit style",
    tooltip_title: "Edit text",
    remove_title: "Delete objects",
};

const { i18n } = declareComponentKeys<
    "point_title" | "line_title" | "polygon_title" | "text_title" | "import_title" | "edit_title" | "display_title" | "tooltip_title" | "remove_title"
>()("useReportTools");
export type I18n = typeof i18n;
