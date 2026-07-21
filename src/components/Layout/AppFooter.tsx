import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import Footer from "@codegouvfr/react-dsfr/Footer";
import { ConsentBannerAndConsentManagement, FooterConsentManagementItem, FooterPersonalDataPolicyItem } from "@/components/ConsentManagement";
import { useCommunityStore, useUserStore } from "@/store";
import { useTranslation } from "@/i18n";
import Button from "@codegouvfr/react-dsfr/Button";
import { useState, useEffect } from "react";
import { BASE_URL } from "@/constants/urls";
import Display from "@codegouvfr/react-dsfr/Display/Display";

const AppFooter: React.FC = () => {
    const { user } = useUserStore();
    const { community } = useCommunityStore();

    const [isExtended, setIsExtended] = useState(false);

    useEffect(() => {
        if (isExtended) {
            setTimeout(() => window.scrollTo({ left: 0, top: document.body.scrollHeight, behavior: "smooth" }), 1);
        }
    }, [isExtended]);

    const { t } = useTranslation({ AppFooter });

    const showFullFooter = !community || !user || isExtended;
    return (
        <div className={`${community && user ? "app-footer-main" : ""} ${isExtended ? "app-footer-extended" : ""}`}>
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
            <ConsentBannerAndConsentManagement />
            <Footer
                accessibility="partially compliant"
                accessibilityLinkProps={{
                    href: "/accessibilite",
                }}
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
                homeLinkProps={{
                    href: BASE_URL,
                    title: t("home_link"),
                }}
                partnersLogos={
                    showFullFooter
                        ? {
                              main: {
                                  alt: t("partner_1"),
                                  href: "https://www.ign.fr",
                                  imgUrl: "https://data.geopf.fr/annexes/ressources/footer/ign.png",
                              },
                              sub: [
                                  {
                                      alt: t("partner_2"),
                                      href: "https://www.transformation.gouv.fr/",
                                      imgUrl: "https://data.geopf.fr/annexes/ressources/footer/min_fp.jpg",
                                  },
                                  {
                                      alt: t("partner_3"),
                                      href: "https://www.ecologie.gouv.fr/",
                                      imgUrl: "https://data.geopf.fr/annexes/ressources/footer/min_ecologie.jpg",
                                  },
                                  {
                                      alt: t("partner_4"),
                                      href: "https://cnig.gouv.fr/",
                                      imgUrl: "https://data.geopf.fr/annexes/ressources/footer/rf_cnig.jpg",
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
            <Display />
        </div>
    );
};

export default AppFooter;
