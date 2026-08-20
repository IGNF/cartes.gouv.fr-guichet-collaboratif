import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";
import { JSX } from "react";

export const CenterMessageFrTranslations: Translations<"fr">["CenterMessage"] = {
    center_message: ({ onClick }: { onClick: () => void }) => (
        <>
            Attention ! Le signalement est en dehors de la carte visible -{" "}
            <a href="#" onClick={onClick}>
                [Centrer la carte sur le signalement]
            </a>
        </>
    ),
};

export const CenterMessageEnTranslations: Translations<"en">["CenterMessage"] = {
    center_message: ({ onClick }: { onClick: () => void }) => (
        <>
            Attention! The signal is outside the visible map -{" "}
            <a href="#" onClick={onClick}>
                [Center the map on the report]
            </a>
        </>
    ),
};

const { i18n } = declareComponentKeys<{ K: "center_message"; P: { onClick: () => void }; R: JSX.Element }>()("CenterMessage");
export type I18n = typeof i18n;
