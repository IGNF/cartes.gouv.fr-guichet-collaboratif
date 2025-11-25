import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ConfirmDeleteShareReportModalFrTranslations: Translations<"fr">["ConfirmDeleteShareReportModal"] = {
    deleteReports_title: "Supprimer le signalement",
    cancel_btn: "Annuler",
    delete_btn: "Supprimer",
    deleteReport_message:
        "Êtes-vous sur.e de vouloir supprimer le signalement sélectionné ? Cette action est irréversible et les signalements ne pourront être récupérés.",
};

export const ConfirmDeleteShareReportModalEnTranslations: Translations<"en">["ConfirmDeleteShareReportModal"] = {
    deleteReports_title: "Delete the report",
    cancel_btn: "Cancel",
    delete_btn: "Delete",
    deleteReport_message: "Are you sure you want to delete the selected report? This action is irreversible and the reports cannot be recovered.",
};

const { i18n } = declareComponentKeys<"deleteReports_title" | "cancel_btn" | "delete_btn" | "deleteReport_message">()("ConfirmDeleteShareReportModal");
export type I18n = typeof i18n;
