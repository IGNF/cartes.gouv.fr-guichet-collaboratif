import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { observer } from "./observer.tsx";
import { OidcInitializationGate } from "./oidc.ts";

startReactDsfr({ defaultColorScheme: "system" });

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <OidcInitializationGate>
            <App />
        </OidcInitializationGate>
    </StrictMode>
);

observer.observe(document.body, {
    childList: true,
    subtree: true,
});
