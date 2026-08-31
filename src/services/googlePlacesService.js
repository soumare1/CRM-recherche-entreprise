/**
 * Google Places API (New) — service de recherche de commerces locaux
 *
 * Utilise la Places API v1 (nouvelle version 2023+) :
 * - Text Search  : trouve les établissements par ville + type
 * - Place Details: récupère téléphone, site web, horaires, note
 *
 * ⚠️ CORS : l'API Places (New) autorise les requêtes depuis le navigateur
 *    avec une clé API configurée + referrer restriction.
 *    Pour la prod, il faudra restreindre la clé à votre domaine.
 *
 * Doc : https://developers.google.com/maps/documentation/places/web-service/text-search
 */

const PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_KEY;
const PLACES_BASE    = 'https://places.googleapis.com/v1';

// ── Mapping secteur CRM → types Google Places ─────────────────────────────
const SECTEUR_TO_PLACE_TYPES = {
  restauration: [
    'restaurant', 'meal_takeaway', 'fast_food_restaurant',
    'kebab_restaurant', 'pizza_restaurant', 'bakery',
  ],
  coiffure_beaute: [
    'hair_salon', 'beauty_salon', 'nail_salon', 'barber_shop', 'spa',
  ],
  commerce_alimentaire: [
    'bakery', 'grocery_store', 'supermarket', 'convenience_store',
    'food_store', 'confectionery',
  ],
  artisanat_services: [
    'plumber', 'electrician', 'painter', 'locksmith',
    'home_goods_store', 'laundry',
  ],
  automobile: [
    'car_repair', 'car_dealer', 'car_wash', 'auto_parts_store',
  ],
  boutique_mode: [
    'clothing_store', 'shoe_store', 'jewelry_store',
    'home_goods_store', 'gift_shop',
  ],
  grossistes: [
    'wholesale_store', 'warehouse_store',
  ],
  manufactures_ateliers: [
    'home_goods_store', 'furniture_store',
  ],
  gestion_stock: [
    'storage', 'moving_company', 'self_storage',
  ],
  enseignement_formation: [
    'university', 'school', 'primary_school', 'secondary_school', 'preschool', 'educational_institution',
  ],
  autre: [
    'book_store', 'pharmacy', 'real_estate_agency',
    'florist', 'post_office',
  ],
};

// ── Domaines réseaux sociaux → pas de vrai site web ──────────────────────
const SOCIAL_DOMAINS = [
  'facebook.com', 'fb.com', 'instagram.com', 'twitter.com', 'x.com',
  'linkedin.com', 'tiktok.com', 'youtube.com', 'snapchat.com',
  'yelp.com', 'tripadvisor.com', 'lafourchette.com', 'thefork.com',
  'booking.com', 'airbnb.com', 'google.com/maps', 'maps.google',
  'goo.gl', 'pages.google.com',
];

// ── Builders gratuits → site de faible qualité / obsolète probable ────────
const FREE_BUILDER_DOMAINS = [
  'wixsite.com', 'wix.com', 'jimdo.com', 'jimdofree.com',
  'wordpress.com', 'over-blog.com', 'blogspot.com', 'site123.com',
  'webnode.com', 'webnode.fr', 'weebly.com', 'mozello.com',
  'strikingly.com', 'webflow.io', 'godaddysites.com',
  'simdif.com', 'zyro.com', 'site.google.com',
];

/**
 * Inférence locale immédiate (sans requête réseau supplémentaire).
 * Retourne : 'aucun_site' | 'site_obsolete' | 'site_ok'
 */
function inferStatutWeb(place) {
  const rawUrl = place.websiteUri;
  if (!rawUrl) return 'aucun_site';

  const url = rawUrl.toLowerCase();

  // Réseaux sociaux → l'entreprise n'a pas de vrai site
  if (SOCIAL_DOMAINS.some(d => url.includes(d))) return 'aucun_site';

  // Builders gratuits → site de qualité faible, probablement obsolète
  if (FREE_BUILDER_DOMAINS.some(d => url.includes(d))) return 'site_obsolete';

  // HTTP sans S → vieux site, non maintenu
  if (url.startsWith('http://')) return 'site_obsolete';

  // HTTPS + domaine propre → on suppose un site présent, sera vérifié en live
  return 'site_ok';
}

