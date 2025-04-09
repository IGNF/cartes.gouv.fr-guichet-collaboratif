import Badge from "@codegouvfr/react-dsfr/Badge";
import Header from "@codegouvfr/react-dsfr/Header";

import { useUserStore } from "@/store";
import { HOME_URL, LOGIN_URL, LOGOUT_URL, PROFILE_URL } from "@/constants/urls";

import { memo, useEffect } from "react";
import { useGetUSerProfile } from "@/api/userData";

const AppHeader: React.FC = () => {
    const { user, setUser, clearUser, setIsLoadingUser } = useUserStore();

    const { data, error, isLoading } = useGetUSerProfile();

    useEffect(() => {
        if (data) {
            setUser(data);
        }
        if (error) {
            clearUser();
        }
        if (isLoading) {
            setIsLoadingUser(true);
        } else {
            setIsLoadingUser(false);
        }
    }, [data, error, isLoading]);

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
                user && {
                    iconId: "fr-icon-account-fill",
                    linkProps: {
                        href: PROFILE_URL,
                    },
                    text: user.name,
                },
                {
                    iconId: "fr-icon-logout-box-r-line",
                    linkProps: {
                        href: user ? LOGOUT_URL : LOGIN_URL,
                    },
                    text: user ? "Se déconnecter" : "Se connecter",
                },
            ]}
        />
    );
};

export default memo(AppHeader);
