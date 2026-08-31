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

// ── Catalogue officiel AppForge ───────────────────────────────────────────
// Source : brochure commerciale buzz SAS / AppForge
export const APPFORGE_OFFRES = [
  {
    id: 'logiciel_sur_mesure',
    label: 'Logiciel sur-mesure',
    badge: 'PRIORITÉ',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    icon: 'Monitor',
    description: 'CRM, planning, gestion de production, gestion de stock, suivi client, tableaux de bord… On développe le logiciel dont l\'entreprise a besoin, exactement comme elle en a besoin.',
    pourQui: 'Toute PME qui bosse encore sur Excel, papier, ou avec un logiciel qui ne fait pas ce qu\'elle veut. Grossistes, ateliers, restos, artisans, e-commerçants, services…',
    tarifs: [
      { label: 'Licence de départ', detail: 'Selon complexité', min: 1400, max: 4000, unite: '€', suffix: '+' },
      { label: 'Abonnement mensuel', detail: 'Maintenance + hébergement', price: 65, unite: '€/mois' },
    ],
    color: 'violet',
  },
  {
    id: 'site_internet',
    label: 'Site internet',
    badge: null,
    badgeColor: null,
    icon: 'Globe',
    description: 'Vitrine simple, sites multi-pages, sites complexes avec espace client. Pour les restos on peut aussi installer des QR codes en salle avec un backoffice où ils mettent à jour leur carte eux-mêmes.',
    pourQui: 'Toute entreprise sans site, ou avec un site vieux qui ne ramène rien. Restos, artisans, commerces, indépendants.',
    tarifs: [
      { label: 'Site simple', detail: 'Vitrine 1-3 pages', min: 400, max: 600, unite: '€' },
      { label: 'Multi-pages', detail: '4+ pages, galerie, formulaires', min: 800, max: 1000, unite: '€' },
      { label: 'Complexe', detail: 'Espace client, e-commerce…', min: 1400, max: null, unite: '€', suffix: '+' },
      { label: 'Resto + QR + backoffice', detail: 'Carte digitale mise à jour par le client', min: 900, max: null, unite: '€', suffix: '+' },
    ],
    color: 'blue',
  },
  {
    id: 'application_mobile',
    label: 'Application mobile',
    badge: null,
    badgeColor: null,
    icon: 'Smartphone',
    description: 'Application iOS + Android, pour les clients de l\'entreprise (app de commande, réservation, fidélité…) ou pour un usage interne (équipes terrain, livreurs, techniciens).',
    pourQui: 'Commerces avec une clientèle fidèle, entreprises avec des équipes qui bougent sur le terrain, boîtes qui veulent leur propre app.',
    tarifs: [
      { label: 'Application mobile', detail: 'Selon les fonctionnalités — à valider avec Kandioura', min: 1200, max: 4000, unite: '€', suffix: '+' },
    ],
    color: 'emerald',
  },
];

// Helper : retourne la ou les offres recommandées pour un secteur donné
export function getOffresForSecteur(secteurId) {
  const map = {
    restauration:          ['site_internet', 'application_mobile'],
    coiffure_beaute:       ['site_internet', 'logiciel_sur_mesure'],
    commerce_alimentaire:  ['site_internet', 'application_mobile'],
    artisanat_services:    ['site_internet', 'logiciel_sur_mesure'],
    automobile:            ['site_internet', 'logiciel_sur_mesure'],
    boutique_mode:         ['site_internet', 'application_mobile'],
    grossistes:            ['logiciel_sur_mesure'],
    manufactures_ateliers: ['logiciel_sur_mesure'],
    gestion_stock:         ['logiciel_sur_mesure'],
    autre:                 ['site_internet'],
  };
  const ids = map[secteurId] || ['site_internet'];
  return APPFORGE_OFFRES.filter(o => ids.includes(o.id));
}