/**
 * Infère le secteur d'activité réel d'un établissement à partir de son nom et de ses types Google Places.
 * Évite les mauvaises classifications (ex: université classée en gestion de stock).
 */
function inferPlaceSector(p, searchedSecteurId, searchedSecteurInfo, secteurs) {
  const types = p.types || [];
  const name = (p.displayName?.text || '').toLowerCase();

  // Établissement d'enseignement ou formation
  const isEducation =
    types.some(t => ['university', 'school', 'primary_school', 'secondary_school', 'preschool', 'educational_institution'].includes(t)) ||
    /universit|ecole|école|lycee|lycée|college|collège|faculte|faculté|formation/i.test(name);

  if (isEducation) {
    const ensInfo = (secteurs || []).find(s => s.id === 'enseignement_formation');
    return {
      secteur_id: 'enseignement_formation',
      secteur: ensInfo?.label || 'Enseignement & Formation',
      secteur_icon: ensInfo?.icon || 'GraduationCap',
    };
  }

  // Si le secteur recherché était gestion_stock mais que le type réel n'est pas du stock
  if (searchedSecteurId === 'gestion_stock') {
    const isRealStock = types.some(t => ['storage', 'moving_company', 'self_storage', 'warehouse'].includes(t)) ||
      /stock|entrepot|entrepôt|garde.meuble|déménagement|demenagement|logistique/i.test(name);

    if (!isRealStock) {
      const autreInfo = (secteurs || []).find(s => s.id === 'autre');
      return {
        secteur_id: 'autre',
        secteur: autreInfo?.label || 'Autre',
        secteur_icon: autreInfo?.icon || 'Building2',
      };
    }
  }

  return {
    secteur_id: searchedSecteurId,
    secteur: searchedSecteurInfo?.label || searchedSecteurId,
    secteur_icon: searchedSecteurInfo?.icon || 'Building2',
  };
}

/**
 * Vérifie en live si un site web répond réellement (via proxy CORS public).
 * Appelé en arrière-plan après affichage des résultats initiaux.
 * Retourne : 'site_ok' | 'site_obsolete'
 */
export async function checkSiteLive(url) {
  if (!url) return 'aucun_site';
  try {
    // Proxy public qui retourne le statut HTTP sans CORS
    const proxyUrl = `https://api.allorigins.win/head?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return 'site_obsolete';
    const data = await res.json();
    const httpCode = data?.status?.http_code;
    // 200, 301, 302 = site vivant
    if (httpCode && (httpCode === 200 || httpCode === 301 || httpCode === 302)) {
      return 'site_ok';
    }
    // 404, 500, 0 (timeout/erreur DNS) = site mort ou inaccessible
    return 'site_obsolete';
  } catch {
    // Timeout ou erreur réseau → site inaccessible
    return 'site_obsolete';
  }
}

// ── Formater le numéro de téléphone en format français ────────────────────
function formatPhone(phone) {
  if (!phone) return null;
  // Supprimer les espaces et tirets existants
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Convertir +33 → 0
  const national = cleaned.replace(/^\+33/, '0');
  // Formater en groupes de 2 chiffres
  if (/^0\d{9}$/.test(national)) {
    return national.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return phone; // Retourner tel quel si format inconnu
}

// ── Text Search (recherche par ville + type) ───────────────────────────────
async function textSearch(query, locationBias, signal) {
  const body = {
    textQuery: query,
    languageCode: 'fr',
    regionCode: 'FR',
    maxResultCount: 20,
    ...(locationBias && { locationBias }),
  };

  const res = await fetch(`${PLACES_BASE}/places:searchText`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': PLACES_API_KEY,
      // Champs demandés (facturation à la carte)
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.nationalPhoneNumber',
        'places.websiteUri',
        'places.googleMapsUri',
        'places.types',
        'places.rating',
        'places.userRatingCount',
        'places.businessStatus',
      ].join(','),
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Places API error ${res.status}: ${err?.error?.message || res.statusText}`);
  }

  const data = await res.json();
  return data.places || [];
}

