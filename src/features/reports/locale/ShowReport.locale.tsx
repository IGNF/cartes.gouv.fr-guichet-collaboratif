import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ShowReportFrTranslations: Translations<"fr">["ShowReport"] = {
    report_title: ({ reportId }: { reportId: number }) => `Signalement ${reportId}`,
    report_theme: "Thème :",
    report_sketch_list: "Liste des croquis :",
    report_description: "Description :",
    report_document_list: "Liste des documents :",
    report_document_modify: "Modifier",
};

export const ShowReportEnTranslations: Translations<"en">["ShowReport"] = {
    report_title: ({ reportId }: { reportId: number }) => `Report ${reportId}`,
    report_theme: "Theme:",
    report_sketch_list: "List of sketches:",
    report_description: "Description:",
    report_document_list: "List of documents:",
    report_document_modify: "Modify",
};

const { i18n } = declareComponentKeys<
    | { K: "report_title"; P: { reportId: number }; R: string }
    | "report_theme"
    | "report_sketch_list"
    | "report_description"
    | "report_document_list"
    | "report_document_modify"
>()("ShowReport");
export type I18n = typeof i18n;
