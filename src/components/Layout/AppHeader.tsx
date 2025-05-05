import Header from "@codegouvfr/react-dsfr/Header";

import { useCommunityStore, useUserStore } from "@/store";
import { HOME_URL, LOGIN_URL, LOGOUT_URL, PROFILE_URL } from "@/constants/urls";

import { useEffect, useState } from "react";
import Button from "@codegouvfr/react-dsfr/Button";

import MapToolbar from "@/features/navigation/MapToolbar"; // ← ici tu importes ton MapToolbar !

const AppHeader: React.FC = () => {
    const [headerOpen, setHeaderOpen] = useState(false);
    const [buttonMarginTop, setButtonMarginTop] = useState(0);

    const { user } = useUserStore();
    const { community } = useCommunityStore();

    useEffect(() => {
        const header = document.getElementsByClassName("app-header")[0];
        if (header) {
            setButtonMarginTop(header.clientHeight);
        }
    }, [headerOpen]);

    const toggleButton = (
        <Button
            iconId={headerOpen ? "ri-arrow-up-circle-fill" : "ri-arrow-down-circle-fill"}
            onClick={() => {
                if (headerOpen) {
                    setButtonMarginTop(0);
                }
                setHeaderOpen(!headerOpen);
            }}
            priority="tertiary no outline"
            title="Label button"
            className="header-button"
            style={{ marginTop: buttonMarginTop }}
        />
    );

    if (community && !headerOpen) return toggleButton;

    return (
        <>
            {community && toggleButton}
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

            {/* 2. Toolbar personnalisée pour le guichet */}
            <MapToolbar />
        </>
    );
};

export default AppHeader;
