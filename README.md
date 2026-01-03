# 🎓 TimeTable Evolution

**TimeTable Evolution** est une plateforme SaaS (Software as a Service) de pointe conçue pour moderniser la gestion administrative et pédagogique des établissements scolaires et universitaires. Plus qu'un simple générateur d'emplois du temps, c'est un écosystème complet intégrant facturation, communication en temps réel et gestion de la main-d'œuvre.

---

## 🚀 Fonctionnalités Clés

### 📅 Gestion des Emplois du Temps
- **Génération Intelligente** : Planification automatisée respectant les contraintes de salles, d'enseignants et de classes.
- **Vues Contextuelles** : Calendriers personnalisés pour les étudiants et les enseignants.
- **Gestion des Rattrapages** : Workflow complet pour planifier et notifier les cours de remplacement.

### 💰 Système de Facturation (Pay-as-you-go)
- **Modèle Économique Flexible** : Facturation basée sur l'utilisation réelle (nombre de classes actives).
- **Passerelle FedaPay** : Intégration native des paiements Mobile Money (Togo, Bénin, Côte d'Ivoire) et Cartes Bancaires.
- **Tableau de Bord Financier** : Suivi des factures, états de paiement et métriques d'utilisation.

### 💬 Messagerie Instantanée (ADN Chat)
- **Communication en Temps Réel** : Système de chat interne basé sur les WebSockets (Socket.io).
- **Répertoire Intelligent** : Accès simplifié aux contacts de l'établissement filtré par rôle.
- **Notifications Push** : Alertes instantanées pour les nouveaux messages et changements d'emploi du temps.

### 🔐 Sécurité & Accréditation
- **Authentification forte** : Support de l'authentification à deux facteurs (**2FA via TOTP**).
- **Délégation de Pouvoir** : Module d'accréditation permettant aux directeurs de déléguer des accès spécifiques à leurs collaborateurs.
- **Scoping Strict** : Isolation totale des données entre les différents établissements sur la plateforme.

---

## 🛠 Stack Technique

### Frontend
- **React 18** & **TypeScript**
- **Tailwind CSS** & **Shadcn/UI** (Design System Premium)
- **TanStack Query** (Gestion d'état serveur)
- **Socket.io-client** (Temps réel)

### Backend
- **Node.js** & **Express**
- **Sequelize ORM** (MySQL)
- **Socket.io** (WebSockets)
- **FedaPay SDK** (FinTech)

---

## 📦 Installation & Configuration

### Prérequis
- Node.js (v16+)
- MySQL
- Compte FedaPay (pour les paiements)

### Installation du Backend
1. Naviguez dans le dossier `backend/`
2. Installez les dépendances : `npm install`
3. Configurez le fichier `.env` avec vos accès base de données et clés API FedaPay.
4. Lancez le serveur : `npm start`

### Installation du Frontend
1. À la racine du projet, installez les dépendances : `npm install`
2. Lancez le serveur de développement : `npm run dev`

---

## 🎨 Design & UX
L'application propose une interface **"High-End"** avec :
- **Glassmorphism** et effets de profondeur.
- **Dark Mode** natif.
- **Micro-animations** fluides pour une expérience utilisateur premium.
- **Validation Interactive** des formulaires (ex: prévisualisation 3D des cartes bancaires).

---

## 👨‍💻 Développeur
**Alassane Paul**  
*Projet de fin de formation - Académie Digitale Numérique (ADN)*

---
© 2026 TimeTable Evolution. Tous droits réservés.
