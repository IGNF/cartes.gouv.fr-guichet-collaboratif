import Badge from "@codegouvfr/react-dsfr/Badge";
import Header from "@codegouvfr/react-dsfr/Header";

export default function AppHeader() {
    return (
        <Header
            brandTop={
                <>
                    République
                    <br />
                    Française
                </>
            }
            homeLinkProps={{
                href: "#",
                title: "Accueil - cartes.gouv.fr-guichet-collaboratif",
            }}
            serviceTitle={
                <>
                    cartes.gouv.fr-guichet-collaboratif{" "}
                    <Badge severity="success" noIcon={true} as="span">
                        Bêta
                    </Badge>
                </>
            }
            serviceTagline="Le guichet collaboratif de cartes.gouv.fr"
            quickAccessItems={[
                {
                    iconId: "fr-icon-arrow-right-line",
                    linkProps: {
                        href: "https://www.geoportail.gouv.fr/carte",
                        className: "fr-btn--icon-right",
                        target: "_blank",
                        rel: "noreferrer",
                        title: "Accéder au Géoportail - ouvre une nouvelle fenêtre",
                    },
                    text: "Accéder au Géoportail",
                },
                {
                    iconId: "fr-icon-arrow-right-line",
                    linkProps: {
                        href: "/catalogue",
                        className: "fr-btn--icon-right",
                        target: "_blank",
                        rel: "noreferrer",
                        title: "Catalogue - ouvre une nouvelle fenêtre",
                    },
                    text: "Catalogue",
                },
                {
                    iconId: "fr-icon-account-fill",
                    linkProps: {
                        href: "/login",
                    },
                    text: "Se connecter",
                },
            ]}
        />
    );
}
