import { oidcSpa } from "oidc-spa/react-spa";

export const { bootstrapOidc, useOidc, getOidc, OidcInitializationGate } = oidcSpa
    // pour le type checking du token décodé, pour le moment pas nécessaire
    // .withExpectedDecodedIdTokenShape({
    //     decodedIdTokenSchema: z.object({
    //         sub: z.string(),
    //         name: z.string(),
    //         email: z.email().optional(),
    //         preferred_username: z.string().optional(),
    //     }),
    //     decodedIdToken_mock: {
    //         sub: "mock-user",
    //         name: "John Doe",
    //         email: "example@ign.fr",
    //         preferred_username: "john.doe",
    //     },
    // })
    // Voir : https://docs.oidc-spa.dev/v/v10/features/auto-login#react-spa
    .withAutoLogin() // il faut être connecté pour toute l'application, donc on sera tout de suite redirigé vers la page de login si l'on n'est pas connecté
    .createUtils();

bootstrapOidc(
    import.meta.env.VITE_OIDC_USE_MOCK === "true"
        ? {
              // Mode mock pour les tests (si jamais) : pas de requêtes à l'iam
              implementation: "mock",
              isUserInitiallyLoggedIn: true,
              // on peut surcharger les données utilisateur ici
          }
        : {
              implementation: "real",
              issuerUri: `${import.meta.env.VITE_IAM_URL}/realms/${import.meta.env.VITE_IAM_REALM}`,
              clientId: import.meta.env.VITE_IAM_CLIENT_ID,
              debugLogs: import.meta.env.MODE === "development",
          }
);