// ── Données enrichies par secteur (solutions, accroches, tarifs) ───────────
export const SECTEUR_DATA = {
  restauration: {
    sousCategories: ['Restaurant traditionnel', 'Restauration rapide', 'Snack / Kebab', 'Brasserie / Café', 'Pizzeria', 'Cuisine asiatique', 'Traiteur'],
    solutions: [
      'Site vitrine + menu en ligne + QR code en salle',
      'Backoffice pour mettre la carte à jour soi-même',
      'Application de commande click & collect (iOS + Android)',
      'Fidélité numérique',
    ],
    accroches: [
      'Vos clients cherchent votre menu sur Google et ne trouvent rien ?',
      'Votre concurrent en face a une app — pas vous ?',
      'Votre carte papier est déjà obsolète dès qu\'elle sort de l\'imprimeur ?',
    ],
    tarifs: [
      { solution: 'Site vitrine simple', min: 400, max: 600, modele: 'Offre Site internet' },
      { solution: 'Site + QR + backoffice carte', min: 900, max: 900, modele: 'Offre Site internet — Resto' },
      { solution: 'Site multi-pages', min: 800, max: 1000, modele: 'Offre Site internet' },
      { solution: 'App commande / fidélité (iOS + Android)', min: 1200, max: 4000, modele: 'Offre Application mobile' },
    ],
  },

  coiffure_beaute: {
    sousCategories: ['Salon de coiffure', 'Institut de beauté', 'Onglerie', 'Barbershop', 'Spa / Bien-être'],
    solutions: [
      'Site vitrine avec galerie avant/après',
      'Logiciel de prise de RDV sur-mesure (agenda, rappels SMS, statistiques)',
      'Programme fidélité numérique',
    ],
    accroches: [
      'Vos clients appellent encore pour prendre RDV ?',
      'Vous avez des no-shows sans rappel automatique ?',
      'Votre agenda est encore sur papier ?',
    ],
    tarifs: [
      { solution: 'Site vitrine simple', min: 400, max: 600, modele: 'Offre Site internet' },
      { solution: 'Site multi-pages + galerie', min: 800, max: 1000, modele: 'Offre Site internet' },
      { solution: 'Logiciel agenda + RDV + rappels', min: 1400, max: 4000, modele: 'Offre Logiciel sur-mesure + 65€/mois' },
    ],
  },

  commerce_alimentaire: {
    sousCategories: ['Épicerie', 'Boulangerie-Pâtisserie', 'Fromagerie', 'Traiteur', 'Cave à vins', 'Bio/Épicerie fine'],
    solutions: [
      'Site vitrine avec horaires et produits phares',
      'App de commande click & collect (iOS + Android)',
      'Programme fidélité numérique',
    ],
    accroches: [
      'Votre boulangerie est introuvable sur Google ?',
      'Vos clients pourraient commander en ligne la veille ?',
      'Fidélisez vos habitués avec un programme points digital ?',
    ],
    tarifs: [
      { solution: 'Site vitrine simple', min: 400, max: 600, modele: 'Offre Site internet' },
      { solution: 'Site multi-pages', min: 800, max: 1000, modele: 'Offre Site internet' },
      { solution: 'App click & collect (iOS + Android)', min: 1200, max: 4000, modele: 'Offre Application mobile' },
    ],
  },

  artisanat_services: {
    sousCategories: ['Plomberie', 'Électricité', 'Menuiserie', 'Peinture/Bâtiment', 'Serrurerie', 'Nettoyage', 'Cordonnerie'],
    solutions: [
      'Site vitrine avec formulaire devis en ligne + galerie réalisations',
      'Logiciel de gestion d\'interventions (planning, suivi chantier, devis)',
      'App mobile technicien terrain (fiches d\'intervention, signatures)',
    ],
    accroches: [
      'Vos clients ne trouvent pas vos coordonnées en ligne ?',
      'Vous gérez vos devis et plannings sur Excel ?',
      'Vos techniciens reviennent avec des fiches papier ?',
    ],
    tarifs: [
      { solution: 'Site vitrine + formulaire devis', min: 400, max: 1000, modele: 'Offre Site internet' },
      { solution: 'Logiciel gestion interventions', min: 1400, max: 4000, modele: 'Offre Logiciel sur-mesure + 65€/mois' },
      { solution: 'App mobile technicien', min: 1200, max: 4000, modele: 'Offre Application mobile' },
    ],
  },

  automobile: {
    sousCategories: ['Garage / Mécanique', 'Carrosserie', 'Vente de véhicules', 'Contrôle technique', 'Lavage auto', 'Pièces détachées'],
    solutions: [
      'Site vitrine avec prise de RDV entretien',
      'Logiciel suivi client véhicule (état, rappels entretien, devis réparation)',
      'Catalogue de véhicules en ligne',
    ],
    accroches: [
      'Vos clients rappellent pour savoir si leur voiture est prête ?',
      'Vous perdez des clients faute de rappel d\'entretien automatique ?',
      'Votre catalogue de véhicules n\'est pas en ligne ?',
    ],
    tarifs: [
      { solution: 'Site vitrine + prise de RDV', min: 400, max: 1000, modele: 'Offre Site internet' },
      { solution: 'Logiciel suivi client / garage', min: 1400, max: 4000, modele: 'Offre Logiciel sur-mesure + 65€/mois' },
    ],
  },

  boutique_mode: {
    sousCategories: ['Prêt-à-porter', 'Friperie / Vintage', 'Chaussures', 'Accessoires', 'Lingerie', 'Sportswear'],
    solutions: [
      'Site vitrine avec catalogue produits',
      'Site complexe avec espace client / e-commerce',
      'App mobile boutique (fidélité, nouveautés, commande)',
    ],
    accroches: [
      'Vos collections ne sont pas visibles en dehors du magasin ?',
      'Vos clients veulent commander depuis chez eux ?',
      'Votre concurrent vend déjà en ligne — pas vous ?',
    ],
    tarifs: [
      { solution: 'Site vitrine + catalogue', min: 800, max: 1000, modele: 'Offre Site internet' },
      { solution: 'Site complexe / e-commerce', min: 1400, max: null, modele: 'Offre Site internet — Complexe+' },
      { solution: 'App mobile boutique / fidélité', min: 1200, max: 4000, modele: 'Offre Application mobile' },
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
      { solution: 'Logiciel commande B2B + catalogue + stock', min: 1400, max: 4000, modele: 'Offre Logiciel sur-mesure + 65€/mois' },
      { solution: 'Dashboard gestion de stock temps réel', min: 1400, max: 4000, modele: 'Offre Logiciel sur-mesure + 65€/mois' },
      { solution: 'Portail client grossiste (factures, BL)', min: 1400, max: 4000, modele: 'Offre Logiciel sur-mesure + 65€/mois' },
      { solution: 'App mobile commercial terrain', min: 1200, max: 4000, modele: 'Offre Application mobile' },
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
      { solution: 'Logiciel suivi de production (MES léger)', min: 1400, max: 4000, modele: 'Offre Logiciel sur-mesure + 65€/mois' },
      { solution: 'Gestion stock matières premières + alertes', min: 1400, max: 4000, modele: 'Offre Logiciel sur-mesure + 65€/mois' },
      { solution: 'Planning atelier + vue Gantt', min: 1400, max: 4000, modele: 'Offre Logiciel sur-mesure + 65€/mois' },
      { solution: 'App opérateur tablette (scan, saisie, signalement)', min: 1200, max: 4000, modele: 'Offre Application mobile' },
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
      { solution: 'Logiciel gestion de stock (scan QR, alertes seuil)', min: 1400, max: 4000, modele: 'Offre Logiciel sur-mesure + 65€/mois' },
      { solution: 'App inventaire mobile (smartphone)', min: 1200, max: 4000, modele: 'Offre Application mobile' },
      { solution: 'Dashboard stock multi-site', min: 1400, max: 4000, modele: 'Offre Logiciel sur-mesure + 65€/mois' },
      { solution: 'App location/prêt matériel', min: 1200, max: 4000, modele: 'Offre Application mobile' },
    ],
  },

  autre: {
    sousCategories: ['Librairie / Papeterie', 'Bureau Tabac PMU', 'Fleuriste', 'Pharmacie', 'Agence immobilière', 'Autre'],
    solutions: [
      'Site vitrine professionnel',
      'Logiciel de gestion sur-mesure',
      'Application mobile selon besoin',
    ],
    accroches: [
      'Votre activité mérite une présence digitale professionnelle.',
      'Digitalisez votre gestion pour gagner du temps.',
    ],
    tarifs: [
      { solution: 'Site vitrine simple', min: 400, max: 600, modele: 'Offre Site internet' },
      { solution: 'Site multi-pages', min: 800, max: 1000, modele: 'Offre Site internet' },
      { solution: 'Site complexe / espace client', min: 1400, max: null, modele: 'Offre Site internet — Complexe+' },
      { solution: 'Logiciel sur-mesure', min: 1400, max: 4000, modele: 'Offre Logiciel sur-mesure + 65€/mois' },
      { solution: 'Application mobile', min: 1200, max: 4000, modele: 'Offre Application mobile' },
    ],
  },
};
