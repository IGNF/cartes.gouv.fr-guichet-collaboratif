---
name: request-api
description: Use when writing/editing code that touches the API — clients, types, mocks, tests. Source of truth is src/api/MockJson/swagger-merged_09_10.json.
---

# API Contract

Source of truth: `src/api/MockJson/swagger-merged_09_10.json`.

**Date check:** the filename is dated (`09_10`). If a `swagger-merged_*.json` with a later
date exists, use that one instead and note the switch — don't silently use a stale file.

**Don't load the whole file.** It's large — query only the part you need (e.g. `jq
'.paths["/users/{id}"]'` or `jq '.components.schemas.User'`) rather than reading it in full
each time.

**Tags** (domain areas, for quick orientation — jump straight to the relevant paths instead
of scanning the whole spec):

| tag          | scope                                                        |
| ------------ | ------------------------------------------------------------ |
| user         | Utilisateur                                                  |
| community    | Communauté ou groupe d'utilisateurs                          |
| layer        | Couche cartographique associée à une communauté              |
| member       | Membre d'une communauté                                      |
| database     | Base de données                                              |
| table        | Table de données                                             |
| column       | Attribut ou champ d'une table                                |
| feature      | Objet d'une table de données                                 |
| upload       | Téléversement                                                |
| transaction  | Ensemble de modifications apportées à des données d'une base |
| permission   | Permission d'accès                                           |
| report       | Signalement géolocalisé                                      |
| grid         | Emprises (entités administratives et autres)                 |
| emailplanner | Planification d'emails d'une communauté                      |
| geoservice   | Service de données géographiques                             |

If the spec is missing, ambiguous, or contradicts the code — **ask, don't guess.**
