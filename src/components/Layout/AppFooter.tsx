import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import Footer from "@codegouvfr/react-dsfr/Footer";

import { FooterConsentManagementItem, FooterPersonalDataPolicyItem } from "@/components/ConsentManagement";

import logoIgn from "@/img/partners-logos/logo-ign.png";
import logoMinistereTransformation from "@/img/partners-logos/logo-ministere-transformation.jpg";
import logoMinistereEcologie from "@/img/partners-logos/logo-ministere-ecologie.jpg";
import logoCnig from "@/img/partners-logos/logo-rf-cnig.jpg";
import { useCommunityStore, useUserStore } from "@/store";
import { useTranslation } from "@/i18n";
import Button from "@codegouvfr/react-dsfr/Button";
import { useState } from "react";

const AppFooter: React.FC = () => {
    const { user } = useUserStore();
    const { community } = useCommunityStore();
    const [isExtended, setIsExtended] = useState(false);

    const { t } = useTranslation({ AppFooter });

    const showFullFooter = !community || !user || isExtended;

    return (
        <div className={isExtended ? "app-footer-extended" : ""}>
            {isExtended && (
                <Button
                    iconId="fr-icon-close-line"
                    iconPosition="right"
                    onClick={() => setIsExtended(!isExtended)}
                    priority="tertiary no outline"
                    title="Fermer"
                    className="app-footer-close"
                >
                    Fermer
                </Button>
            )}
            <Footer
                accessibility={"partially compliant"}
                accessibilityLinkProps={
                    showFullFooter
                        ? {
                              href: "/accessibilite",
                          }
                        : undefined
                }
                brandTop={
                    showFullFooter ? (
                        <>
                            République
                            <br />
                            Française
                        </>
                    ) : (
                        <></>
                    )
                }
                contentDescription={showFullFooter ? t("content_description") : undefined}
                bottomItems={[
                    {
                        linkProps: {
                            href: "/conditions-generales-d-utilisation",
                        },
                        text: t("conditions_generales"),
                    },
                    <FooterPersonalDataPolicyItem key="footer-personal-data-policy-item" />,
                    <FooterConsentManagementItem key="footer-consent-management-item" />,

                    headerFooterDisplayItem,
                ]}
                homeLinkProps={
                    showFullFooter
                        ? {
                              href: "/",
                              title: t("home_link"),
                          }
                        : undefined
                }
                partnersLogos={
                    showFullFooter
                        ? {
                              sub: [
                                  {
                                      alt: t("partner_1"),
                                      href: "https://www.ign.fr",
                                      imgUrl: logoIgn,
                                  },
                                  {
                                      alt: t("partner_2"),
                                      href: "https://www.transformation.gouv.fr/",
                                      imgUrl: logoMinistereTransformation,
                                  },
                                  {
                                      alt: t("partner_3"),
                                      href: "https://www.ecologie.gouv.fr/",
                                      imgUrl: logoMinistereEcologie,
                                  },
                                  {
                                      alt: t("partner_4"),
                                      href: "https://cnig.gouv.fr/",
                                      imgUrl: logoCnig,
                                  },
                              ],
                          }
                        : undefined
                }
                license={
                    showFullFooter ? (
                        t("licence")
                    ) : (
                        <Button iconId={"fr-icon-arrow-up-s-line"} onClick={() => setIsExtended(!isExtended)} priority="tertiary no outline" title="" />
                    )
                }
                domains={showFullFooter ? undefined : []}
                classes={showFullFooter ? undefined : { body: "app-footer-body", root: "app-footer-root" }}
            />
        </div>
    );
};

export default AppFooter;
