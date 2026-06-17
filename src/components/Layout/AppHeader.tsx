import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";

import { memo } from "react";

import { BASE_URL } from "@/constants/urls";

import { useTranslation } from "@/i18n";
import { HeaderMenuConnexion, HeaderMenuHelp, HeaderMenuServices } from "@/components/Layout/Header/HeaderMenus";

const AppHeader: React.FC = () => {
    const { isDark } = useIsDark();

    const { t } = useTranslation({ AppHeader });

    return (
        <>
            <header role="banner" className="fr-header fr-header--compact">
                <div className="fr-header__body">
                    <div className="fr-container--fluid">
                        <div className="fr-header__body-row">
                            {/* Bloc marque */}
                            <div className="fr-header__brand fr-enlarge-link">
                                <div className="fr-header__brand-top" title={t("home_title")}>
                                    <div className="fr-header__logo">
                                        <p className="fr-logo">
                                            République
                                            <br />
                                            Française
                                        </p>
                                    </div>
                                    {/* Logo opérateur */}
                                    <div className="fr-header__operator">
                                        <img
                                            className="fr-responsive-img"
                                            src={
                                                isDark
                                                    ? "https://data.geopf.fr/annexes/ressources/header/cartes-gouv-logo-dark.svg"
                                                    : "https://data.geopf.fr/annexes/ressources/header/cartes-gouv-logo.svg"
                                            }
                                            alt="cartes.gouv.fr"
                                        />
                                        <a href={BASE_URL} />
                                    </div>
                                </div>
                                <div className="fr-header__service">
                                    <p className="fr-header__service-title">
                                        <a href={BASE_URL} title={t("home_service")}>
                                            cartes.gouv.fr
                                        </a>
                                        <span className="fr-badge fr-badge--sm fr-icon-message-2-fill fr-badge--icon-left fr-badge--green-bourgeon">
                                            {t("badge_label")}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {/* Liens d'accès rapide */}
                            <div className="fr-header__tools">
                                <div className="fr-header__tools-links">
                                    <HeaderMenuHelp />
                                    <HeaderMenuServices />
                                    <HeaderMenuConnexion />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Required by DSFR JS (HeaderLinks init looks for fr-header__menu-links) */}
                <div className="fr-header__menu fr-modal" aria-hidden="true" style={{ display: "none" }}>
                    <div className="fr-container">
                        <div className="fr-header__menu-links" />
                    </div>
                </div>
            </header>
        </>
    );
};

export default memo(AppHeader);
