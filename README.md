# cartes.gouv.fr-guichet-collaboratif

Interface cartographique collaborative reposant sur le fonctionnalités de l'API Collaborative et les services de la Géoplateforme.

## Description

Cette interface cartographique regroupe des fonctionnalités qui sont aujourd'hui en partie portées par les guichets de espacecollaboratif.ign.fr :

- de navigation et consultation (se localiser, se déplacer, gérer les couches de la carte, sélectionner et rechercher des objets sur la carte, exporter, imprimer)
- de signalement (créer un signalement, avec ou sans croquis ou documents, répondre à un signalement, supprimer un signalement)
- de contribution directe (saisir des objets, modifier des informations attributaires, des géométries, supprimer des objets, importer des données)

Les fonctionnalités présentes sont définies par la configuration du guichet sur l'API collaborative. Cette configuration définit les outils disponibles dans le détail, les contraintes de saisie et les permissions associées aux couches de données vecteur.

## Installation

- Clonez le dépôt

```bash
git clone https://github.com/IGNF/cartes.gouv.fr-guichet-collaboratif.git
cd cartes.gouv.fr-guichet-collaboratif
```

- Installez les dépendances

```bash
npm install
```

- Lancez le projet

```bash
npm run dev
```

## Configuration à l’exécution

L’image Docker est unique et tourne avec un système de fichiers en lecture seule, seul `/tmp` doit être inscriptible. Les paramètres IAM et l’URL de l’API collaborative se définissent au démarrage du conteneur par les variables d’environnement `APP_*` (voir `compose.yml`). Ces variables sont servies au navigateur : elles ne doivent jamais contenir de secret. Pour les surcharger en local : avec Docker, un fichier `compose.override.yml` ; sans Docker (`npm run dev`), les valeurs viennent de `public/env.js` et une variable `VITE_APP_*` dans un fichier `.env.local` prend le pas. Ces deux fichiers sont ignorés par git.

## Documentation développeurs

Consultez [CONTRIBUTING.md](./CONTRIBUTING.md)
