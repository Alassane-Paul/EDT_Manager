# Documentation Technique - Système de Gestion d'Emploi du Temps

## Table des matières
1. [Introduction](#introduction)
2. [Architecture du Projet](#architecture-du-projet)
3. [Technologies Utilisées](#technologies-utilisées)
4. [Structure des Dossiers](#structure-des-dossiers)
5. [Modules Fonctionnels](#modules-fonctionnels)
6. [API Backend](#api-backend)
7. [Authentification](#authentification)
8. [Rôles et Permissions](#rôles-et-permissions)
9. [Installation et Configuration](#installation-et-configuration)
10. [Guide de Développement](#guide-de-développement)

---

## 1. Introduction

Le **Système de Gestion d'Emploi du Temps (EDT)** est une application web moderne conçue pour gérer les emplois du temps dans les établissements scolaires et universitaires. Elle offre une génération automatique des plannings, un support multi-utilisateurs et une gestion complète des ressources.

### Objectifs principaux
- Gestion centralisée des emplois du temps
- Support multi-rôles (administrateurs, directeurs, enseignants, étudiants)
- Interface responsive et moderne
- Authentification sécurisée avec support 2FA
- Export PDF des emplois du temps

---

## 2. Architecture du Projet

### Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                  │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Pages   │  │Components│  │  Hooks   │  │   API    │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │             │           │
│       └─────────────┴─────────────┴─────────────┘           │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)                │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Routes  │  │Controllers│ │ Services │  │  Models  │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │             │             │             │           │
│       └─────────────┴─────────────┴─────────────┘           │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │ Sequelize ORM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        MySQL Database                        │
└─────────────────────────────────────────────────────────────┘
```

### Flux de Données

1. L'utilisateur interagit avec l'interface React
2. Les composants appellent les hooks personnalisés
3. Les hooks utilisent React Query pour la gestion du cache
4. Les appels API sont effectués via Axios
5. Le backend traite les requêtes et interagit avec la base de données
6. Les réponses sont retournées et mises en cache

---

## 3. Technologies Utilisées

### Frontend
| Technologie | Version | Description |
|-------------|---------|-------------|
| React | 18.3.1 | Bibliothèque UI |
| TypeScript | - | Typage statique |
| Vite | - | Build tool et serveur de développement |
| TailwindCSS | - | Framework CSS utilitaire |
| React Router | 6.30.1 | Routage SPA |
| TanStack Query | 5.83.0 | Gestion d'état serveur |
| Axios | 1.13.2 | Client HTTP |
| Shadcn/UI | - | Composants UI |
| Lucide React | 0.462.0 | Icônes |
| React Hook Form | 7.61.1 | Gestion des formulaires |
| Zod | 3.25.76 | Validation de schémas |
| Sonner | 1.7.4 | Notifications toast |
| date-fns | 3.6.0 | Manipulation de dates |

### Backend (API existante)
| Technologie | Description |
|-------------|-------------|
| Node.js | Runtime JavaScript |
| Express | Framework web |
| MySQL | Base de données relationnelle |
| Sequelize | ORM |
| JWT | Authentification |
| bcrypt | Hachage de mots de passe |

---

## 4. Structure des Dossiers

```
src/
├── api/                    # Services API
│   ├── auth/
│   │   └── api.ts         # Endpoints authentification
│   ├── cours/
│   │   └── api.ts         # Endpoints cours
│   ├── emploi-temps/
│   │   └── api.ts         # Endpoints emploi du temps
│   ├── notifications/
│   │   └── api.ts         # Endpoints notifications
│   ├── salles/
│   │   └── api.ts         # Endpoints salles
│   └── axios_instance.ts  # Configuration Axios
│
├── components/            # Composants React réutilisables
│   ├── layout/
│   │   ├── AppLayout.tsx  # Layout principal avec sidebar
│   │   ├── AppSidebar.tsx # Navigation latérale
│   │   └── PageLayout.tsx # Layout de page
│   ├── ui/                # Composants Shadcn/UI
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ... (60+ composants)
│   ├── NavLink.tsx        # Lien de navigation
│   ├── RoleBasedActions.tsx # Actions selon rôle
│   └── TwoFactorSetup.tsx # Configuration 2FA
│
├── contexts/              # Contextes React
│   └── AuthContext.tsx    # Contexte d'authentification
│
├── hooks/                 # Hooks personnalisés
│   ├── useCours.ts        # Hook pour les cours
│   ├── useEmploiTemps.ts  # Hook pour l'emploi du temps
│   ├── useNotifications.ts # Hook pour les notifications
│   ├── useSalles.ts       # Hook pour les salles
│   ├── use-mobile.tsx     # Détection mobile
│   └── use-toast.ts       # Notifications toast
│
├── pages/                 # Pages de l'application
│   ├── etudiant/
│   │   ├── Cours.tsx      # Liste des cours étudiant
│   │   ├── EmploiTemps.tsx # EDT étudiant
│   │   └── Notifications.tsx # Notifications
│   ├── personnel/
│   │   ├── EmploiTemps.tsx # EDT personnel
│   │   └── Salles.tsx     # Gestion salles
│   ├── Auth.tsx           # Page de connexion
│   ├── Dashboard.tsx      # Tableau de bord
│   ├── Index.tsx          # Page d'accueil
│   └── NotFound.tsx       # Page 404
│
├── Providers/             # Providers React
│   └── RouterProvider/
│       ├── router.tsx     # Configuration routeur
│       └── routes.tsx     # Définition des routes
│
├── types/                 # Types TypeScript
│   ├── api.ts             # Types API génériques
│   ├── auth.ts            # Types authentification
│   ├── cours.ts           # Types cours
│   ├── emploi-temps.ts    # Types emploi du temps
│   └── notifications.ts   # Types notifications
│
├── lib/                   # Utilitaires
│   └── utils.ts           # Fonctions utilitaires
│
├── App.tsx                # Composant racine
├── App.css                # Styles globaux
├── index.css              # Variables CSS et design system
└── main.tsx               # Point d'entrée
```

---

## 5. Modules Fonctionnels

### 5.1 Module Authentification
- Connexion/Déconnexion
- Inscription
- Authentification à deux facteurs (2FA) via QR Code
- Récupération de mot de passe
- Gestion des tokens JWT

### 5.2 Module Emploi du Temps
- Affichage hebdomadaire par grille
- Navigation entre les semaines
- Filtrage par classe/enseignant
- Export PDF
- Vue mobile responsive

### 5.3 Module Cours
- Liste des cours par matière
- Progression des heures
- Statistiques de suivi
- Recherche et filtrage

### 5.4 Module Notifications
- Notifications en temps réel
- Marquage lu/non lu
- Filtrage par type
- Suppression

### 5.5 Module Salles
- Disponibilité des salles
- Filtrage par équipement
- Réservation (selon rôle)

---

## 6. API Backend

### Base URL
```
Development: http://localhost:5000/api
```

### Endpoints Principaux

#### Authentification
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/login` | Connexion |
| POST | `/auth/register` | Inscription |
| POST | `/auth/verify-2fa` | Vérification 2FA |
| GET | `/auth/profile` | Profil utilisateur |
| POST | `/auth/logout` | Déconnexion |

#### Cours
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/cours` | Liste des cours |
| GET | `/cours/:id` | Détails d'un cours |
| GET | `/cours/mes-cours` | Cours de l'utilisateur |
| POST | `/cours` | Créer un cours |
| PUT | `/cours/:id` | Modifier un cours |
| DELETE | `/cours/:id` | Supprimer un cours |

#### Emploi du Temps
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/emplois-temps/me` | EDT personnel |
| GET | `/emplois-temps/classe/:id` | EDT par classe |
| GET | `/emplois-temps/enseignant/:id` | EDT par enseignant |
| POST | `/emplois-temps/seances` | Créer une séance |
| PUT | `/emplois-temps/seances/:id` | Modifier une séance |
| DELETE | `/emplois-temps/seances/:id` | Supprimer une séance |
| GET | `/emplois-temps/export/pdf` | Export PDF |

#### Notifications
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/notifications` | Liste notifications |
| GET | `/notifications/count` | Nombre non lues |
| PUT | `/notifications/:id/read` | Marquer comme lue |
| PUT | `/notifications/read-all` | Tout marquer comme lu |
| DELETE | `/notifications/:id` | Supprimer |

#### Salles
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/salles` | Liste des salles |
| GET | `/salles/:id/disponibilite` | Disponibilité |
| GET | `/salles/disponibles` | Salles disponibles |
| POST | `/salles` | Créer une salle |
| PUT | `/salles/:id` | Modifier une salle |
| DELETE | `/salles/:id` | Supprimer une salle |

### Headers d'authentification
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 7. Authentification

### Flux d'authentification

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────▶│  Login  │────▶│  API    │────▶│   JWT   │
│         │     │  Form   │     │ Verify  │     │  Token  │
└─────────┘     └─────────┘     └─────────┘     └────┬────┘
                                                      │
     ┌────────────────────────────────────────────────┘
     │
     ▼
┌─────────┐     ┌─────────┐     ┌─────────┐
│  2FA    │────▶│ Verify  │────▶│  Access │
│(si actif)│    │  Code   │     │ Granted │
└─────────┘     └─────────┘     └─────────┘
```

### Stockage du token
- Le token JWT est stocké dans `localStorage` sous la clé `auth_token`
- L'intercepteur Axios ajoute automatiquement le header Authorization

### Sécurité 2FA
- Support du QR Code pour configuration rapide
- Clé secrète manuelle disponible
- Codes à 6 chiffres avec expiration

---

## 8. Rôles et Permissions

### Hiérarchie des rôles

| Rôle | Niveau | Description |
|------|--------|-------------|
| `admin` | 1 | Administrateur système |
| `directeur` | 2 | Directeur d'établissement |
| `responsable_pedagogique` | 3 | Responsable pédagogique |
| `enseignant` | 4 | Enseignant |
| `etudiant` | 5 | Étudiant |

### Permissions par rôle

| Fonctionnalité | Admin | Directeur | Resp. Péda. | Enseignant | Étudiant |
|----------------|-------|-----------|-------------|------------|----------|
| Voir son EDT | ✓ | ✓ | ✓ | ✓ | ✓ |
| Modifier EDT | ✓ | ✓ | ✓ | ✗ | ✗ |
| Gérer utilisateurs | ✓ | ✓ | ✗ | ✗ | ✗ |
| Gérer salles | ✓ | ✓ | ✓ | ✗ | ✗ |
| Gérer cours | ✓ | ✓ | ✓ | ✓* | ✗ |
| Statistiques | ✓ | ✓ | ✓ | ✓* | ✗ |
| Admin système | ✓ | ✗ | ✗ | ✗ | ✗ |

*Limité à leurs propres cours

### Composants de contrôle d'accès

```tsx
// Vérification de rôle
import { HasRole, useRoleCheck } from "@/components/RoleBasedActions";

// Affichage conditionnel
<HasRole roles={["admin", "directeur"]}>
  <AdminPanel />
</HasRole>

// Hook pour logique conditionnelle
const { hasRole, hasAnyRole } = useRoleCheck();
if (hasRole("admin")) {
  // Actions admin
}
```

---

## 9. Installation et Configuration

### Prérequis
- Node.js 18+
- npm ou bun
- MySQL 8.0+ (pour le backend)

### Installation Frontend

```bash
# Cloner le repository
git clone <repository-url>
cd projet-edt

# Installer les dépendances
npm install
# ou
bun install

# Démarrer en développement
npm run dev
# ou
bun dev
```

### Variables d'environnement

Créer un fichier `.env` à la racine :

```env
VITE_API_URL=http://localhost:5000/api
```

### Configuration Vite

Le fichier `vite.config.ts` est configuré pour utiliser le port 8080 :

```typescript
export default defineConfig({
  server: {
    port: 8080
  }
});
```

---

## 10. Guide de Développement

### Conventions de code

#### Nommage
- **Composants** : PascalCase (`UserProfile.tsx`)
- **Hooks** : camelCase avec préfixe "use" (`useCours.ts`)
- **Types** : PascalCase (`interface UserData`)
- **Fichiers CSS** : kebab-case (`user-profile.css`)

#### Structure des composants

```tsx
// Imports externes
import { useState } from "react";

// Imports internes
import { Button } from "@/components/ui/button";

// Types
interface Props {
  title: string;
}

// Composant
const MyComponent = ({ title }: Props) => {
  // Hooks
  const [state, setState] = useState("");

  // Handlers
  const handleClick = () => {};

  // Render
  return <div>{title}</div>;
};

export default MyComponent;
```

### Création d'un nouveau module

1. **Types** : Créer les interfaces dans `src/types/`
2. **API** : Créer le service dans `src/api/<module>/api.ts`
3. **Hook** : Créer le hook dans `src/hooks/use<Module>.ts`
4. **Page** : Créer la page dans `src/pages/`
5. **Route** : Ajouter la route dans `src/Providers/RouterProvider/routes.tsx`

### Gestion d'état

- **État local** : `useState` pour les états simples de composant
- **État serveur** : TanStack Query pour les données API
- **État global** : Context API pour l'authentification

### Exemple de hook avec React Query

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/module/api";
import { toast } from "sonner";

export function useModule() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["module"],
    queryFn: api.getAll,
  });

  const createMutation = useMutation({
    mutationFn: api.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["module"] });
      toast.success("Créé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la création");
    },
  });

  return {
    data: data || [],
    isLoading,
    error,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
```

---

## Annexes

### A. Schéma de la Base de Données

Les principales tables :
- `users` - Utilisateurs
- `etablissements` - Établissements
- `classes` - Classes
- `matieres` - Matières
- `enseignants` - Enseignants
- `salles` - Salles
- `cours` - Cours
- `emplois_temps` - Emplois du temps
- `seances` - Séances
- `notifications` - Notifications

### B. Codes d'erreur API

| Code | Description |
|------|-------------|
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Accès refusé |
| 404 | Ressource non trouvée |
| 500 | Erreur serveur |

### C. Ressources

- [Documentation React](https://react.dev)
- [Documentation TanStack Query](https://tanstack.com/query)
- [Documentation Tailwind CSS](https://tailwindcss.com)
- [Documentation Shadcn/UI](https://ui.shadcn.com)

---

*Document généré le 9 décembre 2024*
*Version 1.0*
