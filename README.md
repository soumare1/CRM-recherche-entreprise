# ProspecTech - CRM de Prospection B2B & Détection Web

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Zustand](https://img.shields.io/badge/State-Zustand-764ABC?style=for-the-badge&logo=redux&logoColor=white)
![Licence](https://img.shields.io/badge/Licence-MIT-green?style=for-the-badge)

ProspecTech est une application web commerciale B2B conue pour les agences web, indépendants et commerciaux. Elle permet d'auditer le web local, de détecter en temps réel les entreprises sans site internet, de piloter un pipeline commercial Kanban et d'automatiser les relances clients.

---

## Fonctionnalités Principales

### 1. Moteur de Prospection Géographique & Audit Web
- **Autocomplétion intelligente** : Recherche instantanée par ville ou code postal (intégration API Géo Data.gouv).
- **Détection automatique via OpenStreetMap (Overpass API)** : Extraction des établissements locaux (restaurants, artisans, professions libérales) dans le secteur géographique visé.
- **Audit automatique de la présence web** : Qualification immédiate des prospects en identifiant les commerces sans site internet (opportunités prioritaires) vs avec site.

### 2. Pipeline Commercial Kanban & Suivi des Ventes
- **Vue Kanban interactive** : Suivi fluide par colonnes d'avancement (À contacter, Décroché, RDV pris, Devis envoyé, Négoce, Signé, etc.).
- **Cartes prospect enrichies** : Niveaux de priorité (Normale, Haute, Urgente), indicateurs visuels de relance et score d'intérêt.
- **Vue Liste & Métriques intégrées** : Basculement instantané vers un tableau synthétique avec statistiques de conversion par étape.

### 3. Agenda Intelligente & Gestion des RDV
- **Calendrier mensuel complet** : Navigation fluide sur plusieurs mois avec affichage des jours du mois et détection des événements.
- **Prise de RDV rapide** : Formulaire de planification de rendez-vous avec association automatique au prospect.
- **Fil chronologique des rendez-vous** : Liste organisée par ordre chronologique en bas de page pour le suivi quotidien.

### 4. Centre de Relances & Notifications Automatiques
- **Relances prioritaires** : Calcul automatique des rappels à effectuer selon la date d'action définie et l'historique des appels.
- **Compte-rendu d'appel express** : Modale d'enregistrement d'appel (Injoignable, RDV pris, À rappeler, Devis demandé) avec mise à jour instantanée du pipeline.
- **Centre de notification global** : Badge dynamique et menu déroulant signalant les actions en retard et à venir.

### 5. Tableau de Bord & Analytics en Temps Réel
- **KPIs commerciaux** : Taux de conversion, volume de prospects qualifiés, valeur estimée du pipeline et nombre de RDV fixés.
- **Graphiques interactifs (Recharts)** : Visualisation de l'évolution des prospects par statut et par campagne.

### 6. Système de Thème Dynamique (Dark & Light Mode)
- **Design System adaptable** : Mode sombre moderne avec effets de glassmorphism et Mode clair épuré haute lisibilité.
- **Surcharges CSS intelligentes** : Harmonisation automatique des couleurs des badges, cartes et textes selon le thème choisi dans les paramètres.

---

## Architecture Technique & Choix de Conception

Le projet est conçu selon les principes de la Clean Architecture et de la séparation des responsabilités :

```
prospect-crm/
├── src/
│   ├── components/         # Composants UI réutilisables & modulaires
│   │   ├── appels/         # Modales de compte-rendu d'appels
│   │   ├── common/         # Composants communs (Modales, Selects, Confirmations)
│   │   ├── layout/         # Header, Sidebar, Command Palette, Notification Dropdown
│   │   ├── pipeline/       # Kanban Board, Columns, Cards, List & Metrics Views
│   │   ├── prospects/      # Tableaux de prospects, Formulaires, Fiche détaillée
│   │   └── rdv/            # Prise et gestion des rendez-vous
│   ├── context/            # Fournisseurs de contexte (AuthContext pour Supabase)
│   ├── hooks/              # Custom Hooks React (useTheme, useStatsProspects)
│   ├── lib/                # Client Supabase, constantes métier, helpers & mock data
│   ├── pages/              # Vues principales de l'application (Dashboard, Agenda, Relances...)
│   ├── services/           # Couche de services API (Prospects, Campagnes, OpenStreetMap)
│   └── stores/             # Stores Zustand (prospectStore, uiStore, notificationStore...)
├── supabase/               # Migrations SQL PostgreSQL & Seed Data
└── scripts/                # Scripts d'automatisation & utilitaires
```

### Choix technologiques

- **React 19 + Vite** : Démarrage instantané, Hot Module Replacement (HMR) ultra-rapide et utilisation des derniers patterns React.
- **Zustand** : Gestion d'état global légère et performante, sans le boilerplate ni la complexité inutile de Redux.
- **Services Layer Abstraction** : Découplage complet entre l'interface utilisateur et la source de données (Supabase). Si le backend est indisponible, l'application bascule de manière transparente sur les stores locaux.
- **TailwindCSS v4 + Custom Overrides** : Flexibilité maximale du styling utilitaire combinée à un système de variables CSS pour gérer dynamiquement le dark/light mode.

---

## Stack Technique Exhaustive

| Domaine | Technologies Utilisées |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite, React Router v7 |
| **Gestion d'État** | Zustand (Store Prospects, UI, Notifications, Paramètres) |
| **Styling & Design** | TailwindCSS v4, CSS Custom Properties, Lucide Icons |
| **Backend & Base de données** | Supabase (PostgreSQL, Auth Provider, Row Level Security) |
| **Data Viz & Interactive** | Recharts, Dnd Kit (Drag & Drop), Canvas Confetti |
| **APIs Externes** | API Découpage Administratif (Data.gouv), Overpass OpenStreetMap API |
| **Import / Export** | XLSX (parsing et génération de fichiers Excel/CSV) |
| **Qualité & Tooling** | Oxlint, Node.js |

---

## Guide de Démarrage Rapide

### Prérequis
- Node.js (version 18+ recommandée)
- npm ou yarn

### 1. Clonage du dépôt
```bash
git clone https://github.com/soumare1/CRM-recherche-entreprise.git
cd CRM-recherche-entreprise
```

### 2. Installation des dépendances
```bash
npm install
```

### 3. Variables d'environnement
Créez un fichier `.env.local` à la racine du projet en vous basant sur `.env.local.example` :
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

### 4. Lancement du serveur de développement
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:5173`.

---

## Points Forts du Projet

1. **Maîtrise de l'écosystème Frontend moderne** : Utilisation avancée des Custom Hooks, du Router v7, des formulaires contrôlés et de Zustand pour la gestion d'état.
2. **Intégration d'APIs tierces complexes** : Analyse et traitement de requêtes spatiales avec l'API Overpass OpenStreetMap et autocomplétion géographique en temps réel.
3. **Architecture propre et maintenable** : Couche de services isolée, composabilité des composants React et gestion propre des erreurs UI/UX.
4. **Attention portée à l'UX / UI** : Thème dynamique Dark/Light sans clignotement, feedback visuel immédiat et ergonomie fluide.
5. **Compréhension du besoin métier B2B** : Conception orientée résultat pour optimiser le travail quotidien d'une équipe commerciale.

---

## Licence

Ce projet est sous licence MIT.
