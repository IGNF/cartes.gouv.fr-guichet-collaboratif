import React from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useNavigate } from "react-router";
import { HOME_URL } from "@/constants/urls";
import { useTranslation } from "@/i18n";

const NotFound: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation({ NotFound });
    return (
        <div className="fr-container">
            <div className="fr-my-7w fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-grid-row--center">
                <div className="fr-col-12 fr-col-md-6">
                    {t("not_found_message")}
                    <div className="fr-btns-group fr-btns-group--inline-md">
                        <Button onClick={() => navigate(HOME_URL)}>{t("home_page")}</Button>
                        <Button
                            priority="secondary"
                            linkProps={{
                                href: "https://www.ign.fr/contact",
                                target: "_blank",
                            }}
                        >
                            {t("contact_us")}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
