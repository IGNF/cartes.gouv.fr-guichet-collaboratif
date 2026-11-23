import { MATOMO_URL } from "@/constants/urls";

declare global {
    interface Window {
        _paq?: unknown[][];
    }
}

// Clé écrite par l’ancienne bannière de consentement react-dsfr
const LEGACY_CONSENT_STORAGE_KEY = "@codegouvfr/react-dsfr finalityConsent eulerianAnalytics";
// Opt-out posés par la page /donnees-personnelles (même origine) : cookie Matomo, clé localStorage du module analytics du DSFR
const MATOMO_OPTOUT_COOKIE = "mtm_consent_removed";
const EULERIAN_OPTOUT_STORAGE_KEY = "_EA_";
const MATOMO_SITE_ID = "11";
// Titre unique : seul le préfixe de la brique est envoyé (ni nom de guichet, ni libellé de page)
const MATOMO_DOCUMENT_TITLE = "[Contribuer]";

export function isMatomoOptedOut(cookie = document.cookie): boolean {
    return cookie.split(";").some((item) => item.trim().split("=")[0] === MATOMO_OPTOUT_COOKIE);
}

export function isEulerianOptedOut(storage: Pick<Storage, "getItem"> = localStorage): boolean {
    return storage.getItem(EULERIAN_OPTOUT_STORAGE_KEY) !== null;
}

export async function analyticsInit() {
    localStorage.removeItem(LEGACY_CONSENT_STORAGE_KEY);

    if (!isMatomoOptedOut()) {
        matomoInit();
    }

    // le module DSFR refuse de démarrer si l’utilisateur a refusé ; on ne force jamais enable()
    if (!isEulerianOptedOut()) {
        try {
            const { startEulerianAnalytics } = await import("@codegouvfr/react-dsfr/eulerianAnalytics");
            await startEulerianAnalytics({
                domain: "acwg.cartes.gouv.fr",
                site: {
                    environment: import.meta.env.PROD ? "production" : "development",
                    entity: "IGN",
                },
            });
        } catch (error) {
            console.error("Eulerian analytics initialization failed", error);
        }
    }
}

function matomoInit() {
    const _paq = (window._paq = window._paq ?? []);
    _paq.push(["setTrackerUrl", MATOMO_URL + "matomo.php"]);
    _paq.push(["setSiteId", MATOMO_SITE_ID]);
    _paq.push(["setDoNotTrack", true]);
    _paq.push(["enableLinkTracking"]);
    const g = document.createElement("script");
    g.async = true;
    g.src = MATOMO_URL + "matomo.js";
    document.head.appendChild(g);
}

// Page vue sans paramètres de requête (vue carte, filtres, signalement), avec l’URL précédente comme référent
export function trackMatomoPageView(pathname: string, referrerUrl: string) {
    if (!window._paq) return;

    window._paq.push(["setReferrerUrl", referrerUrl]);
    window._paq.push(["setCustomUrl", window.location.origin + pathname]);
    window._paq.push(["setDocumentTitle", MATOMO_DOCUMENT_TITLE]);
    window._paq.push(["trackPageView"]);
}
