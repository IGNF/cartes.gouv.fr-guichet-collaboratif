import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ConfirmDeleteReportModalFrTranslations: Translations<"fr">["ConfirmDeleteReportModal"] = {
    deleteReport_title: "Supprimer le signalement",
    deleteReports_title: "Supprimer les signalements",
    deleteReport_message:
        "Êtes-vous sur·e de vouloir supprimer le  signalement sélectionné ? Cette action est irréversible et les signalements ne pourront être récupérés.",
    deleteReports_message: ({ reportIdCount }: { reportIdCount: number | null }) =>
        `Êtes-vous sur·e de vouloir supprimer les ${reportIdCount} signalements sélectionnés ? Cette action est irréversible et les signalements ne pourront être récupérés.`,
    cancel_btn: "Annuler",
    delete_btn: "Supprimer",
};

export const ConfirmDeleteReportModalEnTranslations: Translations<"en">["ConfirmDeleteReportModal"] = {
    deleteReport_title: "Delete the report",
    deleteReports_title: "Delete the reports",
    deleteReport_message: "Are you sure you want to delete the selected report? This action is irreversible and the reports cannot be recovered.",
    deleteReports_message: ({ reportIdCount }: { reportIdCount: number | null }) =>
        `Are you sure you want to delete the ${reportIdCount} selected reports? This action is irreversible and the reports cannot be recovered.`,
    cancel_btn: "Cancel",
    delete_btn: "Delete",
};

const { i18n } = declareComponentKeys<
    | "deleteReport_title"
    | "deleteReports_title"
    | "deleteReport_message"
    | { K: "deleteReports_message"; P: { reportIdCount: number }; R: string }
    | "cancel_btn"
    | "delete_btn"
>()("ConfirmDeleteReportModal");
export type I18n = typeof i18n;
