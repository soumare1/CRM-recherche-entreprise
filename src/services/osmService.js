/**
 * Service OpenStreetMap — recherche d'entreprises réelles via Overpass API
 * Aucune clé API requise. Fallback gracieux si timeout/erreur.
 */

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

// Tags OSM par secteur AppForge
const SECTOR_OSM_TAGS = {
  restauration: { amenity: ['restaurant', 'fast_food', 'cafe', 'bar', 'pub', 'food_court', 'ice_cream', 'bistro'] },
  coiffure_beaute: { shop: ['hairdresser', 'beauty', 'nail_salon', 'cosmetics', 'barber', 'tattoo', 'massage'] },
  commerce_alimentaire: { shop: ['bakery', 'convenience', 'supermarket', 'deli', 'cheese', 'greengrocer', 'wine', 'butcher', 'confectionery', 'pastry', 'seafood', 'farm'] },
  artisanat_services: { craft: ['plumber', 'electrician', 'carpenter', 'painter', 'locksmith', 'shoemaker', 'tailor', 'builder', 'hvac', 'roofer', 'glaziery', 'gardener', 'mason', 'tiler', 'plasterer', 'window_construction'], shop: ['locksmith', 'glaziery', 'craft'] },
  automobile: { shop: ['car_repair', 'car', 'car_parts', 'tyres', 'motorcycle'], amenity: ['car_wash', 'fuel', 'vehicle_inspection'] },
  boutique_mode: { shop: ['clothes', 'shoes', 'fashion', 'accessories', 'second_hand', 'jewelry', 'boutique', 'leather'] },
  grossistes: { shop: ['wholesale'], wholesale: ['yes'] },
  manufactures_ateliers: {
    craft: ['blacksmith', 'metal_construction', 'sawmill', 'joiner', 'pottery', 'brewery', 'winery', 'distillery', 'stonemason', 'metalworking', 'cabinet_maker', 'bookbinder'],
    man_made: ['works'],
    industrial: ['factory', 'manufacturing', 'works'],
    building: ['industrial', 'manufacture']
  },
  gestion_stock: { shop: ['storage_rental'], amenity: ['storage'], self_storage: ['yes'], building: ['warehouse'], landuse: ['depot'] },
  autre: { shop: ['florist', 'books', 'tobacco', 'gift', 'stationery', 'kiosk', 'optician', 'hardware', 'doityourself'], amenity: ['pharmacy', 'optician', 'bank', 'dry_cleaning'] },
};

/** Catégorise le statut web selon la présence et la qualité de l'URL */
function categorizeWebStatus(website) {
  if (!website) return 'aucun_site';
  const url = website.toLowerCase().trim();
  const isHttpOnly = url.startsWith('http://');
  const isObsoleteOrSocial = /facebook\.com|instagram\.com|pagesjaunes\.fr|wixsite\.com|wordpress\.com|jimdosite\.com|blogspot\.com|google\.com\/site|site-privilege\.fr|societe\.com|annuaire|myshopify\.com/.test(url);
  if (isHttpOnly || isObsoleteOrSocial) {
    return 'site_obsolete';
  }
  return 'site_ok';
}

/** Récupère la bounding box d'une ville via Nominatim */
async function getCityBbox(cityName, signal) {
  const url = `${NOMINATIM_URL}/search?q=${encodeURIComponent(cityName)}&format=json&limit=3&countrycodes=fr&featuretype=city,town,municipality,village`;
  const res = await fetch(url, { signal, headers: { 'Accept-Language': 'fr' } });
  if (!res.ok) throw new Error('Nominatim error');
  const data = await res.json();
  if (!data.length) throw new Error(`Ville "${cityName}" introuvable`);

  // Priorité : résultat avec le plus d'importance
  const best = data.sort((a, b) => a.importance - b.importance).pop();
  // boundingbox: [minlat, maxlat, minlon, maxlon]
  const [south, north, west, east] = best.boundingbox;
  return { south: +south, north: +north, west: +west, east: +east };
}

