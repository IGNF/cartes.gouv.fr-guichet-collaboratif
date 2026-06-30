applyTo: "\*_/_"
description: "Project Configuration & Guidelines"

---

# Project Configuration

This project is a **React 19 SPA** built with TypeScript, OpenLayers, and the DSFR design system (`@codegouvfr/react-dsfr`). It targets French government geospatial use cases.
It uses a modular architecture, clear separations between different components, and maximum reuse of code and hooks in particular.

## Resources

- **geopf-extensions JSDoc**: https://ignf.github.io/geopf-extensions-openlayers/jsdoc/
- **API Backend**: https://espacecollaboratif.ign.fr/gcms/api/doc/#documentation-de-lapi-collaborative-ign

---

## File Structure

```text
src/
├── App.tsx                    # Main entry — initializes components in cascade
├── main.tsx                   # Application entry point
├── api/                       # API calls
│   ├── communityData.ts       # Community data: functionality, available layers...
│   ├── geoserviceData.ts      # Geoservice layers
│   ├── reportData.ts          # Reports (second main feature)
│   └── transactionData.ts     # Send feature modifications
├── components/                # Reusable components
│   ├── Layout/                # Header, footer, map annexes
│   ├── AlertComponent.tsx     # Load / error / success alerts
│   ├── ModaleComponent.tsx    # Confirmation modal for sensitive actions
│   └── ...
├── constants/                 # Types and static utilities
│   ├── communities/
│   │   ├── types.ts
│   │   └── utils/index.ts
│   ├── contributions/         # Feature modification types
│   ├── localStorage/          # Persist layers metadata, map state, community config
│   ├── reports/
│   ├── savedSearches/         # User-saved searches on layer features
│   ├── user/
│   ├── working-layer/         # Single active layer the user interacts with
│   └── urls.ts                # All URL constants — prefixed with BASE_URL or DISCOVER_URL
├── css/
│   └── index.css              # Single CSS import entry point
├── features/                  # Non-reusable app sections
│   ├── contributions/         # Geometry and attribute modifications
│   ├── navigation/            # Map interactions and controls
│   │   ├── MainMap.tsx
│   │   └── ...
│   ├── reports/
│   └── working-layer/
│       ├── forms/             # Display or edit attributes
│       └── ...
├── hooks/                     # React hooks for all app levels
│   ├── navigation/
│   │   ├── capabilities/      # GetCapabilities of geoservices
│   │   ├── controls/          # Interaction list and selection
│   │   └── layers/            # WMS/WMTS layer fetching
│   ├── reports/
│   └── working-layer/
│       ├── searchObjects/     # Query features on working layer
│       └── ...
├── locale/                    # i18n translation files (i18nifty)
│   └── FileName.locale.ts     # One file per component/feature — FR + EN
└── store/                     # Global Zustand stores
    ├── useCommunityStore.ts
    ├── useContributionStore.ts # Temp modifications before saving to backend
    ├── useMapStore.ts
    ├── useReportStore.ts
    └── ...
```

---

## Conventions

### Architecture rules

- **State**: Zustand for global client state (`src/store/use<Domain>Store.ts`). TanStack React Query for server state — never duplicate server state in Zustand.
- **Auth**: always via `useOidc` (`oidc-spa`). Never implement custom auth logic. User identity via `useUserStore`.
- **URLs**: centralized in `src/constants/urls.ts`. Never hardcode URLs inline.
- **i18n**: every user-facing string translated with `i18nifty` in `/locale/FileName.locale.ts`.

### Styling

- DSFR first — prefer DSFR classes and the `fr` token object.
- Plain `.css` files only — no SCSS, CSS modules, or CSS-in-JS for new code.
- All CSS imported via `src/css/index.css`.
- Inline styles only for dynamic values not expressible with CSS variables.

### Components

- Functional components only. Default `function` exports for new files.
- Props typed with `interface` or `type`. Never export unnamed components.

```tsx
interface MyComponentProps {
    label: string;
    disabled?: boolean;
}

export default function MyComponent(props: PropsWithChildren<MyComponentProps>) {
    const { label, disabled } = props;
    return <div aria-disabled={disabled}>{label}</div>;
}
```

### Import order

1. Third-party
2. Project (`@/` aliases and relative modules)

## Pre/Post Change Checklist

Before coding:

1. Check similar existing components/services.
2. Verify lint/type rules (`eslint.config.ts`, TS types, and project scripts).
3. Ensure DSFR and a11y compliance.

After coding:

1. Run relevant lint/type/check scripts if doubt.

## Do Not

- Export unnamed components or ignore TypeScript strictness.
- Skip DSFR when a suitable component or token exists.
- Hardcode URLs — use `src/constants/urls.ts`.
- Duplicate server state in Zustand.
- Leave untranslated strings or `console.log` in committed code.
