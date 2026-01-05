# Deep Dive Technique : Maîtrise Totale du Projet

Ce document détaille les concepts avancés de votre application pour vous permettre de répondre avec précision à n'importe quelle question technique du jury.

---

## 1. Architecture Frontend (Le "V" du MVC)

### React 18 & TypeScript
*   **Pourquoi TypeScript ?** Il apporte le "développement orienté contrat". Chaque objet (User, Message, Cours) a une forme définie. Cela réduit les bugs de type "undefined is not a function" de 80%.
*   **React hooks :** Utilisation intensive de `useEffect`, `useState`, et de hooks personnalisés (`useAuth`, `useSocket`) pour séparer la logique métier du rendu visuel.

### TanStack Query (React Query)
*   **Rôle :** C'est le gestionnaire d'état serveur. 
*   **Avantage :** Il gère automatiquement la mise en cache, les tentatives de reconnexion et le rafraîchissement des données en arrière-plan. Cela évite de re-télécharger les données à chaque changement de page.

### Shadcn/UI & Tailwind
*   **Shadcn :** Ce n'est pas une bibliothèque de composants classiques (qu'on installe), mais une collection de composants accessibles (Radix UI) que l'on "possède" dans son code. Cela permet une personnalisation totale sans les limites d'un framework rigide.

---

## 2. Architecture Backend (L'API REST & Temps Réel)

### Node.js & Express
*   **Node.js :** Utilise un moteur d'exécution asynchrone non-bloquant (Event Loop). Idéal pour les applications avec beaucoup d'entrées/sorties comme une messagerie ou une gestion de fichiers.
*   **Express :** Framework minimaliste qui gère les routes et les middlewares (logiciels intermédiaires).

### Sequelize (ORM)
*   **Définition :** Object-Relational Mapper. 
*   **Fonctionnement :** Il transforme les lignes de vos tables MySQL en objets JavaScript simples.
*   **Migrations :** Permettent de versionner la structure de la base de données (comme Git versionne le code). On peut revenir en arrière ou appliquer des changements sans perdre de données.

---

## 3. Communication Temps Réel (WebSockets)

### Socket.io
*   **HTTP vs WebSockets :** 
    *   **HTTP** : Le client demande, le serveur répond, puis la connexion se ferme.
    *   **WebSocket** : La connexion reste ouverte 24h/24. Le serveur peut envoyer des données au client sans que celui-ci ne demande rien.
*   **Usage dans le projet :**
    *   **Messagerie** : Réception instantanée des messages.
    *   **Notifications** : Alertes push immédiates pour les absences ou publications d'emplois du temps.
    *   **Rooms** : Système de "chambres" virtuelles (ex: `user_123`) pour n'envoyer un message qu'à une seule personne ciblée.

---

## 4. Sécurité Avancée

### JWT (JSON Web Token)
*   **Structure :** Header (algorithme), Payload (données utilisateur), Signature (clé secrète).
*   **Stateless :** Le serveur n'a pas besoin de base de données de sessions. Tout ce qu'il a besoin de savoir est écrit dans le token signé. C'est rapide et scalable.

### 2FA (TOTP)
*   **Concept :** Time-based One-Time Password (RFC 6238).
*   **Fonctionnement :** Le serveur et le téléphone partagent une clé secrète. Ils utilisent l'heure actuelle pour calculer le même code à 6 chiffres. Si les codes correspondent, l'accès est autorisé.

### Multi-tenancy (Scoping)
*   **Hiérarchie :** Un SuperAdmin gère des Établissements. Chaque établissement possède ses propres Classes, Élèves et Professeurs.
*   **Isolation :** Un middleware intercepte chaque requête et vérifie : `L'utilisateur X a-t-il le droit d'accéder à la ressource Y qui appartient à l'établissement Z ?`.

---

## 5. Intégration Financière (SaaS)

### FedaPay Integration
*   **Passerelle :** Utilisation du SDK officiel pour sécuriser les transactions.
*   **Workflow :** 
    1. L'utilisateur lance un paiement.
    2. Le serveur crée une "Transaction" FedaPay.
    3. L'utilisateur paie via son moyen local (Mobile Money).
    4. FedaPay notifie votre serveur via un **Webhook** (automatique) pour confirmer que l'argent est reçu.
*   **Modèle Pay-as-you-go :** Le serveur compte les classes actives chaque mois et génère une facture dynamique.

---

## 6. Base de Données Relationnelle

### Schéma MySQL
*   **Normalisation :** Les données sont divisées en tables distinctes pour éviter la redondance.
*   **Relations :** 
    *   **1:N** : Un établissement a plusieurs enseignants.
    *   **N:M** : Une classe a plusieurs matières, et une matière peut être enseignée dans plusieurs classes (via une table de jointure `repartitions`).

---

## MEYER de la Fin (Mots Clés à placer)
- **"Single Page Application (SPA)"** : Pour décrire React.
- **"Separation of Concerns"** : Pour expliquer pourquoi le code est divisé en composants et services.
- **"Scalability"** (Scalabilité) : Pourquoi l'architecture peut supporter 10 000 utilisateurs.
- **"UX Premium"** : Pour justifier le choix du Dark Mode et des animations.
