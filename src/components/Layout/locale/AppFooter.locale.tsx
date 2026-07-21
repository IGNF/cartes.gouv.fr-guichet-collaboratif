import { declareComponentKeys } from "i18nifty";
import type { Translations } from "../../../i18n/types";
import { JSX } from "react";

export const AppFooterFrTranslations: Translations<"fr">["AppFooter"] = {
    content_description:
        "Cartes.gouv.fr est le service public des cartes et données du territoire français. Porté par l’IGN et ses partenaires, il offre à tous un accès à la référence de la cartographie publique et permet à chacun de créer, d’héberger et de publier ses propres données et représentations.",
    conditions_generales: "Conditions générales d’utilisation",
    home_link: "Accueil - cartes.gouv.fr-guichet-collaboratif",
    partner_1: "IGN",
    partner_2: "MINISTÈRE DE LA TRANSFORMATION ET DE LA FONCTION PUBLIQUES",
    partner_3: "MINISTÈRE DE LA TRANSITION ÉCOLOGIQUE ET DE LA COHÉSION DES TERRITOIRES",
    partner_4: "Conseil National de l’Information Géolocalisée",
    licence: (
        <>
            Sauf mention explicite de propriété intellectuelle détenue par des tiers, les contenus de ce site sont proposés sous{" "}
            <a
                href="https://github.com/etalab/licence-ouverte/blob/master/LO.md"
                target="_blank"
                title="licence etalab-2.0 - nouvelle fenêtre"
                id="footer-etalab-licence-link"
                data-fr-js-footer-link-actionee="true"
            >
                licence etalab-2.0
            </a>
        </>
    ),
};

export const AppFooterEnTranslations: Translations<"en">["AppFooter"] = {
    content_description:
        "Cartes.gouv.fr is the public service providing maps and data for France. Run by the IGN and its partners, it offers everyone access to the leading source of public cartography and enables anyone to create, host and publish their own data and visualisations.",
    conditions_generales: "General Conditions of Use",
    home_link: "Home - cartes.gouv.fr-guichet-collaboratif",
    partner_1: "IGN",
    partner_2: "MINISTRY OF TRANSFORMATION AND CIVIL SERVICE",
    partner_3: "MINISTRY OF ECOLOGICAL TRANSITION AND TERRITORIAL COHESION",
    partner_4: "National Council for Geolocated Information",
    licence: (
        <>
            Unless explicitly mentioned intellectual property held by third parties, the contents of this site are offered under{" "}
            <a
                href="https://github.com/etalab/licence-ouverte/blob/master/LO.md"
                target="_blank"
                title="licence etalab-2.0 - nouvelle fenêtre"
                id="footer-etalab-licence-link"
                data-fr-js-footer-link-actionee="true"
            >
                licence etalab-2.0
            </a>
        </>
    ),
};

const { i18n } = declareComponentKeys<
    "content_description" | "conditions_generales" | "home_link" | "partner_1" | "partner_2" | "partner_3" | "partner_4" | { K: "licence"; R: JSX.Element }
>()("AppFooter");
export type I18n = typeof i18n;
