import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const useOperatorListFrTranslations: Translations<"fr">["useOperatorList"] = {
    in: "est compris dans",
    not_in: "n'est pas compris dans",
    is_empty: "est vide",
    is_not_empty: "n'est pas vide",
    equal: "est égal à",
    not_equal: "n'est pas égal à",
    begins_with: "commence par",
    not_begins_with: "ne commence pas par",
    contains: "contient",
    not_contains: "ne contient pas",
    ends_with: "finit par",
    not_ends_with: "ne finit pas par",
    is_null: "est nul",
    is_not_null: "n'est pas nul",
    less: "est inférieur à",
    less_or_equal: "est inférieur ou égal à",
    greater: "est supérieur à",
    greater_or_equal: "est supérieur ou égal à",
    between: "est entre",
    not_between: "n'est pas entre",
};

export const useOperatorListEnTranslations: Translations<"en">["useOperatorList"] = {
    in: "is included in",
    not_in: "is not included in",
    is_empty: "is empty",
    is_not_empty: "is not empty",
    equal: "is equal to",
    not_equal: "is not equal to",
    begins_with: "begins with",
    not_begins_with: "does not begin with",
    contains: "contains",
    not_contains: "does not contain",
    ends_with: "ends with",
    not_ends_with: "does not end with",
    is_null: "is null",
    is_not_null: "is not null",
    less: "is less than",
    less_or_equal: "is less than or equal to",
    greater: "is greater than",
    greater_or_equal: "is greater than or equal to",
    between: "is between",
    not_between: "is not between",
};

const { i18n } = declareComponentKeys<
    | "in"
    | "not_in"
    | "is_empty"
    | "is_not_empty"
    | "equal"
    | "not_equal"
    | "begins_with"
    | "not_begins_with"
    | "contains"
    | "not_contains"
    | "ends_with"
    | "not_ends_with"
    | "is_null"
    | "is_not_null"
    | "less"
    | "less_or_equal"
    | "greater"
    | "greater_or_equal"
    | "between"
    | "not_between"
>()("useOperatorList");

export type I18n = typeof i18n;
