import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const useContributionAuthorisationFrTranslations: Translations<"fr">["useContributionAuthorisation"] = {
    not_authorised: ({ grids }) =>
        grids ? `L'objet doit se trouver dans une de vos emprises autorisées : ${grids}.` : "Vous n'êtes pas autorisé à modifier cet objet.",
};

export const useContributionAuthorisationEnTranslations: Translations<"en">["useContributionAuthorisation"] = {
    not_authorised: ({ grids }) => (grids ? `The object must be in one of your authorised areas: ${grids}.` : "You are not authorised to modify this feature."),
};

const { i18n } = declareComponentKeys<{ K: "not_authorised"; P: { grids: string } }>()("useContributionAuthorisation");

export type I18n = typeof i18n;
