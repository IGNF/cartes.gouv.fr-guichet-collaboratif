import Badge from "@codegouvfr/react-dsfr/Badge";
import Header from "@codegouvfr/react-dsfr/Header";
import { useUserStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { ABOUT_URL, CARTE_URL, HOME_URL } from "@/constants/urls";

function AppHeader() {
    const { user, setUser, clearUser } = useUserStore();

    const navigate = useNavigate();

    const toggleLoggin = () => {
        setTimeout(() => {
            if (user) {
                clearUser();
            } else {
                setUser({ id: "0", name: "Nom Utilisateur", isLoggedIn: true });
            }
        }, 1000);
    };
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
                href: HOME_URL,
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
                    iconId: "ri-mind-map",
                    buttonProps: {
                        onClick: () => navigate(CARTE_URL),
                        title: "Carte",
                    },
                    text: "Carte",
                },
                {
                    iconId: "ri-sidebar-fold-fill",
                    buttonProps: {
                        onClick: () => navigate(ABOUT_URL),
                        title: "À propos des données",
                    },
                    text: "À propos",
                },
                {
                    iconId: "fr-icon-account-fill",
                    buttonProps: {
                        onClick: toggleLoggin,
                    },
                    text: user ? user.name : "Se connecter",
                },
            ]}
        />
    );
}

export default AppHeader;
