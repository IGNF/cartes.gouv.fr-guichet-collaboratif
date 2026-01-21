import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const SearchTableFrTranslations: Translations<"fr">["SearchTable"] = {
    show_object: "Afficher sur la carte",
    edit_object: "Modifier",
    delete_object: "Supprimer",
    cancel: "Annuler",
    actions: "Actions",
    go_to_page: ({ pageNumber }: { pageNumber: number }) => `Aller à la page ${pageNumber}`,
    total_objects: ({ total }: { total: number }) => `${total} objet${total > 1 ? "s" : ""} trouvé${total > 1 ? "s" : ""}`,
};

export const SearchTableEnTranslations: Translations<"en">["SearchTable"] = {
    show_object: "Show on the map",
    edit_object: "Edit",
    delete_object: "Delete",
    cancel: "Cancel",
    actions: "Actions",
    go_to_page: ({ pageNumber }: { pageNumber: number }) => `Go to page number: ${pageNumber}`,
    total_objects: ({ total }: { total: number }) => `${total} object${total > 1 ? "s" : ""} found`,

};

const { i18n } = declareComponentKeys<
    | "show_object"
    | "edit_object"
    | "delete_object"
    | "cancel"
    | "actions"
    | { K: "go_to_page"; P: { pageNumber: number }; R: string }
    | { K: "total_objects"; P: { total: number }; R: string }
>()("SearchTable");
export type I18n = typeof i18n;
