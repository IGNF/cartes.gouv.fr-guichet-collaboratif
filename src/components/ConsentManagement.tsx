import { createConsentManagement } from "@codegouvfr/react-dsfr/consentManagement";

let prEulerianApi: Promise<{ enable: () => void; disable: () => void }> | undefined;

const getEulerianApi = async () => {
    if (!prEulerianApi) {
        const { startEulerianAnalytics } = await import("@codegouvfr/react-dsfr/eulerianAnalytics");

        prEulerianApi = startEulerianAnalytics({
            domain: "acwg.cartes.gouv.fr",
            site: {
                environment: "development",
                entity: "IGN",
            },
        });
    }

    return prEulerianApi;
};

export const { ConsentBannerAndConsentManagement, FooterConsentManagementItem, FooterPersonalDataPolicyItem, useConsent } = createConsentManagement({
    finalityDescription: () => ({
        eulerianAnalytics: {
            title: "Eulerian Analytics",
            description: [
                "En cliquant sur 'Accepter', vous consentez à l'utilisation des cookies pour nous",
                "aider à améliorer notre site web en collectant et en rapportant des informations",
                "sur votre utilisation grâce à Eulerian Analytics. Si vous n'êtes pas d'accord, veuillez",
                "cliquer sur 'Refuser'. Votre expérience de navigation ne sera pas affectée.",
            ].join(" "),
        },
    }),
    personalDataPolicyLinkProps: {
        href: "/donnees-personnelles",
    },

    consentCallback: async ({ finalityConsent }) => {
        const eulerian = await getEulerianApi();

        if (finalityConsent.eulerianAnalytics) {
            eulerian.enable();
        } else {
            eulerian.disable();
        }
    },
});
