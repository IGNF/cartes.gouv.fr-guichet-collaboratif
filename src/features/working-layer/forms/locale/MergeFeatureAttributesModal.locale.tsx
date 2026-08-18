import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const MergeFeatureAttributesModalFrTranslations: Translations<"fr">["MergeFeatureAttributesModal"] = {
    title: "Fusionner des objets",
    description: "Choisissez les attributs à conserver pour l'objet fusionné. La géométrie des deux objets sera fusionnée.",
    choose_attributes: "Attributs à conserver",
    object_1: "Objet 1",
    object_2: "Objet 2",
    confirm: "Fusionner",
    cancel: "Annuler",
};

export const MergeFeatureAttributesModalEnTranslations: Translations<"en">["MergeFeatureAttributesModal"] = {
    title: "Merge objects",
    description: "Choose which object's attributes to keep for the merged object. The geometry of both objects will be merged.",
    choose_attributes: "Attributes to keep",
    object_1: "Object 1",
    object_2: "Object 2",
    confirm: "Merge",
    cancel: "Cancel",
};

const { i18n } = declareComponentKeys<"title" | "description" | "choose_attributes" | "object_1" | "object_2" | "confirm" | "cancel">()(
    "MergeFeatureAttributesModal"
);

export type I18n = typeof i18n;
