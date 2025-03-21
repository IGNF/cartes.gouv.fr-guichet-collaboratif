import { fr } from "@codegouvfr/react-dsfr";
import { PropsWithChildren } from "react";

import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";

export default function AppLayout({ children }: PropsWithChildren) {
    return (
        <>
            <AppHeader />
            <main id="main" role="main">
                <div className={fr.cx("fr-container--fluid")}>{children}</div>
            </main>
            <AppFooter />
        </>
    );
}
