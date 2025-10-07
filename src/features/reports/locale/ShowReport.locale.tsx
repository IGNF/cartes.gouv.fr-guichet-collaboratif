import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ShowReportFrTranslations: Translations<"fr">["ShowReport"] = {
    report_title: ({ reportId }: { reportId: number }) => `Signalement ${reportId}`,
    report_back: "Tous les signalements",
    report_theme: "Thème :",
    report_sketch_list: "Croquis",
    report_description: "Description",
    report_document_list: "Documents",
    report_document_modify: "Modifier",
};

export const ShowReportEnTranslations: Translations<"en">["ShowReport"] = {
    report_title: ({ reportId }: { reportId: number }) => `Report ${reportId}`,
    report_back: "All reports",
    report_theme: "Theme:",
    report_sketch_list: "Sketches",
    report_description: "Description",
    report_document_list: "Documents",
    report_document_modify: "Modify",
};

const { i18n } = declareComponentKeys<
    | { K: "report_title"; P: { reportId: number }; R: string }
    | "report_back"
    | "report_theme"
    | "report_sketch_list"
    | "report_description"
    | "report_document_list"
    | "report_document_modify"
>()("ShowReport");
export type I18n = typeof i18n;
