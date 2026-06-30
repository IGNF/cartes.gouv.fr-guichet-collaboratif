import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";
import { ReactNode } from "react";

export const ContributionsConfirmResetFrTranslations: Translations<"fr">["ContributionsConfirmReset"] = {
    title: "Attention",
    description: ({ count }) => {
        if (count === 1000) {
            return <p>Toutes vos contributions seront annulées, voulez-vous continuer ?</p>;
        }
        return (
            <p>
                {count > 1 ? `Les ${count} contributions sélectionnées seront annulées` : "La contribution sélectionnée sera annulée"}, voulez-vous continuer ?
            </p>
        );
    },
    yes: "Oui",
    no: "Non",
};

export const ContributionsConfirmResetEnTranslations: Translations<"en">["ContributionsConfirmReset"] = {
    title: "Warning",
    description: ({ count }: { count: number }) => {
        if (count === 1000) {
            return <p>All your contributions will be cancelled, do you want to continue?</p>;
        }
        return (
            <p>
                {count > 1 ? `The ${count} selected contributions will be cancelled` : "The selected contribution will be cancelled"}, do you want to continue?
            </p>
        );
    },
    yes: "Yes",
    no: "No",
};

const { i18n } = declareComponentKeys<"title" | { K: "description"; P: { count: number }; R: ReactNode } | "yes" | "no">()("ContributionsConfirmReset");
export type I18n = typeof i18n;
