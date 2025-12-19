import { FeatureTypeFormActionMode } from "@/constants/contributions/types";
import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const ConfirmMultipleObjectsActionModalFrTranslations: Translations<"fr">["ConfirmMultipleObjectsActionModal"] = {
    title: "Attention",
    yes: "Oui",
    no: "Non",
    message: ({ objectsCount, action }: { objectsCount: number; action: FeatureTypeFormActionMode }) => {
        let actionMessage = "désélectionnés";
        if (action === FeatureTypeFormActionMode.MODIFY) actionMessage = "modifié(s)";
        if (action === FeatureTypeFormActionMode.DELETE) actionMessage = "supprimé(s)";

        const isSingular = objectsCount <= 1;
        const objectWord = isSingular ? "objet" : "objets";
        const verbWord = isSingular ? "sera" : "seront";
        if (isSingular) {
            objectsCount = 1;
        }
        return `${objectsCount} ${objectWord} ${verbWord} ${actionMessage}, êtes-vous sûr?`;
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

        const isSingular = objectsCount <= 1;
        const objectWord = isSingular ? "object" : "objects";
        const verbWord = "will be";
        if (isSingular) {
            objectsCount = 1;
        }

        return `${objectsCount} ${objectWord} ${verbWord} ${actionMessage}, are you sure?`;
    },
};

const { i18n } = declareComponentKeys<"title" | "yes" | "no" | { K: "message"; P: { objectsCount: number; action: FeatureTypeFormActionMode }; R: string }>()(
    "ConfirmMultipleObjectsActionModal"
);
export type I18n = typeof i18n;
