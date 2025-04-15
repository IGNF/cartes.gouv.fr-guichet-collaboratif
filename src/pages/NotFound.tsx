import React from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useNavigate } from "react-router-dom";
import { HOME_URL } from "@/constants/urls";

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="fr-container">
            <div className="fr-my-7w fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-grid-row--center">
                <div className="fr-col-12 fr-col-md-6">
                    <h1>Page non trouvée</h1>
                    <p className="fr-text--sm fr-mb-3w">Erreur 404, Page not found</p>
                    <p className="fr-text--lead fr-mb-3w">La page que vous cherchez est introuvable. Excusez-nous pour la gêne occasionnée.</p>
                    <p className="fr-text--sm fr-mb-5w">
                        Si vous avez tapé l'adresse web dans le navigateur, vérifiez qu'elle est correcte. La page n’est peut-être plus disponible.
                        <br />
                        Dans ce cas, vous pouvez retourner à l’accueil ou nous contacter pour obtenir la bonne information.
                    </p>
                    <div className="fr-btns-group fr-btns-group--inline-md">
                        <Button onClick={() => navigate(HOME_URL)}>Page d’accueil</Button>
                        <Button
                            priority="secondary"
                            linkProps={{
                                href: "https://www.ign.fr/contact",
                                target: "_blank",
                            }}
                        >
                            Nous écrire
                        </Button>
                    </div>
                </div>

                <div className="fr-col-12 fr-col-md-3 fr-col-offset-md-1 fr-px-6w fr-px-md-0 fr-py-0">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="fr-responsive-img fr-artwork"
                        aria-hidden="true"
                        width="160"
                        height="200"
                        viewBox="0 0 160 200"
                    >
                        <use href="/artwork/background/ovoid.svg#artwork-motif" className="fr-artwork-motif" />
                        <use href="/artwork/background/ovoid.svg#artwork-background" className="fr-artwork-background" />
                        <g transform="translate(40, 60)">
                            <use href="/artwork/pictograms/system/technical-error.svg#artwork-decorative" className="fr-artwork-decorative" />
                            <use href="/artwork/pictograms/system/technical-error.svg#artwork-minor" className="fr-artwork-minor" />
                            <use href="/artwork/pictograms/system/technical-error.svg#artwork-major" className="fr-artwork-major" />
                        </g>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
