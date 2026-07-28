// ── Pipeline stages ────────────────────────────────────────────────────────
export const PIPELINE_STAGES = [
  { id: 'a_contacter', label: 'À contacter', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  { id: 'pas_decroche', label: 'Pas décroché (à rappeler)', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { id: 'a_rappeler', label: 'Décroché (à rappeler plus tard)', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { id: 'rdv_pris', label: 'RDV pris', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 'devis_envoye', label: 'Devis envoyé', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 'negoce', label: 'Négoce', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  { id: 'signe', label: 'Signé', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { id: 'pas_interesse', label: 'Pas intéressé / Perdu', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
];

// ── Priorités ──────────────────────────────────────────────────────────────
export const PRIORITIES = [
  { value: 0, label: 'Normale', icon: 'Minus', color: 'text-slate-400' },
  { value: 1, label: 'Haute', icon: 'ChevronUp', color: 'text-amber-400' },
  { value: 2, label: 'Urgente', icon: 'ChevronsUp', color: 'text-red-400' }
];

// ── Résultats d'appel ──────────────────────────────────────────────────────
export const APPEL_RESULTATS = [
  { id: 'rappeler', label: 'À rappeler' },
  { id: 'interesse', label: 'Intéressé' },
  { id: 'pas_interesse', label: 'Pas intéressé' },
  { id: 'rdv_pris', label: 'RDV pris' },
  { id: 'injoignable', label: 'Injoignable' },
  { id: 'faux_numero', label: 'Faux numéro' },
  { id: 'autre', label: 'Autre' }
];

// ── Statuts de présence web ────────────────────────────────────────────────
export const STATUTS_WEB = [
  { id: 'aucun_site', label: 'Aucun site web', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  { id: 'site_obsolete', label: 'Site obsolète', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  { id: 'site_ok', label: 'Site présent', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
];

// ── Secteurs d'activité (liste de base pour filtres et sélecteurs) ─────────
// Les icônes sont des strings (noms Lucide) pour éviter les imports circulaires.
// RecherchePage résout les composants icône au moment du rendu.
export const SECTEURS = [
  { id: 'restauration',          label: 'Restauration',             icon: 'Utensils' },
  { id: 'coiffure_beaute',       label: 'Coiffure & Beauté',        icon: 'Scissors' },
  { id: 'commerce_alimentaire',  label: 'Commerce alimentaire',     icon: 'ShoppingBag' },
  { id: 'artisanat_services',    label: 'Artisanat & Services',     icon: 'Wrench' },
  { id: 'automobile',            label: 'Automobile',               icon: 'Car' },
  { id: 'boutique_mode',         label: 'Boutique & Mode',          icon: 'Store' },
  { id: 'grossistes',            label: 'Grossistes',               icon: 'Warehouse' },
  { id: 'manufactures_ateliers', label: 'Manufactures & Ateliers',  icon: 'Factory' },
  { id: 'gestion_stock',         label: 'Gestion de Stock',         icon: 'PackageSearch' },
  { id: 'autre',                 label: 'Autre',                    icon: 'Building2' },
];

// ── Données enrichies par secteur (solutions, accroches, tarifs) ───────────
export const SECTEUR_DATA = {
  restauration: {
    sousCategories: ['Restaurant traditionnel', 'Restauration rapide', 'Snack / Kebab', 'Brasserie / Café', 'Pizzeria', 'Cuisine asiatique', 'Traiteur'],
    solutions: [
      'Site vitrine avec menu en ligne',
      'Système de réservation en ligne',
      'Application de commande click & collect',
      'Fidélité numérique (QR code)',
      'Dashboard statistiques restaurateur',
    ],
    accroches: [
      'Vous perdez des réservations faute de disponibilités en ligne ?',
      'Vos clients cherchent votre menu sur Google et ne trouvent rien ?',
      'Votre concurrent en face a une app — pas vous ?',
    ],
    tarifs: [
      { solution: 'Site vitrine + menu', min: 800, max: 2000, modele: 'Forfait' },
      { solution: 'Réservation en ligne', min: 1500, max: 3500, modele: 'Forfait + SaaS 30-60€/mois' },
      { solution: 'Click & collect app', min: 2500, max: 5000, modele: 'Forfait + abo mensuel' },
    ],
  },

  coiffure_beaute: {
    sousCategories: ['Salon de coiffure', 'Institut de beauté', 'Onglerie', 'Barbershop', 'Spa / Bien-être'],
    solutions: [
      'Prise de RDV en ligne (agenda digital)',
      'Site vitrine avec galerie avant/après',
      'Rappels automatiques par SMS',
      'Programme fidélité numérique',
    ],
    accroches: [
      'Vos clients appellent encore pour prendre RDV ?',
      'Vous avez des no-shows sans rappel automatique ?',
      'Votre agenda est encore sur papier ?',
    ],
    tarifs: [
      { solution: 'Prise de RDV en ligne', min: 1000, max: 2500, modele: 'Forfait + SaaS 20-40€/mois' },
      { solution: 'Site vitrine', min: 800, max: 1800, modele: 'Forfait' },
    ],
  },

  commerce_alimentaire: {
    sousCategories: ['Épicerie', 'Boulangerie-Pâtisserie', 'Fromagerie', 'Traiteur', 'Cave à vins', 'Bio/Épicerie fine'],
    solutions: [
      'Site vitrine avec horaires et produits phares',
      'Commande en ligne click & collect',
      'Programme fidélité numérique',
      'Newsletter & promotions digitales',
    ],
    accroches: [
      'Votre boulangerie est introuvable sur Google ?',
      'Vos clients pourraient commander en ligne la veille ?',
      'Fidélisez vos habitués avec un programme points digital ?',
    ],
    tarifs: [
      { solution: 'Site vitrine', min: 700, max: 1500, modele: 'Forfait' },
      { solution: 'Click & collect', min: 2000, max: 4000, modele: 'Forfait + abo' },
    ],
  },

  artisanat_services: {
    sousCategories: ['Plomberie', 'Électricité', 'Menuiserie', 'Peinture/Bâtiment', 'Serrurerie', 'Nettoyage', 'Cordonnerie'],
    solutions: [
      'Site vitrine avec demande de devis en ligne',
      'Application de suivi de chantier client',
      'Agenda et gestion d\'interventions',
      'Galerie de réalisations',
    ],
    accroches: [
      'Vos clients ne trouvent pas vos coordonnées en ligne ?',
      'Vous perdez des devis car pas de suivi digital ?',
      'Vos photos de réalisations ne sont pas en ligne ?',
    ],
    tarifs: [
      { solution: 'Site vitrine + devis', min: 900, max: 2000, modele: 'Forfait' },
      { solution: 'App suivi chantier', min: 2000, max: 5000, modele: 'Forfait' },
    ],
  },

  automobile: {
    sousCategories: ['Garage / Mécanique', 'Carrosserie', 'Vente de véhicules', 'Contrôle technique', 'Lavage auto', 'Pièces détachées'],
    solutions: [
      'Site vitrine avec prise de RDV entretien',
      'Suivi de l\'état du véhicule client (SMS / app)',
      'Catalogue de véhicules en ligne',
      'Gestion des devis de réparation',
    ],
    accroches: [
      'Vos clients rappellent pour savoir si leur voiture est prête ?',
      'Vous perdez des clients faute de rappel d\'entretien automatique ?',
      'Votre catalogue de véhicules n\'est pas en ligne ?',
    ],
    tarifs: [
      { solution: 'Site + prise de RDV', min: 1200, max: 3000, modele: 'Forfait' },
      { solution: 'Suivi client véhicule', min: 2500, max: 5000, modele: 'Forfait + SaaS' },
    ],
  },

  boutique_mode: {
    sousCategories: ['Prêt-à-porter', 'Friperie / Vintage', 'Chaussures', 'Accessoires', 'Lingerie', 'Sportswear'],
    solutions: [
      'Boutique e-commerce complète',
      'Site vitrine avec catalogue',
      'Gestion des stocks en ligne',
      'Programme fidélité et newsletter',
    ],
    accroches: [
      'Vos collections ne sont pas visibles en dehors du magasin ?',
      'Vos clients veulent commander depuis chez eux ?',
      'Votre concurrent vend déjà en ligne — pas vous ?',
    ],
    tarifs: [
      { solution: 'E-commerce simple', min: 2000, max: 5000, modele: 'Forfait + hébergement' },
      { solution: 'E-commerce avancé', min: 5000, max: 12000, modele: 'Forfait + abo' },
    ],
  },

  // ── NOUVEAU : Grossistes ──────────────────────────────────────────────────
  grossistes: {
    sousCategories: [
      'Alimentaire',
      'Boissons',
      'BTP / Matériaux',
      'Fournitures industrielles',
      'Textile',
      'Hygiène / Entretien',
      'Pièces détachées auto',
    ],
    solutions: [
      'App de commande B2B (catalogue + stock temps réel + panier + tarifs par client)',
      'Dashboard gestion de stock (entrées/sorties, alertes seuil, inventaire)',
      'Portail client grossiste (factures, BL, suivi commandes, relevé de compte)',
      'App mobile commercial terrain (offline-first, catalogue, prise de commande en tournée)',
      'Module facturation & relance automatique',
    ],
    accroches: [
      'Vos clients commandent encore par téléphone ?',
      'Vous gérez votre stock sur Excel ?',
      'Vos commerciaux terrain reviennent avec des bons papier ?',
    ],
    tarifs: [
      { solution: 'App commande B2B grossiste', min: 5000, max: 10000, modele: 'Forfait + abo mensuel' },
      { solution: 'Dashboard gestion de stock', min: 3000, max: 7000, modele: 'Forfait + maintenance' },
      { solution: 'Portail client grossiste', min: 3000, max: 7000, modele: 'Forfait + maintenance' },
      { solution: 'App mobile terrain (offline)', min: 4000, max: 8000, modele: 'Forfait' },
      { solution: 'Module facturation & relance', min: 1500, max: 4000, modele: 'Par module' },
    ],
  },

  // ── NOUVEAU : Manufactures & Ateliers de Production ──────────────────────
  manufactures_ateliers: {
    sousCategories: [
      'Agroalimentaire',
      'Menuiserie / Bois',
      'Métallurgie',
      'Textile / Confection',
      'Cosmétiques',
      'Packaging',
      'Sous-traitance industrielle',
    ],
    solutions: [
      'App suivi de production (ordres de fab, avancement temps réel, taux de rebut)',
      'Gestion stock matières premières (consommation par OF, traçabilité lots, alertes réappro)',
      'Planning atelier digital (affectation machines/opérateurs, vue Gantt, charge/capacité)',
      'Module traçabilité/qualité (suivi lot, fiches contrôle, historique non-conformités)',
      'Dashboard direction (KPIs : TRS, OTD, taux rebut, coûts)',
      'App opérateur tablette (scan code-barres, saisie au poste, signalement défaut)',
    ],
    accroches: [
      'Votre suivi de prod est encore sur papier ?',
      'Un contrôle qualité arrive — vous sortez la traçabilité d\'un lot en 2 min ?',
      'Vos opérateurs remplissent des fiches papier ?',
    ],
    tarifs: [
      { solution: 'Suivi de production / MES léger', min: 8000, max: 15000, modele: 'Forfait + licence mensuelle' },
      { solution: 'Gestion stock matières premières', min: 6000, max: 12000, modele: 'Forfait + SaaS 50-150€/mois' },
      { solution: 'Planning atelier digital', min: 5000, max: 10000, modele: 'Forfait + maintenance' },
      { solution: 'Module traçabilité/qualité', min: 3000, max: 7000, modele: 'Forfait + maintenance' },
      { solution: 'Dashboard direction KPIs', min: 3000, max: 7000, modele: 'Forfait + maintenance' },
      { solution: 'App opérateur tablette', min: 4000, max: 8000, modele: 'Forfait' },
    ],
  },

  // ── NOUVEAU : Gestion de Stock (transversal) ──────────────────────────────
  gestion_stock: {
    sousCategories: [
      'E-commerçants avec entrepôt',
      'Loueurs de matériel (BTP, événementiel)',
      'Pièces auto',
      'Quincailleries',
      'Caves à vin',
      'Multi-points de vente',
      'Pharmacies / Parapharmacies',
    ],
    solutions: [
      'App gestion de stock (multi-dépôt, scan QR/code-barres, alertes seuil, inventaire assisté)',
      'App inventaire mobile (scan & comptage smartphone, écarts auto, export PDF)',
      'Dashboard stock multi-site (vue consolidée, transferts inter-sites)',
      'Module prévisionnel (analyse ventes → suggestions réappro, saisonnalité, stock dormant)',
      'Intégration e-commerce (synchro stock ↔ Shopify/WooCommerce/Prestashop)',
      'App location/prêt matériel (réservation, suivi sortie/retour, facturation auto)',
    ],
    accroches: [
      'Vous faites encore vos inventaires à la main ?',
      'Combien de ventes perdues à cause d\'un stock inconnu ?',
      '3 dépôts mais pas de vue globale ?',
    ],
    tarifs: [
      { solution: 'App gestion de stock simple', min: 3000, max: 6000, modele: 'Forfait + hébergement' },
      { solution: 'App stock multi-site/avancé', min: 6000, max: 12000, modele: 'Forfait + SaaS 50-150€/mois' },
      { solution: 'App inventaire mobile', min: 2000, max: 5000, modele: 'Forfait' },
      { solution: 'Module prévisionnel', min: 3000, max: 6000, modele: 'Forfait + maintenance' },
      { solution: 'Intégration e-commerce', min: 2000, max: 5000, modele: 'Forfait + maintenance' },
      { solution: 'App location/prêt matériel', min: 4000, max: 8000, modele: 'Forfait' },
    ],
  },

  autre: {
    sousCategories: ['Librairie / Papeterie', 'Bureau Tabac PMU', 'Fleuriste', 'Pharmacie', 'Agence immobilière', 'Autre'],
    solutions: [
      'Site vitrine professionnel',
      'Application sur mesure selon besoin',
    ],
    accroches: [
      'Votre activité mérite une présence digitale professionnelle.',
      'Digitalisez votre gestion pour gagner du temps.',
    ],
    tarifs: [
      { solution: 'Site vitrine', min: 800, max: 2000, modele: 'Forfait' },
      { solution: 'Application sur mesure', min: 3000, max: 15000, modele: 'Selon complexité' },
    ],
  },
};
