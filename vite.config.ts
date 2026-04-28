import { defineConfig, loadEnv } from "vite";
import { oidcSpa } from "oidc-spa/vite-plugin";
import { join, resolve } from "path";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig((mode) => {
    const env = loadEnv(mode.mode, process.cwd());
    const BASE_URL = env.VITE_BASE_URL || "";
    const FRONT_URL = env.VITE_FRONT_URL || "";
    return {
        plugins: [
            react(),
            oidcSpa({
                // Voir : https://docs.oidc-spa.dev/v/v10/security-features/browser-runtime-freeze
                browserRuntimeFreeze: {
                    enabled: true,
                    excludes: [
                        "Array", // nécessaire pour le script d'analytics
                        "XMLHttpRequest", // nécessaire pour geopf-extensions-openlayers (recherche de lieu)
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
            tsconfigPaths: true,
            alias: {
                "@": resolve(join(__dirname, "src")),
            },
        },
        css: {
            lightningcss: {
                // Permet de compiler suite à l'erreur @media screen and (min-width: 0\0) and (min-resolution: 72dpi)
                // Provenant du dsfr
                errorRecovery: true,
            },
        },
        build: {
            chunkSizeWarningLimit: 1500,
            rolldownOptions: {
                output: {
                    codeSplitting: true,
                    manualChunks(id) {
                        if (!id.includes("node_modules")) return;

                        if (id.includes("/ol/") || id.includes("geopf-extensions-openlayers")) {
                            return "map-vendor";
                        }
                        if (id.includes("@gouvfr/dsfr")) {
                            return "dsfr-vendor";
                        }

                        if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
                            return "react-vendor";
                        }

                        if (id.includes("@tanstack")) {
                            return "query-vendor";
                        }

                        if (id.includes("oidc-spa") || id.includes("geoportal-access-lib")) {
                            return "auth-vendor";
                        }

                        return "vendor";
                    },
                },
            },
        },
    };
});
