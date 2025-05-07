import { defineConfig, loadEnv } from "vite";
import { join, resolve } from "path";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig((mode) => {
    const env = loadEnv(mode.mode, process.cwd());
    const BASE_URL = env.VITE_BASE_URL || "";
    const FRONT_URL = env.VITE_FRONT_URL || "";
    return {
        plugins: [react()],
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
