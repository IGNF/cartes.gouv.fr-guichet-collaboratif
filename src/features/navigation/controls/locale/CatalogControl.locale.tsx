import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const CatalogControlFrTranslations: Translations<"fr">["CatalogControl"] = {
    title_primary: "Catalogue de données",
    title_secondary: "Gérer vos couches de données",
    layer_label: "Couche de catégories",
    categories_title: "Données",
};

export const CatalogControlEnTranslations: Translations<"en">["CatalogControl"] = {
    title_primary: "Data catalog",
    title_secondary: "Manage your data layers",
    layer_label: "Category layer",
    categories_title: "Data",
};

const { i18n } = declareComponentKeys<"title_primary" | "title_secondary" | "layer_label" | "categories_title">()("CatalogControl");
export type I18n = typeof i18n;
