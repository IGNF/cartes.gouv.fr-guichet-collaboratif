import { fr } from "@codegouvfr/react-dsfr";
import { PropsWithChildren } from "react";

import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";
import useMatomoPageView from "@/hooks/useMatomoPageView";

export default function AppLayout({ children }: PropsWithChildren) {
    useMatomoPageView();

    return (
        <>
            <div className="app-layout">
                <AppHeader />

                <main id="main" role="main">
                    <div className={fr.cx("fr-container--fluid")}>{children}</div>
                </main>

                <AppFooter />
            </div>
        </>
    );
}
