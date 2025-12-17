<!-- # MINISTÈRE DE L'ÉDUCATION NATIONALE

# RÉPUBLIQUE TOGOLAISE

# Travail-Liberté-Patrie

--- -->

# RAPPORT TECHNIQUE DE PROJET

# EN VUE DE LA PRÉSENTATION DU

# SYSTÈME DE GESTION D'EMPLOI DU TEMPS

---

## THÈME :

**Application Web de Génération et Gestion d'Emplois du Temps pour Établissements Scolaires et Universitaires**

---

**FORMATION :** DÉVELOPPEMENT WEB & WEB MOBILE

**Présenté et soutenu par :**
M. ALASSANE Paul

**Superviseur :**
M. TOGBA Lazare

**ANNÉE ACADÉMIQUE 2025-2026**

---

# REMERCIEMENTS

Je tiens à exprimer toute ma gratitude à mon superviseur et formateur, M. TOGBA Lazare, pour son soutien précieux et ses conseils éclairés tout au long de ce projet. Son accompagnement a été une source d'inspiration et de réussite.

Je souhaite également remercier chaleureusement l'équipe pédagogique de l'Académie Digitale Numérique (ADN) dont l'initiative a permis à de nombreux jeunes de bénéficier d'un cadre d'apprentissage exceptionnel.

Je n'oublie pas mes collègues développeurs pour leurs remarques constructives qui ont contribué à l'amélioration de ce travail.

Enfin, un grand merci à ma famille pour leur soutien indéfectible tout au long de mon parcours.

---

# RÉSUMÉ

Dans le cadre de la réalisation d'un projet pratique portant sur le développement d'une application de gestion d'emplois du temps, ce rapport présente la conception et l'implémentation d'un système complet destiné aux établissements scolaires et universitaires.

Ce projet, basé sur l'utilisation de technologies modernes orientées vers JavaScript et TypeScript, a été développé avec des outils adaptés à la création d'applications web performantes : React pour le frontend et Node.js/Express pour le backend.

L'objectif principal est de créer une plateforme permettant aux administrateurs, directeurs, responsables pédagogiques, enseignants et étudiants de gérer efficacement leurs emplois du temps, tout en offrant des fonctionnalités avancées telles que la génération automatique des plannings et l'authentification sécurisée avec support 2FA.

---

# SUMMARY

This report presents the design and implementation of a complete timetable management system for schools and universities. The project uses modern JavaScript/TypeScript technologies including React for the frontend and Node.js/Express for the backend.

The main objective is to create a platform enabling administrators, directors, pedagogical managers, teachers, and students to efficiently manage their schedules while offering advanced features such as automatic schedule generation and secure authentication with 2FA support.

---

# GLOSSAIRE

| Termes | Définition |
|--------|------------|
| API | Application Programming Interface, une interface permettant à deux applications de communiquer |
| JWT | JSON Web Token, standard ouvert pour l'échange sécurisé de jetons entre plusieurs parties |
| 2FA | Authentification à deux facteurs, méthode de sécurité exigeant deux formes d'identification |
| ORM | Object-Relational Mapping, technique de programmation pour convertir les données entre systèmes incompatibles |
| REST | Representational State Transfer, style d'architecture pour les systèmes distribués |
| SPA | Single Page Application, application web chargeant une seule page HTML |
| CORS | Cross-Origin Resource Sharing, mécanisme permettant les requêtes cross-origin |
| React | Bibliothèque JavaScript pour construire des interfaces utilisateur |
| TypeScript | Langage de programmation typé basé sur JavaScript |
| Vite | Outil de build rapide pour les projets web modernes |
| TailwindCSS | Framework CSS utilitaire pour le design |
| MySQL | Système de gestion de base de données relationnelle |
| Sequelize | ORM pour Node.js supportant MySQL, PostgreSQL, SQLite, etc. |
| Express | Framework web minimaliste pour Node.js |
| Axios | Client HTTP basé sur les promesses |
| React Query | Bibliothèque de gestion d'état serveur pour React |

