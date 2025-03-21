import { fr } from "@codegouvfr/react-dsfr";

import AppHeader from "./components/Layout/AppHeader";
import AppFooter from "./components/Layout/AppFooter";

export default function App() {
    return (
        <>
            <AppHeader />
            <main id="main" role="main">
                <div className={fr.cx("fr-container")}>Hello</div>
            </main>
            <AppFooter />
        </>
    );
}
