import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

import { trackMatomoPageView } from "@/analytics";

// Une page vue Matomo par changement de chemin : les paramètres de requête (vue carte, filtres) changent trop souvent
export default function useMatomoPageView() {
    const { pathname } = useLocation();
    const previousUrl = useRef(document.referrer.split("?")[0]);
    const lastTrackedPathname = useRef<string | null>(null);

    useEffect(() => {
        // évite le double envoi lié au double montage de StrictMode
        if (lastTrackedPathname.current === pathname) return;
        lastTrackedPathname.current = pathname;

        trackMatomoPageView(pathname, previousUrl.current);
        previousUrl.current = window.location.origin + pathname;
    }, [pathname]);
}
