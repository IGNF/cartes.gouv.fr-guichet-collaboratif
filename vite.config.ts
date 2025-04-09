import { defineConfig } from "vite";
import { join, resolve } from "path";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: "/cartes.gouv.fr/guichet-collaboratif/",
    server: {
        host: "0.0.0.0",
        cors: false,
    },
    resolve: {
        alias: {
            "@": resolve(join(__dirname, "src")),
        },
    },
});
