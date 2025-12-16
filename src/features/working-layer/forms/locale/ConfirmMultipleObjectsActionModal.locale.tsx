import { FeatureTypeFormActionMode } from "@/constants/contributions/types";
import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ConfirmMultipleObjectsActionModalFrTranslations: Translations<"fr">["ConfirmMultipleObjectsActionModal"] = {
    title: "Attention",
    yes: "Oui",
    no: "Non",
    message: ({ objectsCount, action }: { objectsCount: number; action: FeatureTypeFormActionMode }) => {
        let actionMessage = "désélectionnés";
        if (action === FeatureTypeFormActionMode.MODIFY) actionMessage = "modifiés";
        if (action === FeatureTypeFormActionMode.DELETE) actionMessage = "supprimés";
        return `Tous les ${objectsCount} objets seront ${actionMessage}, est ce vous étes sûr ?`;
    },
};

export const ConfirmMultipleObjectsActionModalEnTranslations: Translations<"en">["ConfirmMultipleObjectsActionModal"] = {
    title: "Attention",
    yes: "Yes",
    no: "No",
    message: ({ objectsCount, action }: { objectsCount: number; action: FeatureTypeFormActionMode }) => {
        let actionMessage = "deselected";
        if (action === FeatureTypeFormActionMode.MODIFY) actionMessage = "modified";
        if (action === FeatureTypeFormActionMode.DELETE) actionMessage = "deleted";
        return `All ${objectsCount} objects will be ${actionMessage}, are you sure?`;
    },
};

const { i18n } = declareComponentKeys<"title" | "yes" | "no" | { K: "message"; P: { objectsCount: number; action: FeatureTypeFormActionMode }; R: string }>()(
    "ConfirmMultipleObjectsActionModal"
);
export type I18n = typeof i18n;