/** Construit la requête Overpass QL */
function buildQuery(bbox, secteurIds) {
  const { south, west, north, east } = bbox;
  const b = `${south},${west},${north},${east}`;
  const targets = secteurIds.length > 0 ? secteurIds : Object.keys(SECTOR_OSM_TAGS);

  const lines = [];
  for (const sid of targets) {
    const tags = SECTOR_OSM_TAGS[sid];
    if (!tags) continue;
    for (const [key, vals] of Object.entries(tags)) {
      if (vals === null) {
        lines.push(`node["${key}"]["name"](${b});`, `way["${key}"]["name"](${b});`);
      } else if (Array.isArray(vals)) {
        const re = vals.join('|');
        lines.push(
          `node["${key}"~"^(${re})$"]["name"](${b});`,
          `way["${key}"~"^(${re})$"]["name"](${b});`
        );
      }
    }
  }

  return `[out:json][timeout:30];\n(\n  ${lines.join('\n  ')}\n);\nout center 200;`;
}

/** Détecte le secteur d'un élément OSM */
function detectSecteur(tags, targetSectors) {
  for (const sid of targetSectors) {
    const sectorTags = SECTOR_OSM_TAGS[sid];
    if (!sectorTags) continue;
    for (const [key, vals] of Object.entries(sectorTags)) {
      if (tags[key] !== undefined) {
        if (vals === null) return sid;
        if (Array.isArray(vals) && vals.includes(tags[key])) return sid;
      }
    }
  }
  return null;
}

/** Normalise un élément OSM en prospect */
function normalize(el, secteurId, secteurInfo, ville) {
  const t = el.tags || {};
  if (!t.name?.trim()) return null;

  const phone = t.phone || t['contact:phone'] || t['contact:mobile'] || null;
  const website = t.website || t['contact:website'] || t.url || null;
  const statut_web = categorizeWebStatus(website);

  const parts = [t['addr:housenumber'], t['addr:street'], t['addr:postcode'], t['addr:city'] || ville];
  const adresse = parts.filter(Boolean).join(' ') || ville;

  return {
    id: `osm-${el.type}-${el.id}`,
    nom: t.name.trim(),
    secteur: secteurInfo?.label || 'Autre',
    secteur_id: secteurId,
    secteur_icon: secteurInfo?.icon || 'Building2',
    adresse,
    telephone: phone ? phone.replace(/[^\d +]/g, ' ').trim() : null,
    statut_web,
    websiteUrl: website || null,
    ville,
    source: 'osm', // badge "données réelles"
  };
}

/**
 * Recherche principale — retourne des entreprises réelles OSM
 * @param {string} cityName - Nom de la ville
 * @param {string[]} secteurIds - Secteurs filtrés (vide = tous)
 * @param {Object[]} secteursList - Liste SECTEURS depuis constants
 * @param {AbortSignal} signal - Pour annulation
 */
export async function searchOSMProspects(cityName, secteurIds, secteursList, signal) {
  const bbox = await getCityBbox(cityName, signal);
  const query = buildQuery(bbox, secteurIds);

  const body = new URLSearchParams({ data: query });
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    body,
    signal,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);

  const data = await res.json();
  const elements = data.elements || [];

  const targets = secteurIds.length > 0 ? secteurIds : Object.keys(SECTOR_OSM_TAGS);
  const results = [];
  const seen = new Set();

  for (const el of elements) {
    const tags = el.tags || {};
    if (!tags.name) continue;

    const sid = detectSecteur(tags, targets);
    if (!sid) continue;

    const info = secteursList.find(s => s.id === sid);
    const normalized = normalize(el, sid, info, cityName);
    if (!normalized) continue;

    const key = normalized.nom.toLowerCase().replace(/\s+/g, '');
    if (seen.has(key)) continue;
    seen.add(key);

    results.push(normalized);
  }

  // Tri : sans site en premier (meilleurs prospects AppForge)
  return results.sort((a, b) => {
    const order = { aucun_site: 0, site_obsolete: 1, site_ok: 2 };
    return (order[a.statut_web] ?? 3) - (order[b.statut_web] ?? 3);
  });
}