// ── Geocoder la ville pour avoir lat/lng ──────────────────────────────────
async function geocodeVille(ville, signal) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(ville + ', France')}&key=${PLACES_API_KEY}&language=fr&region=fr`;
  const res = await fetch(url, { signal });
  if (!res.ok) return null;
  const data = await res.json();
  const loc = data.results?.[0]?.geometry?.location;
  if (!loc) return null;
  return { latitude: loc.lat, longitude: loc.lng };
}

// ── Fonction principale : recherche multi-secteurs ────────────────────────
export async function searchGooglePlaces(ville, secteurIds, secteurs, signal) {
  if (!PLACES_API_KEY || PLACES_API_KEY === 'VOTRE_CLE_API_ICI') {
    throw new Error('GOOGLE_PLACES_KEY non configurée. Ajoutez VITE_GOOGLE_PLACES_KEY dans .env.local');
  }

  // Récupérer la position de la ville pour le biais de localisation
  const coords = await geocodeVille(ville, signal);
  const locationBias = coords ? {
    circle: {
      center: { latitude: coords.latitude, longitude: coords.longitude },
      radius: 5000, // 5km autour du centre-ville
    },
  } : null;

  const targetSecteurs = secteurIds.length > 0 ? secteurIds : Object.keys(SECTEUR_TO_PLACE_TYPES);
  const allResults = [];
  const seenIds = new Set();

  // Recherche en parallèle par secteur (max 3 en // pour respecter les quotas)
  const chunks = chunkArray(targetSecteurs, 3);

  for (const chunk of chunks) {
    if (signal?.aborted) break;

    const promises = chunk.map(async (secteurId) => {
      const placeTypes = SECTEUR_TO_PLACE_TYPES[secteurId];
      if (!placeTypes) return [];

      const secteurInfo = secteurs.find(s => s.id === secteurId);
      const sectorLabel = secteurInfo?.label || secteurId;

      // Recherche avec le type principal du secteur
      const primaryType = placeTypes[0];
      const query = `${sectorLabel} à ${ville}`;

      try {
        const places = await textSearch(query, locationBias, signal);

        return places
          .filter(p => p.businessStatus === 'OPERATIONAL' || !p.businessStatus)
          .filter(p => {
            if (seenIds.has(p.id)) return false;
            seenIds.add(p.id);
            return true;
          })
          .map(p => {
            const sec = inferPlaceSector(p, secteurId, secteurInfo, secteurs);
            return {
              id: `gp-${p.id}`,
              placeId: p.id,
              nom: p.displayName?.text || 'Commerce',
              secteur: sec.secteur,
              secteur_id: sec.secteur_id,
              secteur_icon: sec.secteur_icon,
              adresse: p.formattedAddress || `${ville}`,
              ville,
              telephone: formatPhone(p.nationalPhoneNumber),
              statut_web: inferStatutWeb(p),
              site_web: p.websiteUri || null,
              google_maps_url: p.googleMapsUri || null,
              note_google: p.rating || null,
              nb_avis: p.userRatingCount || 0,
              source: 'google_places',
            };
          });
      } catch (err) {
        if (err.name === 'AbortError') throw err;
        console.warn(`Places API — secteur ${secteurId}:`, err.message);
        return [];
      }
    });

    const results = await Promise.all(promises);
    allResults.push(...results.flat());
  }

  return allResults;
}

// ── Utilitaire chunk ──────────────────────────────────────────────────────
function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Vérifie si la clé Google Places est configurée
 */
export function isGooglePlacesConfigured() {
  return Boolean(
    PLACES_API_KEY &&
    PLACES_API_KEY !== 'VOTRE_CLE_API_ICI' &&
    PLACES_API_KEY.startsWith('AIza')
  );
}
