import Header from "@codegouvfr/react-dsfr/Header";

import { useCommunityStore, useUserStore } from "@/store";
import { HOME_URL, LOGIN_URL, LOGOUT_URL, PROFILE_URL } from "@/constants/urls";

import MapToolbar from "./MapToolbar";
import { LanguageSelect } from "../LanguageSelect";
import { useTranslation } from "@/i18n";

const AppHeader: React.FC = () => {
    const { user } = useUserStore();
    const { community } = useCommunityStore();

    const { t } = useTranslation({ AppHeader });

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
                    title: t("home_link"),
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
                        text: user ? t("logout") : t("login"),
                    },
                    <LanguageSelect />,
                ]}
                style={{
                    display: community && user ? "none" : undefined,
                }}
            />
            {community && <MapToolbar />}
        </>
    );
};

export default AppHeader;
