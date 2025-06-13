import Header from "@codegouvfr/react-dsfr/Header";

import { useCommunityStore, useUserStore } from "@/store";
import { HOME_URL, LOGIN_URL, LOGOUT_URL, PROFILE_URL } from "@/constants/urls";

import MapToolbar from "./MapToolbar";

const AppHeader: React.FC = () => {
    const { user } = useUserStore();
    const { community } = useCommunityStore();

    if (community && user) return <MapToolbar />;

    return (
        <>
            <Header
                className={community ? "app-header" : ""}
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
                serviceTitle="cartes.gouv.fr-guichet-collaboratif"
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
        </>
    );
};

export default AppHeader;
