import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ShareReportModalFrTranslations: Translations<"fr">["ShareReportModal"] = {
    share_title_report: "Partager le signalement",
    share_title_reports: "Partager les signalements",
    report_link: "Lien du signalement",
    reports_link: "Lien vers la liste des signalements",
    report_copyLink: "Copier",
    share_url: "URL à intégrer",
    copied_link: "Lien copié",
    erorr_copiedLink: "Le lien n'a pas été copié correctement.",
    report_modalInfo: "Seuls les membres du guichet pourront accéder à ce signalement en utilisant ce lien.",
    reports_modalInfo: "Seuls les membres du guichet pourront accéder à la liste des signalements en utilisant ce lien",
};

export const ShareReportModalEnTranslations: Translations<"en">["ShareReportModal"] = {
    share_title_report: "Share the report",
    share_title_reports: "Share the reports",
    report_link: "Report link",
    reports_link: "Link to the list of reports",
    report_copyLink: "Copy",
    share_url: "URL to integrate",
    copied_link: "link copied",
    erorr_copiedLink: "The link was not copied correctly.",
    report_modalInfo: "Only members of the help desk will be able to access this report using this link.",
    reports_modalInfo: "Only members of the help desk will be able to access the list of reports using this link.",
};

const { i18n } = declareComponentKeys<
    | "share_title_report"
    | "share_title_reports"
    | "report_link"
    | "reports_link"
    | "report_copyLink"
    | "share_url"
    | "copied_link"
    | "erorr_copiedLink"
    | "report_modalInfo"
    | "reports_modalInfo"
>()("ShareReportModal");
export type I18n = typeof i18n;
