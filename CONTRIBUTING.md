# Contribuer

Merci de nous aider sur ce projet ou d'envisager de le faire. Tout type de contribution est bienvenue. 🙏

## Contributions autres que du code

N'hésitez pas à :

- signaler une anomalie 🐛
- demander une évolution ✨
- proposer de la documentation 📚

en ouvrant une **[nouvelle issue](https://github.com/IGNF/cartes.gouv.fr-guichet-collaboratif/issues/new/choose)**.

Les différents formulaires sont là pour vous guider dans la rédaction de votre _issue_.

Vous pouvez également parcourir les [issues existantes](https://github.com/IGNF/cartes.gouv.fr-guichet-collaboratif/issues) pour voir si le sujet n'a pas déjà été abordé et apporter des informations complémentaires ou proposer des pistes de solutions dans la conversation.

💡 Conseil : le texte des issues comme des pull requests et de toutes les conversations sur Github est en _markdown_. N'hésitez pas à en faire usage pour structurer vos demandes. [Documentation du Github Flavored Markdown](https://github.github.com/gfm/)

Dans tous les cas faites preuve de bienveillance et de pédagogie dans vos descriptions et dans les conversations.

## Modifier le code ou la documentation

Si vous voulez corriger une anomalie ou apporter une nouvelle fonctionnalité vous-même, faites ces modifications dans un fork du dépôt et soumettez-nous une [pull request](https://docs.github.com/fr/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests).

N'hésitez pas à consulter le [README](./README.md) et la [documentation](./docs/).

---

Ci-dessous, un guide pas à pas décrit le processus de contribution via un _fork_ et une _pull request_. Si vous êtes déjà familier de Git et Github, il ne vous sera pas nécessaire mais peut constituer néanmoins un document auquel vous pouvez vous référer en cas de doute. Il répète quelques éléments présents dans la documentation d'installation.

### Première installation

- Créez un compte Github
- Installez Git sur votre poste de travail
- Configurez Git avec votre nom et votre email
- Forkez le dépôt depuis l'interface de Github
- Clonez votre fork (en utilisant SSH ou l'url HTTPS, à votre convenance) :

```bash
git clone git@github.com:your_GH_account/cartes.gouv.fr-guichet-collaboratif.git
```

ou

```bash
git clone https://github.com/your_GH_account/cartes.gouv.fr-guichet-collaboratif.git
```

(en cas de problème, vérifiez votre configuration réseau. Si vous travaillez derrière un proxy, vérifiez par exemple vos variables d'environnement HTTP_PROXY et HTTPS_PROXY)

- Placez vous dans le nouveau dossier créé :

```bash
cd cartes.gouv.fr-guichet-collaboratif
```

- Ajoutez le dépôt principal comme source "upstream" (en utilisant l'url HTTPS) :

```bash
git remote add upstream https://github.com/IGNF/cartes.gouv.fr-guichet-collaboratif
```

- Votre remote devrait maintenant être "origin", votre fork, et "upstream" devrait correspondre au dépôt principal sur IGNF. Vous pouvez le vérifier en utilisant la commande :

```bash
git remote -v
```

- Vous devriez voir quelque-chose comme ça :

```
origin	git@github.com:your_GH_account/cartes.gouv.fr-guichet-collaboratif.git (fetch)
origin	git@github.com:your_GH_account/cartes.gouv.fr-guichet-collaboratif.git (push)
upstream	https://github.com/IGNF/cartes.gouv.fr-guichet-collaboratif.git (fetch)
upstream	https://github.com/IGNF/cartes.gouv.fr-guichet-collaboratif.git (push)
```

Il est important qu'"origin" pointe bien vers votre fork.

### Maintenir votre dépôt à jour

- Assurez vous d'être sur la branche develop :

```bash
git checkout develop
```

- Téléchargez les mises à jour de toutes les branches de upstream :

```bash
git fetch upstream
```

- Mettez à jour votre branche develop locale au même niveau que la branche develop du dépôt principal :

```bash
git rebase upstream/develop
```

### Mettre à jour si vous avez des changements locaux

Si la commande précédente `rebase` échoue avec le message "error: cannot rebase: You have unstaged changes...",
mettez vos modifications locales de côté dans le "stash" en utilisant la commande :

```bash
git stash
```

- Maintenant vous pouvez "rebaser" :

```bash
git rebase upstream/develop
```

- Puis réappliquez vos changements mis de côté :

```bash
git stash apply
```

- Supprimez les changements que vous aviez mis dans le "stash" (optionnel):

```bash
git stash pop
```

### Créer une branche

Maintenant que vous avez mis à jour votre branche main locale, vous pouvez créer une nouvelle branche à partir d'elle :

- Créez une branche (ici appelée "nouvelle-doc") et placez vous dessus :

```bash
git checkout -b feat/nouvelle-feature-XXX
```

NB : nommez dans la mesure votre branche avec un préfixe selon qu'il sagit d'une évolution `feat/...`, d'un correctif `fix/...` ou de documentation `docs/...` et mettez le numéro de l'issue associée à la fin de son nom (ici à la place de XXX).
**Ne proposez qu'une seule évolution par branche. Ne mélangez pas plusieurs corrections ou changements dans une même branche et une même pull request, sauf si elles sont fortement liées**

### Apporter des changements

Vous pouvez utiliser l'éditeur de votre choix pour apporter des changements. Nous recommandons [Visual Studio Code](https://code.visualstudio.com/download).

```bash
code .
```

### Commiter les changements

- Ajoutez les fichiers au commit (fichiers modifiés ou ajoutés) :

```bash
git add file1
git add path/to/file2
```

- Commitez le changement :

```bash
git commit -m "feat: ajout fonctionnalité"
```

NB : dans l'exemple, le commit porte le message "ajout fonctionnalité". Utilisez un message court mais explicite pour décrire vos changements. Ne décrivez pas tous vos commits de la même façon et préfixez vos noms de commits car nous utilisons des [commits conventionnels](https://www.conventionalcommits.org/fr/v1.0.0/).

### Pousser les changements sur GitHub

- Poussez les changements de votre nouvelle branche sur votre fork sur github :

```bash
git push origin feat/nouvelle-feature-XXX
```

NB : n'hésitez pas à pousser régulièrement vos changements, même s'ils sont encore à l'état de brouillon pour sauvegarder votre travail.

### Créer une pull-request

Au moment de votre push, GitHub va vous répondre directement en vous donnant l'URL à laquelle vous pouvez créer votre pull request. Vous pouvez suivre cette URL ou bien vous rendre à tout moment sur votre fork sur Github, afficher la branche "feat/nouvelle-feature-XXX" et Github vous montrera un bandeau avec un bouton pour créer une nouvelle pull request.

💡 Rappel : N'hésitez pas à consulter la[documentation de Github concernant les pull-request](https://docs.github.com/fr/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests).

Dans le formulaire de création d'une nouvelle pull request :

- **Donnez un titre concis et clair**. Il peut être proche de celui de l'issue associée,
- **Décrivez clairement les changements** que vous proposez. Décrire les changements permet de comprendre à quoi ils correspondent avant de se plonger dans le code,
- Si vos changements concernent l'interface graphique, **insérez des copies d'écran** dans la description (limitées aux seules parties utiles et éventuellement annotées)
- S'il existe une issue associée, **mentionnez l'issue concernée** avec la syntaxe `#18`. Si nécessaire, mentionnez plusieurs issues et d'autres pull request
- Décrivez de quelle manière on peut tester vos changements,
- Mentionnez la présence de changement cassants ou de manière d'installer ou builder le projet.

### Après avoir créé une pull request

Les mainteneurs du dépôt vont maintenant examiner votre pull request. Ils feront une _revue de code_ aussi bien la description de vos changements que le code lui-même.
Si besoin, ils travailleront avec vous pour améliorer vos changements en formulant des commentaires ou en intervenant directement sur votre code.

Si vous êtes amenés à faire des changements suite à cette revue de code, modifiez également la description de la pull request et mettez à jour les captures d'écran.

Une fois que les changements dans votre pull request seront prêts à être intégrés, les mainteneurs décideront de la façon la plus appropriée de les intégrer dans la branche `main` du dépôt principal :

- en mergeant la branche avec tous ces commits + un merge commit,
- en combinant tous les commits en un seul (squash)
- ou en rebasant tous vos commits sur la branche main, à la suite des commits déjà présents.

### Déploiement de vos changements 🚀

Une fois vos changements intégrés dans la branche `develop` du projet, les mainteneurs décideront du moment opportun pour les intégrer à une release et les déployer.