---

# LISTE DES TABLEAUX

Tableau 1: Liste des fonctionnalités de l’application
Tableau 2: Hiérarchie des rôles
Tableau 3: Matrice des permissions
Tableau 4: Technologies Frontend
Tableau 5: Technologies Backend

---

# LISTE DES FIGURES

Figure 1: Logo UML
Figure 2: Architecture globale du système
Figure 3: Diagramme de classes - Gestion
Figure 4: Interface - Page d'accueil
Figure 5: Interface - Page de connexion
Figure 6: Interface - Tableau de bord
Figure 7: Diagramme de flux authentification 2FA

---

# SOMMAIRE / TABLE DE MATIERES

- [INTRODUCTION](#introduction)
- [A. CAHIER DE CHARGES](#a-cahier-de-charges)
    - [I. Contexte et définition du projet](#i-contexte-et-définition-du-projet)
    - [II. Objectifs](#ii-objectifs)
    - [III. Périmètre](#iii-périmètre)
    - [IV. Description fonctionnelle](#iv-description-fonctionnelle)
    - [V. Enveloppe budgétaire](#v-enveloppe-budgétaire)
    - [VI. Delai de realisation](#vi-delai-de-realisation)
    - [VII. Etude l’existant](#vii-etude-lexistant)
- [B. ANALYSE ET CONCEPTION](#b-analyse-et-conception)
    - [I. Présentation de la méthode d’analyse - UML](#i-présentation-de-la-méthode-danalyse---uml)
    - [II. Outil de modélisation](#ii-outil-de-modélisation)
    - [III. Outil de conception](#iii-outil-de-conception)
    - [IV. Etude et conception de la solution](#iv-etude-et-conception-de-la-solution)
    - [V. Mise en oeuvre du projet](#v-mise-en-oeuvre-du-projet)
- [C. BILAN DU PROJET ET PERSPECTIVES D'AMÉLIORATION](#c-bilan-du-projet-et-perspectives-damélioration)
- [CONCLUSION](#conclusion)
- [BIBLIOGRAPHIE & WEBOGRAPHIE](#bibliographie--webographie)

---

# INTRODUCTION

Dans un contexte éducatif où la gestion du temps et des ressources devient de plus en plus complexe, les établissements scolaires et universitaires font face à des défis majeurs pour organiser efficacement leurs emplois du temps. La multiplicité des contraintes (disponibilité des enseignants, capacité des salles, cohérence pédagogique) rend cette tâche particulièrement ardue lorsqu'elle est effectuée manuellement.

Ce projet propose donc la création d'une application web complète dédiée à la gestion et la génération automatique des emplois du temps. Cette solution facilitera le travail des administrateurs et offrira à chaque acteur (directeurs, enseignants, étudiants) une vue personnalisée de son planning.

Grâce à une interface intuitive et moderne, les utilisateurs pourront naviguer facilement dans leurs emplois du temps, recevoir des notifications en temps réel, et bénéficier d'une authentification sécurisée avec support de l'authentification à deux facteurs (2FA).

En somme, notre plateforme vise à moderniser la gestion des emplois du temps, à réduire les erreurs de planification et à améliorer la communication au sein des établissements éducatifs.

---

# A. CAHIER DE CHARGES

## I. Contexte et définition du projet
Dans le secteur éducatif, la planification des emplois du temps constitue un défi organisationnel majeur. Les responsables pédagogiques doivent jongler avec de nombreuses contraintes : disponibilité des enseignants, capacité des salles, respect des volumes horaires, cohérence des parcours étudiants.

Ce projet vise à développer une application web moderne permettant :
- La gestion centralisée des emplois du temps multi-établissements
- La génération automatique de plannings optimisés
- Un accès personnalisé selon le rôle de l'utilisateur
- Une interface responsive accessible sur tous les appareils

## II. Objectifs
Le projet consiste à développer une plateforme qui :
- **Centralise** la gestion des emplois du temps pour plusieurs établissements
- **Automatise** la génération des plannings en respectant les contraintes
- **Personnalise** l'affichage selon le rôle (admin, directeur, enseignant, étudiant)
- **Sécurise** l'accès avec authentification JWT et support 2FA
- **Notifie** les utilisateurs des changements en temps réel
- **Exporte** les emplois du temps au format PDF

## III. Périmètre
Cette application est destinée à :
- **Administrateurs système** : gestion globale de la plateforme
- **Directeurs d'établissement** : supervision de leur établissement
- **Responsables pédagogiques** : gestion des plannings et ressources
- **Enseignants** : consultation de leur emploi du temps et déclaration d'absences
- **Étudiants** : consultation de leur emploi du temps et notifications

## IV. Description fonctionnelle

**Tableau 1: Liste des fonctionnalités de l’application**

| Fonctionnalité | Description | Acteurs |
|----------------|-------------|---------|
| Authentification | Connexion sécurisée avec email/mot de passe et support 2FA | Tous |
| Gestion des utilisateurs | CRUD complet sur les utilisateurs et attribution des rôles | Admin, Directeur |
| Gestion des établissements | Configuration des établissements, classes, salles, matières | Admin, Directeur |
| Gestion des emplois du temps | Création, modification, suppression des séances | Admin, Directeur, Resp. Péda. |
| Consultation EDT | Affichage personnalisé de l'emploi du temps | Tous |
| Génération automatique | Algorithme de génération optimisée des plannings | Admin, Directeur |
| Gestion des salles | Disponibilité et réservation des salles | Admin, Directeur, Resp. Péda. |
| Notifications | Alertes en temps réel (changements, annulations, rattrapages) | Tous |
| Export PDF | Génération de documents PDF des emplois du temps | Tous |
| Déclaration d'absences | Signalement des absences par les enseignants | Enseignants |
| Gestion des rattrapages | Planification des cours de rattrapage | Admin, Directeur, Resp. Péda. |

**Tableau 2: Hiérarchie des rôles**

| Rôle | Niveau | Description |
|------|--------|-------------|
| `admin` | 1 | Administrateur système complet |
| `directeur` | 2 | Directeur d'établissement |
| `responsable_pedagogique` | 3 | Responsable pédagogique |
| `enseignant` | 4 | Enseignant |
| `etudiant` | 5 | Étudiant |

**Tableau 3: Matrice des permissions**

| Fonctionnalité | Admin | Directeur | Resp. Péda. | Enseignant | Étudiant |
|----------------|-------|-----------|-------------|------------|----------|
| Voir son EDT | ✓ | ✓ | ✓ | ✓ | ✓ |
| Modifier EDT | ✓ | ✓ | ✓ | ✗ | ✗ |
| Gérer utilisateurs | ✓ | ✓ | ✗ | ✗ | ✗ |
| Gérer salles | ✓ | ✓ | ✓ | ✗ | ✗ |
| Gérer cours | ✓ | ✓ | ✓ | ✓* | ✗ |
| Statistiques | ✓ | ✓ | ✓ | ✓* | ✗ |
| Admin système | ✓ | ✗ | ✗ | ✗ | ✗ |

*\*Limité à leurs propres cours*

## V. Enveloppe budgétaire
*Note: Cette section est une estimation fictive dans le cadre de ce projet académique.*

| Poste de dépense | Estimation |
|------------------|------------|
| Hébergement (Cloud - AWS/Vercel) | 50€ / mois |
| Nom de domaine | 15€ / an |
| Outils de développement (Licences) | 0€ (Open Source) |
| Ressource humaine (Développement) | 3000€ (Valorisation) |
| **Total Estimé** | **~3100€ (Initial)** |

## VI. Delai de realisation
Le projet a été réalisé sur une période de **3 mois**, découpée comme suit :
- **Mois 1** : Analyse, Conception, Maquettage
- **Mois 2** : Développement Backend (API, BDD) et Frontend (Interface de base)
- **Mois 3** : Intégration, Tests, Déploiement et Rédaction du rapport

## VII. Etude l’existant
Actuellement, de nombreux établissements gèrent encore leurs emplois du temps manuellement (Excel, papier) ou via des logiciels obsolètes et non connectés.
- **Inconvénients actuels** : Erreurs fréquentes de saisie, difficultés de communication des changements, absence d'accès mobile, perte de temps considérable pour les responsables.
- **Avantages de la solution proposée** : Centralisation, accessibilité web/mobile, automatisation, notifications en temps réel.

---

# B. ANALYSE ET CONCEPTION

## I. Présentation de la méthode d’analyse - UML
Pour la modélisation de notre système, nous avons opté pour **UML (Unified Modeling Language)**. C'est un langage graphique standardisé permettant de visualiser, spécifier, construire et documenter les éléments d'un système logiciel.

**Figure 1: Logo UML**
*(Logo UML standard)*

### 1. Diagramme de cas d’utilisation
Il représente les interactions entre les acteurs (utilisateurs) et le système. Il définit "qui fait quoi".
### 2. Diagramme de classe
Il décrit la structure statique du système en montrant les classes, leurs attributs, opérations et les relations entre elles.
### 3. Diagramme de séquence (facultatif)
Il détaille la chronologie des interactions entre les objets pour un cas d'utilisation donné.

## II. Outil de modélisation
Pour réaliser nos diagrammes et maquettes, nous avons utilisé :
- **Lucidchart / PlantUML** : Pour la création des diagrammes UML (Classes, Cas d'utilisation). Ces outils permettent une collaboration en temps réel et une génération rapide.

## III. Outil de conception
- **Figma** : Utilisé pour le prototypage des interfaces utilisateur (UI/UX). Il a permis de valider le design system (couleurs, typographie) avant le développement.

## IV. Etude et conception de la solution

### 1. Etude fonctionnelle
L'application couvre plusieurs modules clés :
- **Module Authentification** : Sécurisation des accès.
- **Module Gestion** : Administration des données de référence (Salles, Matières, Utilisateurs).
- **Module Planification** : Cœur du système, permettant de placer les cours sur une grille temporelle.
- **Module Communication** : Notifications et absences.

### 2. Etude technique
Nous avons adopté une **architecture 3-tiers** :

**Figure 2: Architecture globale du système**
- **Frontend (Client)** : React.js (SPA)
- **Backend (Serveur)** : Node.js avec Express
- **Base de Données** : MySQL

### 3. Les diagramme (Captures)

#### a. Diagramme de classe
**Figure 3: Diagramme de classes - Gestion**
*(Voir Annexe A pour le diagramme complet)*
Ce diagramme montre les relations entre `Utilisateur`, `Etablissement`, `Cours`, `Salle`, etc.

#### b. Diagramme de cas d’utilisation
*Acteurs principaux* : Admin, Enseignant, Étudiant.
*Cas d'utilisation* : "Se connecter", "Consulter EDT", "Modifier EDT" (Admin seulement).

#### c. Descriptions textuelles des cas d’utilisation

**Cas 1 : Se connecter**
- **Acteur** : Tout utilisateur
- **Précondition** : Avoir un compte actif
- **Scénario nominal** :
  1. L'utilisateur saisit email et mot de passe.
  2. Le système vérifie les identifiants.
  3. Si 2FA activée, demande du code.
  4. Le système redirige vers le tableau de bord.

**Cas 2 : Générer un emploi du temps**
- **Acteur** : Responsable Pédagogique
- **Scénario nominal** :
  1. Le responsable sélectionne une classe et une période.
  2. Il lance l'algorithme de génération.
  3. Le système vérifie les contraintes (dispo profs, salles).
  4. Le système propose un planning.
  5. Le responsable valide et publie.

### 4. Choix technique

**Tableau 4: Technologies Frontend**
- **React** ![React Logo](https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/20px-React-icon.svg.png) : Bibliothèque flexible et performante pour les interfaces dynamiques.
- **TypeScript** : Apporte la sécurité du typage pour réduire les bugs.
- **TailwindCSS** : Permet un design rapide et responsive.

**Tableau 5: Technologies Backend**
- **Node.js** : Performance grâce à son architecture non-bloquante.
- **Express** : Légèreté et flexibilité pour créer des API REST.
- **MySQL** : Robustesse pour les données relationnelles complexes.

## V. Mise en oeuvre du projet

### 1. Gestion de projet

#### a. Planification et méthodologie (SCRUM)
Nous avons suivi une approche **Agile Scrum** simplifiée :
- **Sprints** de 2 semaines.
- **Daily meetings** pour le suivi.
- **Backlog** priorisé par valeur métier (Authentification d'abord, puis EDT, puis options).

#### b. Découpage des fonctionnalités
- **Lot 1** : Socle technique, Authentification, Base de données.
- **Lot 2** : Gestion des utilisateurs et données de base (CRUD).
- **Lot 3** : Moteur d'emploi du temps et affichage.
- **Lot 4** : Notifications et finitions.

### 2. Implémentation de la solution
- **Couche Données** : Implémentée avec **Sequelize** (ORM). Les modèles `Utilisateur`, `Cours`, `Salle` sont synchronisés avec MySQL.
- **Couche Métier (API)** : Structurée en Contrôleurs (logique), Services (traitement) et Routes. Utilisation de Middlewares pour l'auth.
- **Couche Présentation** : Structure modulaire avec composants React (`/components`), pages (`/pages`) et gestion d'état (`Context API` + `TanStack Query`).

### 3. Sécurité et contraintes techniques
La sécurité a été une priorité :
- **Authentification forte** : Implémentation de l'authentification à double facteur (2FA) avec algorithme TOTP (Time-based One-Time Password).
- **Protection des données** : Mots de passe hachés avec `bcrypt`.
- **Session** : Utilisation de **JWT (JSON Web Token)** pour sécuriser les appels API sans état (stateless).
- **Validation** : Toutes les entrées sont validées par **Zod** (frontend) et **express-validator** (backend).

### 4. Présentation de quelques interface

**Figure 4: Interface - Page d'accueil**
Page vitrine présentant l'application.

**Figure 5: Interface - Page de connexion**
Formulaire sécurisé avec gestion des erreurs et lien d'inscription.

**Figure 6: Interface - Tableau de bord**
Interface principale affichant les widgets, les prochains cours et les notifications.

---

# C. BILAN DU PROJET ET PERSPECTIVES D'AMÉLIORATION

## Bilan
Le projet a abouti à une application fonctionnelle et robuste.
- **Forces** : Architecture moderne, code typé (TypeScript), sécurité avancée (2FA).
- **Faiblesses** : L'algorithme de génération automatique peut être optimisé pour gérer plus de contraintes complexes.

## Perspectives
- **Court terme** : Export PDF natif plus complet.
- **Moyen terme** : Application mobile native (React Native).
- **Long terme** : Utilisation de l'IA pour optimiser le placement des cours automatiquement.

---

# CONCLUSION

Le développement de ce Système de Gestion d'Emploi du Temps a été une expérience enrichissante, permettant de concrétiser les acquis de la formation Développement Web & Mobile. L'application répond aux exigences modernes de performance, sécurité et ergonomie. Elle offre une solution tangible aux problèmes d'organisation des établissements scolaires.

---

# BIBLIOGRAPHIE & WEBOGRAPHIE

**DÉVELOPPEMENT WEB**
- Documentation React : https://react.dev
- MDN Web Docs : https://developer.mozilla.org

**BACKEND & BASE DE DONNÉES**
- Documentation Node.js : https://nodejs.org
- Documentation Sequelize : https://sequelize.org

**SÉCURITÉ**
- OWASP Top 10 : https://owasp.org
- JWT.io Introduction : https://jwt.io/introduction

**OUTILS**
- Lucidchart : https://lucidchart.com
- Figma : https://figma.com
 