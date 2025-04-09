import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { PropsWithChildren, useState } from "react";

import AppFooter from "./AppFooter";
import AppHeader from "./AppHeader";
import { useCommunityStore } from "@/store";

export default function AppLayout({ children }: PropsWithChildren) {
    const [headerOpen, setHeaderOpen] = useState(false);
    const [footerOpen, setFooterOpen] = useState(false);

    const { community } = useCommunityStore();

    return (
        <>
            {community && (
                <Button
                    iconId={headerOpen ? "ri-arrow-up-circle-fill" : "ri-arrow-down-circle-fill"}
                    onClick={() => setHeaderOpen(!headerOpen)}
                    priority="tertiary no outline"
                    title="Label button"
                    className="header-button"
                    style={{ marginTop: !headerOpen ? 0 : 116.5 }}
                />
            )}

            {community ? headerOpen && <AppHeader /> : <AppHeader />}

            <main id="main" role="main">
                <div className={fr.cx("fr-container--fluid")}>{children}</div>
            </main>

            {community && (
                <Button
                    iconId={footerOpen ? "ri-arrow-down-circle-fill" : "ri-arrow-up-circle-fill"}
                    onClick={() => setFooterOpen(!footerOpen)}
                    priority="tertiary no outline"
                    title="Label button"
                    className="footer-button"
                    style={{ marginBottom: !footerOpen ? 0 : 388 }}
                />
            )}

            {community ? footerOpen && <AppFooter /> : <AppFooter />}
        </>
    );
}
