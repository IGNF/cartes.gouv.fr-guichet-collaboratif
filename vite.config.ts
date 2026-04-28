import { defineConfig, loadEnv } from "vite";
import { oidcSpa } from "oidc-spa/vite-plugin";
import tsconfigPaths from "vite-tsconfig-paths";
import { join, resolve } from "path";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig((mode) => {
    const env = loadEnv(mode.mode, process.cwd());
    const BASE_URL = env.VITE_BASE_URL || "";
    const FRONT_URL = env.VITE_FRONT_URL || "";
    return {
        plugins: [
            react(),
            tsconfigPaths(),
            oidcSpa({
                // Voir : https://docs.oidc-spa.dev/v/v10/security-features/browser-runtime-freeze
                browserRuntimeFreeze: {
                    enabled: true,
                    excludes: [
                        "Array", // nécessaire pour le script d'analytics
                        "XMLHttpRequest", // nécessaire pour geopf-extensions-openlayers (recherche de lieu)
                        "Promise", //Mandatory until jsPdf library is there
                    ],
                },
            }),
        ],
        inlineConfig: {
            envFile: "/",
        },
        base: `${BASE_URL}${FRONT_URL}`,
        server: {
            host: "0.0.0.0",
            cors: false,
        },
        resolve: {
            alias: {
                "@": resolve(join(__dirname, "src")),
            },
        },
    };
});
