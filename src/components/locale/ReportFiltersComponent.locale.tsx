import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ReportFiltersComponentFrTranslations: Translations<"fr">["ReportFiltersComponent"] = {
    author: "Voir les signalements de cet auteur",
    date: "Voir les signalements envoyés à partir de cette date",
    city: "Voir les signalements de cette commune",
    department: "Voir les signalements de ce département",
    theme: "Voir les signalements de ce thème",
};

export const ReportFiltersComponentEnTranslations: Translations<"en">["ReportFiltersComponent"] = {
    author: "See reports from this author",
    date: "See reports sent from this date",
    city: "see reports from this city",
    department: "See reports from this department",
    theme: "See reports from this theme",
};

const { i18n } = declareComponentKeys<"author" | "date" | "city" | "department" | "theme">()("ReportFiltersComponent");
export type I18n = typeof i18n;
