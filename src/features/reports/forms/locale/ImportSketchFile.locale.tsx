import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ImportSketchFileFrTranslations: Translations<"fr">["ImportSketchFile"] = {
    import_file_error: ({ fileName }: { fileName: string }) =>
        `Le fichier "${fileName}" ne peut pas être importé. Seuls les formats kml, gpx et geojson sont supportés`,
};

export const ImportSketchFileEnTranslations: Translations<"en">["ImportSketchFile"] = {
    import_file_error: ({ fileName }: { fileName: string }) => `The file "${fileName}" cannot be imported. Only kml, gpx, and geojson formats are supported.`,
};

const { i18n } = declareComponentKeys<{ K: "import_file_error"; P: { fileName: string }; R: string }>()("ImportSketchFile");
export type I18n = typeof i18n;
