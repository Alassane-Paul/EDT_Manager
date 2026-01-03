# RAPPORT TECHNIQUE DE PROJET
# EN VUE DE LA PRÉSENTATION DE FIN DE FORMATION

## THÈME :
**Application Web avancée de Génération et Gestion d'Emplois du Temps avec Système de Facturation et Messagerie Instantanée**

---

**FORMATION :** DÉVELOPPEMENT WEB & WEB MOBILE
**ÉTABLISSEMENT :** Académie Digitale Numérique (ADN)

**Présenté par :** M. ALASSANE Paul
**Superviseur :** M. TOGBA Lazare

**ANNÉE ACADÉMIQUE 2025-2026**

---

# I. RÉSUMÉ DU PROJET

Ce projet consiste en la conception et le développement d'une plateforme SaaS (Software as a Service) de gestion académique. Initialement focalisée sur la gestion des emplois du temps, l'application a évolué pour devenir une solution d'entreprise complète incluant :
- Une gestion multisite (Etablissements) sécurisée.
- Un système de facturation "Pay-as-you-go" intégré.
- Un module d'accréditation pour la délégation de responsabilités.
- Une messagerie instantanée en temps réel pour la communication interne.

# II. ARCHITECTURE ET TECHNOLOGIES

L'application repose sur une architecture moderne **MERN/S** (MySQL au lieu de MongoDB) :

### Frontend
- **React 18 & TypeScript** : Pour une interface robuste et typée.
- **Tailwind CSS & Shadcn/UI** : Pour un design premium, responsive et accessible.
- **TanStack Query (React Query)** : Pour une gestion performante du cache et de l'état serveur.
- **Socket.io-client** : Pour la communication bidirectionnelle en temps réel.
- **Lucide React** : Iconographie moderne.

### Backend
- **Node.js & Express** : Serveur d'API REST performant.
- **Sequelize (ORM)** : Abstraction de la base de données MySQL.
- **Socket.io** : Serveur WebSocket pour la messagerie et les notifications.
- **FedaPay Node SDK** : Intégration de la passerelle de paiement.

### Sécurité
- **JWT (JSON Web Token)** : Authentification Stateless.
- **2FA (Authentification à 2 facteurs)** : Implémentation TOTP pour une sécurité renforcée.
- **Middleware de Scoping** : Isolation stricte des données entre les établissements scolaires.

# III. MODULES D'EXCELLENCE (AVANCÉS)

Outre la gestion classique (Classes, Cours, Salles), le projet se distingue par :

## 1. Module de Facturation Dynamique
Implémentation d'un modèle économique "Pay-as-you-go" :
- **Suivi des métriques** : Facturation basée sur le nombre de classes actives ou d'autres indicateurs d'utilisation.
- **Intégration FedaPay** : Support des paiements Mobile Money (Togo, Bénin, Côte d'Ivoire) et Carte Bancaire.
- **Interface de paiement personnalisée** : Formulaire sécurisé avec prévisualisation interactive de carte bancaire (Luhn algorithm validation).

## 2. Système d'Accréditation
Développement d'un workflow de délégation de pouvoir :
- Permet aux directeurs de déléguer des modules spécifiques (Gestion, Pédagogie) à des collaborateurs.
- Gestion dynamique des permissions dans l'interface et au niveau de l'API.

## 3. Messagerie Instantanée (Chat)
Une alternative interne à WhatsApp pour l'établissement :
- **Temps réel** : Utilisation des WebSockets pour une latence minimale.
- **Indicateurs de lecture** : Suivi des messages lus/non-lus.
- **Répertoire intelligent** : Liste de contacts filtrée automatiquement par établissement et par rôle.

## 4. Design et Expérience Utilisateur (UX/UI)
L'application ne se limite pas aux fonctionnalités ; elle offre une expérience "Premium" :
- **Esthétique Moderne** : Utilisation de dégradés subtils, de glassmorphism et d'une palette de couleurs harmonieuse (HSL).
- **Interactivité** : Micro-animations au survol, transitions fluides entre les pages et retours visuels instantanés (Toasts).
- **Dark Mode Native** : Support complet du mode sombre pour un confort visuel accru.

# IV. BILAN ET PERSPECTIVES

### Bilan Technique
Le projet a permis de maîtriser des concepts avancés :
- Gestion de la concurrence et du temps réel (WebSockets).
- Intégration de services tiers financiers (FinTech).
- Modélisation de base de données relationnelle complexe (30+ tables).

### Perspectives
- **Intelligence Artificielle** : Intégration d'un moteur d'optimisation heuristique pour résoudre les conflits d'emplois du temps automatiquement.
- **Application Mobile** : Portabilité totale via React Native ou Flutter Fusion.

---

# CONCLUSION

Cette plateforme représente une solution complète et industrialisable pour la modernisation des établissements scolaires en Afrique de l'Ouest. Elle allie rigueur académique et outils de gestion d'entreprise modernes.

---
**© 2026 - Rapport généré pour la soutenance ADN.**
