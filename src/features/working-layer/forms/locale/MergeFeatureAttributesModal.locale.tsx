import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const MergeFeatureAttributesModalFrTranslations: Translations<"fr">["MergeFeatureAttributesModal"] = {
    title: "Fusionner deux objets",
    description: "Choisissez les attributs à conserver pour l'objet fusionné.",
    choose_attributes: "Attributs à conserver",
    object_1: "Objet 1",
    object_2: "Objet 2",
    custom: "Personnaliser attribut par attribut",
    custom_detail: "Choisissez pour chaque attribut la valeur à conserver",
    both_empty: "Vide pour les deux",
    confirm: "Fusionner",
    cancel: "Annuler",
};

export const MergeFeatureAttributesModalEnTranslations: Translations<"en">["MergeFeatureAttributesModal"] = {
    title: "Merge two objects",
    description: "Choose which object's attributes to keep for the merged object.",
    choose_attributes: "Attributes to keep",
    object_1: "Object 1",
    object_2: "Object 2",
    custom: "Customize attribute by attribute",
    custom_detail: "Choose which value to keep for each attribute",
    both_empty: "Empty for both",
    confirm: "Merge",
    cancel: "Cancel",
};

const { i18n } = declareComponentKeys<
    "title" | "description" | "choose_attributes" | "object_1" | "object_2" | "custom" | "custom_detail" | "both_empty" | "confirm" | "cancel"
>()("MergeFeatureAttributesModal");

export type I18n = typeof i18n;
