import { oidcSpa } from "oidc-spa/react-spa";
import { z } from "zod";

export const {
    bootstrapOidc,
    useOidc,
    getOidc,
    // Wrap your all application within this component in src/main.tsx
    // Non blocking rendering is possible, see: https://docs.oidc-spa.dev/v/v10/features/non-blocking-rendering#react-spas
    OidcInitializationGate,
} = oidcSpa
    .withExpectedDecodedIdTokenShape({
        // Describe the expected shape of the ID Token.
        // Think of `decodedIdToken` as your “user” object.
        // If you’re unsure what fields are available, open the console:
        // oidc-spa will log the decoded token for you.
        decodedIdTokenSchema: z.object({
            sub: z.string(),
            name: z.string(),
            email: z.email().optional(),
            preferred_username: z.string().optional(),
        }),
        // The mock user returned when the mock implementation is enabled.
        decodedIdToken_mock: {
            sub: "mock-user",
            name: "John Doe",
            email: "example@ign.fr",
            preferred_username: "john.doe",
        },
    })
    // See: https://docs.oidc-spa.dev/v/v10/features/auto-login#react-spa
    .withAutoLogin()
    .createUtils();

bootstrapOidc(
    import.meta.env.VITE_OIDC_USE_MOCK === "true"
        ? {
              // Mock mode: no requests to an auth server are made.
              implementation: "mock",
              isUserInitiallyLoggedIn: true,
              // You can also override mock user data here.
          }
        : {
              implementation: "real",
              // Configure your OIDC provider in `.env.local`
              issuerUri: `${import.meta.env.VITE_IAM_URL}/realms/${import.meta.env.VITE_IAM_REALM}`,
              clientId: import.meta.env.VITE_IAM_CLIENT_ID,
              // Enable for detailed initialization and token lifecycle logs.
              debugLogs: import.meta.env.MODE === "development",
          }
);
