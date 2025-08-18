import { headerFooterDisplayItem } from "@codegouvfr/react-dsfr/Display";
import Footer from "@codegouvfr/react-dsfr/Footer";

import { FooterConsentManagementItem, FooterPersonalDataPolicyItem } from "@/components/ConsentManagement";

import logoIgn from "@/img/partners-logos/logo-ign.png";
import logoMinistereTransformation from "@/img/partners-logos/logo-ministere-transformation.jpg";
import logoMinistereEcologie from "@/img/partners-logos/logo-ministere-ecologie.jpg";
import logoCnig from "@/img/partners-logos/logo-rf-cnig.jpg";
import { useCommunityStore, useUserStore } from "@/store";
import { useTranslation } from "@/i18n";

const AppFooter: React.FC = () => {
    const { user } = useUserStore();
    const { community } = useCommunityStore();

    const { t } = useTranslation({ AppFooter });

    if (community && user) return null;

    return (
        <Footer
            className={community ? "app-footer" : ""}
            accessibility="partially compliant"
            accessibilityLinkProps={{
                href: "/accessibilite",
            }}
            brandTop={
                <>
                    République
                    <br />
                    Française
                </>
            }
            contentDescription={t("content_description")}
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
                href: "/",
                title: t("home_link"),
            }}
            partnersLogos={{
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
            }}
        />
    );
};

export default AppFooter;
