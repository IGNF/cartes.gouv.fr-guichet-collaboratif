import { Translations } from "@/i18n/types";
import { declareComponentKeys } from "i18nifty";
import { JSX } from "react";

export const NotFoundFrTranslations: Translations<"fr">["NotFound"] = {
    not_found_message: (
        <>
            <h1>Page non trouvée</h1>
            <p className="fr-text--sm fr-mb-3w">Erreur 404, Page non trouvée</p>
            <p className="fr-text--lead fr-mb-3w">La page que vous cherchez est introuvable. Excusez-nous pour la gêne occasionnée.</p>
            <p className="fr-text--sm fr-mb-5w">
                Si vous avez tapé l'adresse web dans le navigateur, vérifiez qu'elle est correcte. La page n’est peut-être plus disponible.
                <br />
                Dans ce cas, vous pouvez retourner à l’accueil ou nous contacter pour obtenir la bonne information.
            </p>
        </>
    ),
    home_page: "Accueil",
    contact_us: "Nous écrire",
};

export const NotFoundEnTranslations: Translations<"en">["NotFound"] = {
    not_found_message: (
        <>
            <h1>Page not found</h1>
            <p className="fr-text--sm fr-mb-3w">Error 404, Page not found</p>
            <p className="fr-text--lead fr-mb-3w">The page you are looking for cannot be found. We apologize for the inconvenience.</p>
            <p className="fr-text--sm fr-mb-5w">
                If you typed the web address into your browser, check that it is correct. The page may no longer be available.
                <br />
                In this case, you can return to the reception or contact us to obtain the correct information.
            </p>
        </>
    ),
    home_page: "Home",
    contact_us: "Contacte us",
};

const { i18n } = declareComponentKeys<{ K: "not_found_message"; R: JSX.Element } | "home_page" | "contact_us">()("NotFound");
export type I18n = typeof i18n;
