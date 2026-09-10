import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";

export const useContributionAuthorisationFrTranslations: Translations<"fr">["useContributionAuthorisation"] = {
    grids_loading: "Les emprises autorisées sont en cours de chargement.",
    grids_unavailable: "Impossible de vérifier vos emprises autorisées.",
    no_authorised_grids: "Vous n'avez aucune emprise autorisée.",
    outside_authorised_grids: ({ grids }) => `L'objet doit se trouver dans une de vos emprises autorisées : ${grids}.`,
};

export const useContributionAuthorisationEnTranslations: Translations<"en">["useContributionAuthorisation"] = {
    grids_loading: "Authorized areas are still loading.",
    grids_unavailable: "Unable to verify authorised areas.",
    no_authorised_grids: "You have no authorised areas.",
    outside_authorised_grids: ({ grids }) => `The object must be in one of your authorised areas: ${grids}.`,
};

const { i18n } = declareComponentKeys<
    "grids_loading" | "grids_unavailable" | "no_authorised_grids" | { K: "outside_authorised_grids"; P: { grids: string } }
>()("useContributionAuthorisation");

export type I18n = typeof i18n;
