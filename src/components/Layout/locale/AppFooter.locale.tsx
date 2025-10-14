import { declareComponentKeys } from "i18nifty";
import type { Translations } from "../../../i18n/types";
import { JSX } from "react";

export const AppFooterFrTranslations: Translations<"fr">["AppFooter"] = {
    content_description:
        "Cartes.gouv.fr est développé par l’Institut national de l’information géographique et forestière (IGN) et ses partenaires. Le site s’appuie sur la Géoplateforme, la nouvelle infrastructure publique, ouverte et collaborative des données géographiques.",
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
        "Cartes.gouv.fr is developed by the National Institute of Geographic and Forest Information (IGN) and its partners. The site is based on the Géoplatforme, the new public, open, and collaborative infrastructure for geographic data.",
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
