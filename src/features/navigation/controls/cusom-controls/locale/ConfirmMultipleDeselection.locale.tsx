import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ConfirmMultipleDeselectionFrTranslations: Translations<"fr">["ConfirmMultipleDeselection"] = {
    title: "Attention",
    yes: "Oui",
    no: "Non",
    message: ({ objectsCount }: { objectsCount: number }) => `${objectsCount} objets seront désélectionnés, êtes-vous sûr??`,
};

export const ConfirmMultipleDeselectionEnTranslations: Translations<"en">["ConfirmMultipleDeselection"] = {
    title: "Attention",
    yes: "Yes",
    no: "No",
    message: ({ objectsCount }: { objectsCount: number }) => `${objectsCount} objects will be deselected, are you sure?`,
};

const { i18n } = declareComponentKeys<"title" | "yes" | "no" | { K: "message"; P: { objectsCount: number }; R: string }>()("ConfirmMultipleDeselection");
export type I18n = typeof i18n;
