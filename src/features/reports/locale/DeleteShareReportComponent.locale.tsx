import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const DeleteShareReportComponentFrTranslations: Translations<"fr">["DeleteShareReportComponent"] = {
    delete: "Supprimer",
    share: "Partager",
};

export const DeleteShareReportComponentEnTranslations: Translations<"en">["DeleteShareReportComponent"] = {
    delete: "Delete",
    share: "Share",
};

const { i18n } = declareComponentKeys<"delete" | "share">()("DeleteShareReportComponent");
export type I18n = typeof i18n;
