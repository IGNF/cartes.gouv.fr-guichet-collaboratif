import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";
import { observer } from "./observer.tsx";
startReactDsfr({ defaultColorScheme: "system" });

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);

observer.observe(document.body, {
    childList: true,
    subtree: true,
});
