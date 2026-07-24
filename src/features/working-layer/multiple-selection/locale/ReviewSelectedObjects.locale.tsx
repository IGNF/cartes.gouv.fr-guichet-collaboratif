import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ReviewSelectedObjectsFrTranslations: Translations<"fr">["ReviewSelectedObjects"] = {
    previous: "Objet précédent",
    next: "Objet suivant",
    deselect: "Désélectionner cet objet",
    selection: "Sélection",
};

export const ReviewSelectedObjectsEnTranslations: Translations<"en">["ReviewSelectedObjects"] = {
    previous: "Previous object",
    next: "Next object",
    deselect: "Unselect this object",
    selection: "Selection",
};

const { i18n } = declareComponentKeys<"previous" | "next" | "deselect" | "selection">()("ReviewSelectedObjects");
export type I18n = typeof i18n;
