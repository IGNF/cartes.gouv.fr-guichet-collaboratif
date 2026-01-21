import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const GroupComponentFrTranslations: Translations<"fr">["GroupComponent"] = {
    and_operator: "ET",
    or_operator: "OU",
    add_rule: "Ajouter une règle",
    add_group: "Ajouter un groupe",
    delete: "Supprimer",
};

export const GroupComponentEnTranslations: Translations<"en">["GroupComponent"] = {
    and_operator: "AND",
    or_operator: "OR",
    add_rule: "Add rule",
    add_group: "Add group",
    delete: "Delete",
};

const { i18n } = declareComponentKeys<"and_operator" | "or_operator" | "add_rule" | "add_group" | "delete">()("GroupComponent");
export type I18n = typeof i18n;
