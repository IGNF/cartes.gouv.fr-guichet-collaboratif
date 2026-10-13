// Configuration lue depuis window.__APP_ENV__ (public/env.js en dev, /tmp/env.js généré au démarrage du conteneur)
const KEYS = ["APP_IAM_URL", "APP_IAM_REALM", "APP_IAM_CLIENT_ID", "APP_ESPACECO_URL"] as const;

type Env = Record<(typeof KEYS)[number], string>;

declare global {
    interface Window {
        __APP_ENV__?: Partial<Env>;
    }
}

// En dev, une variable VITE_APP_* (par exemple dans .env.local) prend le pas sur public/env.js
const overrides: Partial<Env> = import.meta.env.DEV
    ? Object.fromEntries(KEYS.map((key) => [key, import.meta.env[`VITE_${key}`]]).filter(([, value]) => value))
    : {};

const raw: Partial<Env> = { ...window.__APP_ENV__, ...overrides };
const missing = KEYS.filter((key) => !raw[key]);
if (missing.length) {
    throw new Error(`Configuration manquante : ${missing.join(", ")}`);
}

export const env = raw as Env;
