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

## Documentation développeurs

Consultez [CONTRIBUTING.md](./CONTRIBUTING.md)
