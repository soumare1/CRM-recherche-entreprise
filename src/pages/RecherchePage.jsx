import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Search, MapPin, SlidersHorizontal, Plus, CheckSquare,
  Square, Loader2, Store, Globe, Building2, ChevronDown,
  ShoppingBag, Utensils, Scissors, Wrench, Car, Check, X,
  Warehouse, Factory, PackageSearch, Sparkles, Phone, ArrowRight,
  Filter, CheckCircle2, Zap, Layers, RefreshCw, ExternalLink
} from 'lucide-react';
import { useProspectStore } from '../stores/prospectStore';
import { useCampagneStore } from '../stores/campagneStore';
import { usePageStateStore } from '../stores/pageStateStore';
import { SECTEURS, STATUTS_WEB } from '../lib/constants';
import { searchOSMProspects } from '../services/osmService';
import { searchGooglePlaces, isGooglePlacesConfigured, checkSiteLive } from '../services/googlePlacesService';

// ── Résolution icône Lucide depuis string ──────────────────────────────────
const ICON_MAP = {
  Utensils, Scissors, ShoppingBag, Wrench, Car, Store, Building2,
  Warehouse, Factory, PackageSearch
};

function SecteurIcon({ name, size = 14, className = '' }) {
  const Icon = ICON_MAP[name] || Store;
  return <Icon size={size} className={className} />;
}

// ── Hook autocomplete villes françaises (geo.api.gouv.fr) ─────────────────
function useCityAutocomplete(query) {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const isPostal = /^\d+$/.test(q);
        const url = isPostal
          ? `https://geo.api.gouv.fr/communes?codePostal=${q}&fields=nom,codesPostaux,population&boost=population&limit=8`
          : `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(q)}&fields=nom,codesPostaux,population&boost=population&limit=8`;

        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        setSuggestions(
          data
            .filter(c => c.population > 0)
            .sort((a, b) => (b.population || 0) - (a.population || 0))
            .map(c => ({
              label: `${c.nom} (${c.codesPostaux?.[0] || ''})`,
              value: c.nom,
              codePostal: c.codesPostaux?.[0] || '',
              population: c.population ? c.population.toLocaleString('fr-FR') : null,
            }))
        );
      } catch (err) {
        if (err.name !== 'AbortError') setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { suggestions, isLoading };
}

// ── Composant input ville avec autocomplete ultra-moderne ─────────────────
function CityAutocompleteInput({ value, onChange, onSelect, disabled }) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef(null);
  const { suggestions, isLoading } = useCityAutocomplete(value);

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIdx(-1);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setOpen(suggestions.length > 0);
    setActiveIdx(-1);
  }, [suggestions]);

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && activeIdx >= 0) {
      e.preventDefault();
      const s = suggestions[activeIdx];
      onSelect(s.value, s.codePostal);
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  const handleSelect = useCallback((s) => {
    onSelect(s.value, s.codePostal);
    setOpen(false);
    setActiveIdx(-1);
  }, [onSelect]);

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="relative flex items-center">
        <MapPin size={20} className="absolute left-4 text-violet-400 z-10" />
        {isLoading && (
          <Loader2 size={18} className="absolute right-4 text-violet-400 animate-spin z-10" />
        )}
        <input
          type="text"
          placeholder="Entrez une ville ou code postal (ex: Paris, Lyon, 91000...)"
          value={value}
          onChange={e => { onChange(e.target.value); }}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          disabled={disabled}
          autoComplete="off"
          className="w-full pl-12 pr-11 py-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-base font-medium transition-all shadow-inner disabled:opacity-50"
        />
      </div>

      {/* Dropdown suggestions */}
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-neutral-800/60 animate-in fade-in slide-in-from-top-2 duration-200">
          {suggestions.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onMouseDown={e => { e.preventDefault(); handleSelect(s); }}
              onMouseEnter={() => setActiveIdx(i)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all ${
                i === activeIdx
                  ? 'bg-violet-600 text-white pl-5'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${i === activeIdx ? 'bg-violet-700 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                  <MapPin size={15} />
                </div>
                <div>
                  <span className="font-semibold block text-sm">{s.value}</span>
                  <span className="text-neutral-400 text-xs">{s.codePostal}</span>
                </div>
              </div>
              {s.population && (
                <span className="text-[11px] font-medium text-neutral-400 bg-neutral-800 px-2 py-1 rounded-md">
                  {s.population} hab.
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Générateur de résultats mock ──────────────────────────────────────────
function generateMockResults(ville, secteurs) {
  const templates = {
    restauration: [
      { nom: 'Le Coin Gourmand', telephone: '01 42 33 44 55', statut_web: 'aucun_site' },
      { nom: 'Brasserie du Centre', telephone: '01 42 55 66 77', statut_web: 'site_obsolete' },
      { nom: 'Pizza Express', telephone: '01 43 21 98 76', statut_web: 'aucun_site' },
      { nom: 'Restaurant du Marché', telephone: '01 41 22 33 44', statut_web: 'aucun_site' },
      { nom: 'Kebab Palace', telephone: '06 12 34 56 78', statut_web: 'aucun_site' },
      { nom: 'Sushi Corner', telephone: '01 44 55 66 77', statut_web: 'site_obsolete' },
    ],
    coiffure_beaute: [
      { nom: 'Hair & Beauty Studio', telephone: '01 44 55 66 77', statut_web: 'aucun_site' },
      { nom: 'Salon de Coiffure Élégance', telephone: '01 44 11 22 33', statut_web: 'aucun_site' },
      { nom: 'Institut Bien-Être', telephone: '06 87 65 43 21', statut_web: 'site_obsolete' },
      { nom: 'Ongle & Co', telephone: '01 44 33 22 11', statut_web: 'aucun_site' },
    ],
    commerce_alimentaire: [
      { nom: 'Épicerie du Quartier', telephone: '01 45 12 23 34', statut_web: 'aucun_site' },
      { nom: 'Boulangerie Artisanale', telephone: '01 45 66 77 88', statut_web: 'aucun_site' },
      { nom: 'Fromagerie Tradition', telephone: '01 45 44 55 66', statut_web: 'site_obsolete' },
      { nom: 'Traiteur Maison', telephone: '06 55 44 33 22', statut_web: 'aucun_site' },
    ],
    artisanat_services: [
      { nom: 'Plomberie Rapide', telephone: '06 11 22 33 44', statut_web: 'aucun_site' },
      { nom: 'Électricité Générale', telephone: '06 22 33 44 55', statut_web: 'site_obsolete' },
      { nom: 'Cordonnerie du Centre', telephone: '01 46 12 23 34', statut_web: 'aucun_site' },
    ],
    automobile: [
      { nom: 'Garage du Peuple', telephone: '01 47 11 22 33', statut_web: 'aucun_site' },
      { nom: 'Auto Service Express', telephone: '01 47 44 55 66', statut_web: 'site_obsolete' },
    ],
    boutique_mode: [
      { nom: 'Boutique Tendance', telephone: '01 48 33 44 55', statut_web: 'aucun_site' },
      { nom: 'Friperie Vintage', telephone: '06 77 88 99 00', statut_web: 'aucun_site' },
    ],
    grossistes: [
      { nom: 'Distrib Pro Alimentaire', telephone: '01 52 11 22 33', statut_web: 'aucun_site' },
      { nom: 'Grossiste Boissons & Co', telephone: '01 52 44 55 66', statut_web: 'site_obsolete' },
      { nom: 'BTP Matériaux Direct', telephone: '01 53 12 23 34', statut_web: 'aucun_site' },
      { nom: 'Fournitures Industrielles Sud', telephone: '06 33 44 55 66', statut_web: 'aucun_site' },
      { nom: 'Textile Gros Volume', telephone: '01 54 33 44 55', statut_web: 'site_obsolete' },
      { nom: 'Hygiène Pro Distribution', telephone: '01 54 66 77 88', statut_web: 'aucun_site' },
    ],
    manufactures_ateliers: [
      { nom: 'Menuiserie Dupont Frères', telephone: '01 55 11 22 33', statut_web: 'aucun_site' },
      { nom: 'Atelier Métallurgie Martin', telephone: '01 55 44 55 66', statut_web: 'site_obsolete' },
      { nom: 'Confection Textile Bernard', telephone: '06 44 55 66 77', statut_web: 'aucun_site' },
      { nom: 'Cosmétiques Labo Provence', telephone: '01 56 12 23 34', statut_web: 'aucun_site' },
      { nom: 'Packaging Solutions Ouest', telephone: '01 56 44 55 66', statut_web: 'site_obsolete' },
    ],
    gestion_stock: [
      { nom: 'Entrepôt E-Com Express', telephone: '01 57 11 22 33', statut_web: 'aucun_site' },
      { nom: 'Location BTP Matériel', telephone: '01 57 44 55 66', statut_web: 'site_obsolete' },
      { nom: 'Pièces Auto Discount', telephone: '06 55 66 77 88', statut_web: 'aucun_site' },
      { nom: 'Quincaillerie du Centre', telephone: '01 58 12 23 34', statut_web: 'aucun_site' },
      { nom: 'Cave à Vins Sélection', telephone: '01 58 44 55 66', statut_web: 'site_obsolete' },
      { nom: 'Multi-Stocks Régional', telephone: '01 59 11 22 33', statut_web: 'aucun_site' },
    ],
    autre: [
      { nom: 'Librairie Papeterie', telephone: '01 49 22 33 44', statut_web: 'site_obsolete' },
      { nom: 'Bureau Tabac PMU', telephone: '01 49 55 66 77', statut_web: 'aucun_site' },
    ],
  };

  const targetSecteurs = secteurs.length > 0 ? secteurs : Object.keys(templates);
  const results = [];

  targetSecteurs.forEach(secteurId => {
    const secteurInfo = SECTEURS.find(s => s.id === secteurId);
    const items = templates[secteurId] || [];
    items.forEach((item, i) => {
      results.push({
        id: `search-${secteurId}-${i}`,
        nom: item.nom,
        secteur: secteurInfo?.label || 'Autre',
        secteur_id: secteurId,
        secteur_icon: secteurInfo?.icon || 'Building2',
        adresse: `${10 + i * 7} Rue ${['du Commerce', 'Victor Hugo', 'de la Paix', 'Jean Jaurès', 'de la République'][i % 5]}, ${ville}`,
        telephone: item.telephone,
        statut_web: item.statut_web,
        ville,
        source: 'simulated',
      });
    });
  });

  return results;
}

// ── Composant principal Moderne ───────────────────────────────────────────
export default function RecherchePage() {
  const { recherche, setRechercheState } = usePageStateStore();
  const { villeInput, selectedSecteurs, selectedStatutsWeb, showFilters } = recherche;

  const setVilleInput = (v) => setRechercheState({ villeInput: v });
  const setSelectedSecteurs = (fn) => setRechercheState({
    selectedSecteurs: typeof fn === 'function' ? fn(selectedSecteurs) : fn,
  });
  const setSelectedStatutsWeb = (fn) => setRechercheState({
    selectedStatutsWeb: typeof fn === 'function' ? fn(selectedStatutsWeb) : fn,
  });
  const setShowFilters = (fn) => setRechercheState({
    showFilters: typeof fn === 'function' ? fn(showFilters) : fn,
  });

  const [ville, setVille] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [importedIds, setImportedIds] = useState(new Set());
  // Map placeId → 'checking' | 'site_ok' | 'site_obsolete' pour vérification live
  const [siteChecks, setSiteChecks] = useState({});

  const abortControllerRef = useRef(null);

  const { addProspect, prospects } = useProspectStore();
  const activeCampagneId = useCampagneStore(state => state.activeCampagneId);
  const campagnes = useCampagneStore(state => state.campagnes);
  const activeCampagne = campagnes.find(c => c.id === activeCampagneId);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!villeInput.trim()) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsSearching(true);
    setResults([]);
    setSelected(new Set());
    setImportedIds(new Set());
    setVille(villeInput.trim());

    try {
      let finalResults = [];
      const existingNoms = new Set(prospects.map(p => p.nom.toLowerCase()));

      // ── 1. Google Places API (données réelles avec téléphones) ────────────
      if (isGooglePlacesConfigured()) {
        try {
          const googleResults = await searchGooglePlaces(
            villeInput.trim(),
            selectedSecteurs,
            SECTEURS,
            controller.signal
          );
          finalResults = googleResults.filter(r => !existingNoms.has(r.nom.toLowerCase()));
        } catch (gErr) {
          if (gErr.name === 'AbortError') throw gErr;
          console.warn('Google Places indisponible, bascule sur OSM :', gErr.message);
        }
      }

      // ── 2. OpenStreetMap (fallback si pas de clé Google ou erreur) ────────
      if (finalResults.length < 3) {
        try {
          const osmResults = await searchOSMProspects(
            villeInput.trim(),
            selectedSecteurs,
            SECTEURS,
            controller.signal
          );
          const osmFiltered = osmResults.filter(r => !existingNoms.has(r.nom.toLowerCase()));
          // Merge : éviter les doublons par nom
          const existingMergedNoms = new Set(finalResults.map(r => r.nom.toLowerCase()));
          const osmNew = osmFiltered.filter(r => !existingMergedNoms.has(r.nom.toLowerCase()));
          finalResults = [...finalResults, ...osmNew];
        } catch (osmErr) {
          if (osmErr.name === 'AbortError') throw osmErr;
          console.warn('OSM indisponible :', osmErr.message);
        }
      }

      // ── 3. Données simulées (dernier recours) ───────────────────────────
      if (finalResults.length < 5) {
        const mockRaw = generateMockResults(villeInput.trim(), selectedSecteurs);
        const existingMergedNoms = new Set(finalResults.map(r => r.nom.toLowerCase()));
        const mockNew = mockRaw
          .filter(m => !existingNoms.has(m.nom.toLowerCase()))
          .filter(m => !existingMergedNoms.has(m.nom.toLowerCase()));
        finalResults = [...finalResults, ...mockNew];
      }

      setResults(finalResults);

      // ── Vérification live en arrière-plan pour les sites présents ─────────
      // On vérifie uniquement les résultats qui ont un site présumé (site_ok)
      // et qui viennent de Google Places (ils ont un site_web URL)
      const toCheck = finalResults.filter(r => r.site_web && r.statut_web === 'site_ok');
      if (toCheck.length > 0) {
        // Marquer comme "en cours de vérification"
        setSiteChecks(prev => {
          const next = { ...prev };
          toCheck.forEach(r => { next[r.id] = 'checking'; });
          return next;
        });

        // Lancer les vérifications par batch de 3 en parallèle
        (async () => {
          const BATCH = 3;
          for (let i = 0; i < toCheck.length; i += BATCH) {
            const batch = toCheck.slice(i, i + BATCH);
            await Promise.all(batch.map(async (r) => {
              const liveStatus = await checkSiteLive(r.site_web);
              setSiteChecks(prev => ({ ...prev, [r.id]: liveStatus }));
            }));
          }
        })();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.warn('Erreur recherche :', err);
        const mockRaw = generateMockResults(villeInput.trim(), selectedSecteurs);
        const existingNoms = new Set(prospects.map(p => p.nom.toLowerCase()));
        setResults(mockRaw.filter(r => !existingNoms.has(r.nom.toLowerCase())));
      }
    } finally {
      if (abortControllerRef.current === controller) {
        setIsSearching(false);
      }
    }
  };

  const handleCitySelect = useCallback((nom) => {
    setVilleInput(nom);
  }, []);

  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const matchSecteur = selectedSecteurs.length === 0 || selectedSecteurs.includes(r.secteur_id);
      const matchStatutWeb = selectedStatutsWeb.length === 0 || selectedStatutsWeb.includes(r.statut_web);
      return matchSecteur && matchStatutWeb;
    });
  }, [results, selectedSecteurs, selectedStatutsWeb]);

  // Statistiques des résultats de recherche
  const stats = useMemo(() => {
    const total = filteredResults.length;
    const sansSite = filteredResults.filter(r => r.statut_web === 'aucun_site').length;
    const siteObsolete = filteredResults.filter(r => r.statut_web === 'site_obsolete').length;
    return { total, sansSite, siteObsolete };
  }, [filteredResults]);

  const toggleSecteur = (id) => {
    setSelectedSecteurs(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleStatutWeb = (id) => {
    setSelectedStatutsWeb(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredResults.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredResults.map(r => r.id)));
    }
  };

  const selectOnlySansSite = () => {
    const sansSiteIds = filteredResults
      .filter(r => r.statut_web === 'aucun_site' && !importedIds.has(r.id))
      .map(r => r.id);
    setSelected(new Set(sansSiteIds));
  };

  const handleImportSelected = () => {
    if (!activeCampagneId) return alert('Veuillez d\'abord sélectionner une campagne active dans la barre supérieure.');
    const toImport = filteredResults.filter(r => selected.has(r.id));
    toImport.forEach(r => {
      addProspect({
        nom: r.nom,
        secteur: r.secteur,
        secteur_id: r.secteur_id,
        adresse: r.adresse,
        telephone: r.telephone,
        statut_web: r.statut_web,
        ville: r.ville,
        campagne_id: activeCampagneId,
        pipeline_stage: 'a_contacter',
        priorite: 0,
        source: 'recherche_auto',
        tags: [],
      });
    });
    const newImported = new Set([...importedIds, ...selected]);
    setImportedIds(newImported);
    setSelected(new Set());
  };

  const allSelected = filteredResults.length > 0 && selected.size === filteredResults.length;
  const someSelected = selected.size > 0;
  const activeFiltersCount = selectedSecteurs.length + selectedStatutsWeb.length;

  return (
    <div className="h-full flex flex-col gap-6 max-w-7xl mx-auto px-1 py-2">

      {/* ── En-tête Moderne ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Recherche Intelligente</h2>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/15 border border-violet-500/30 text-violet-300">
              <Sparkles size={13} className="text-violet-400" />
              {isGooglePlacesConfigured() ? 'Google Places' : 'OSM & IA Live'}
            </span>
          </div>
          <p className="text-sm text-neutral-400 max-w-2xl">
            {isGooglePlacesConfigured()
              ? 'Données réelles via Google Places API — numéros de téléphone vérifiés, sites web, notes Google.'
              : 'Détectez instantanément les commerces et entreprises locales dépourvus de site web pour enrichir vos campagnes de prospection.'
            }
          </p>
        </div>

        {/* Info Campagne active */}
        <div className="bg-neutral-900 border border-neutral-800 px-4 py-2.5 rounded-2xl flex items-center gap-3 self-start md:self-auto shadow-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div className="text-xs">
            <span className="text-neutral-400 block font-medium">Campagne active</span>
            <span className="text-white font-semibold">{activeCampagne?.nom || 'Aucune sélectionnée'}</span>
          </div>
        </div>
      </div>

      {/* ── Panneau de Recherche Principal ── */}
      <form onSubmit={handleSearch} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <CityAutocompleteInput
            value={villeInput}
            onChange={setVilleInput}
            onSelect={handleCitySelect}
            disabled={isSearching}
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(v => !v)}
              className={`relative flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border text-sm font-semibold transition-all duration-200 ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/20'
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600 hover:text-white'
              }`}
            >
              <SlidersHorizontal size={18} />
              <span className="hidden sm:inline">Filtres</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 w-5 h-5 bg-white text-violet-700 text-[11px] font-bold rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <button
              type="submit"
              disabled={isSearching || !villeInput.trim()}
              className="flex items-center justify-center gap-2.5 px-8 py-4 bg-violet-600 hover:bg-violet-500 text-white text-base font-bold rounded-2xl shadow-xl shadow-violet-600/25 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none min-w-[170px]"
            >
              {isSearching ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Analyse...</span>
                </>
              ) : (
                <>
                  <Search size={19} />
                  <span>Lancer</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Filtres Rapides de Secteur (Quick Pills) ── */}
        <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider shrink-0 mr-1">
            Secteurs clés :
          </span>
          {SECTEURS.slice(0, 7).map(s => {
            const active = selectedSecteurs.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSecteur(s.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-medium shrink-0 transition-all ${
                  active
                    ? 'bg-violet-600 border-violet-500 text-white shadow-sm'
                    : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-600'
                }`}
              >
                <SecteurIcon name={s.icon} size={13} />
                {s.label}
              </button>
            );
          })}
        </div>

        {/* ── Tiroir de Filtres Avancés ── */}
        {showFilters && (
          <div className="mt-5 pt-5 border-t border-neutral-800 space-y-6 animate-in fade-in duration-200">
            {/* Secteurs d'activité complets */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Tous les secteurs d'activité</p>
                {selectedSecteurs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSecteurs([])}
                    className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
                  >
                    <X size={13} /> Réinitialiser ({selectedSecteurs.length})
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {SECTEURS.map(s => {
                  const active = selectedSecteurs.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSecteur(s.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        active
                          ? 'bg-violet-600 border-violet-500 text-white shadow-md'
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600 hover:text-white'
                      }`}
                    >
                      <SecteurIcon name={s.icon} size={14} />
                      {s.label}
                      {active && <Check size={14} className="text-white ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Présence Web */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Filtrer par statut web</p>
                {selectedStatutsWeb.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedStatutsWeb([])}
                    className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
                  >
                    <X size={13} /> Réinitialiser ({selectedStatutsWeb.length})
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {STATUTS_WEB.map(s => {
                  const active = selectedStatutsWeb.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleStatutWeb(s.id)}
                      className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                        active
                          ? `${s.color} border-current shadow-md`
                          : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-600 hover:text-white'
                      }`}
                    >
                      {s.label}
                      {active && <Check size={14} className="inline ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </form>

      {/* ── Cartes de Statistiques & Résultats ── */}
      {results.length > 0 && (
        <div className="flex-1 flex flex-col gap-4 min-h-0">

          {/* Cartes KPI Synthèse */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs text-neutral-400 font-medium block">Total commerces trouvés</span>
                <span className="text-2xl font-black text-white">{stats.total}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <Store size={20} />
              </div>
            </div>

            <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs text-rose-400 font-medium block">Cibles prioritaires (Sans site)</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-rose-300">{stats.sansSite}</span>
                  {stats.sansSite > 0 && (
                    <button
                      type="button"
                      onClick={selectOnlySansSite}
                      className="text-xs text-rose-400 underline hover:text-rose-200 font-medium"
                    >
                      Tout cocher
                    </button>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center">
                <Zap size={20} />
              </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <div>
                <span className="text-xs text-amber-400 font-medium block">Opportunités (Site obsolète)</span>
                <span className="text-2xl font-black text-amber-300">{stats.siteObsolete}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Globe size={20} />
              </div>
            </div>
          </div>

          {/* Panneau des Résultats */}
          <div className="flex-1 flex flex-col min-h-0 bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">

            {/* Barre de sélection & actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-neutral-800 bg-neutral-900">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2.5 text-sm font-semibold text-neutral-300 hover:text-white transition-colors"
                >
                  {allSelected ? (
                    <CheckSquare size={20} className="text-violet-400" />
                  ) : (
                    <Square size={20} className="text-neutral-500" />
                  )}
                  <span>{allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}</span>
                </button>

                <span className="text-neutral-700">|</span>

                <span className="text-xs text-neutral-400 font-medium">
                  Affichage de <strong className="text-white">{filteredResults.length}</strong> commerces à <strong className="text-white">{ville}</strong>
                </span>
              </div>

              {someSelected && (
                <button
                  onClick={handleImportSelected}
                  className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-600/30 transition-all active:scale-95 animate-in fade-in"
                >
                  <Plus size={17} />
                  Importer {selected.size} prospect{selected.size > 1 ? 's' : ''} dans la campagne
                </button>
              )}
            </div>

            {/* Liste scrollable des cartes de résultats */}
            <div className="flex-1 overflow-y-auto scrollbar-hide divide-y divide-neutral-800">
              {filteredResults.map(result => {
                const isSelected = selected.has(result.id);
                const isImported = importedIds.has(result.id);
                // Priorité : vérification live > statut initial Google
                const liveCheck = siteChecks[result.id]; // 'checking' | 'site_ok' | 'site_obsolete' | undefined
                const effectiveStatut = liveCheck && liveCheck !== 'checking'
                  ? liveCheck
                  : result.statut_web;
                const statutInfo = STATUTS_WEB.find(s => s.id === effectiveStatut);

                return (
                  <div
                    key={result.id}
                    onClick={() => !isImported && toggleSelect(result.id)}
                    className={`flex items-center gap-4 px-6 py-4 transition-all duration-150 ${
                      isImported
                        ? 'opacity-40 cursor-not-allowed bg-neutral-950/40'
                        : isSelected
                          ? 'bg-violet-500/10 cursor-pointer border-l-4 border-l-violet-500'
                          : 'hover:bg-neutral-800/60 cursor-pointer'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className="shrink-0">
                      {isImported ? (
                        <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Check size={14} />
                        </div>
                      ) : isSelected ? (
                        <CheckSquare size={21} className="text-violet-400" />
                      ) : (
                        <Square size={21} className="text-neutral-600 hover:text-neutral-400 transition-colors" />
                      )}
                    </div>

                    {/* Icône du secteur */}
                    <div className="w-11 h-11 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0 shadow-inner">
                      <SecteurIcon name={result.secteur_icon} size={20} className="text-neutral-300" />
                    </div>

                    {/* Informations prospect */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <h4 className="font-bold text-white text-base truncate">{result.nom}</h4>
                        {result.source === 'google_places' && (
                          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                            📍 Google
                          </span>
                        )}
                        {result.source === 'osm' && (
                          <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-full shrink-0">
                            OSM Réel
                          </span>
                        )}
                        {isImported && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full shrink-0">
                            Importé
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-neutral-400">
                        <span className="font-semibold text-neutral-300">{result.secteur}</span>
                        <span className="text-neutral-700">·</span>
                        <span className="flex items-center gap-1 truncate text-neutral-400">
                          <MapPin size={12} className="text-neutral-500 shrink-0" />
                          {result.adresse}
                        </span>
                        {result.telephone && (
                          <>
                            <span className="text-neutral-700">·</span>
                            <span className="flex items-center gap-1 text-neutral-300 font-mono">
                              <Phone size={12} className="text-neutral-500 shrink-0" />
                              {result.telephone}
                            </span>
                          </>
                        )}
                        {result.site_web && (
                          <>
                            <span className="text-neutral-700">·</span>
                            <a
                              href={result.site_web}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline transition-colors max-w-[180px] truncate"
                              title={result.site_web}
                            >
                              <ExternalLink size={11} className="shrink-0" />
                              {result.site_web
                                .replace(/^https?:\/\/(www\.)?/, '')
                                .replace(/\/$/, '')
                                .split('/')[0]
                              }
                            </a>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Statut Web Pill */}
                    <div className="shrink-0 hidden sm:flex items-center gap-2">
                      {liveCheck === 'checking' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-700 text-neutral-500 bg-neutral-800/50">
                          <Loader2 size={12} className="animate-spin" />
                          Vérification...
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border ${statutInfo?.color}`}>
                          <Globe size={13} />
                          {statutInfo?.label}
                          {liveCheck && liveCheck !== 'checking' && (
                            <span className="ml-1 text-[10px] opacity-60">✓</span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Bouton d'import rapide 1-Clic */}
                    {!isImported && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!activeCampagneId) return alert('Veuillez sélectionner une campagne active.');
                          addProspect({
                            nom: result.nom,
                            secteur: result.secteur,
                            adresse: result.adresse,
                            telephone: result.telephone,
                            statut_web: result.statut_web,
                            ville: result.ville,
                            campagne_id: activeCampagneId,
                            pipeline_stage: 'a_contacter',
                            priorite: 0,
                            source: 'recherche_auto',
                            tags: [],
                          });
                          setImportedIds(prev => new Set([...prev, result.id]));
                          setSelected(prev => {
                            const next = new Set(prev);
                            next.delete(result.id);
                            return next;
                          });
                        }}
                        className="shrink-0 p-2.5 rounded-xl bg-neutral-800 hover:bg-violet-600 text-neutral-400 hover:text-white transition-all border border-neutral-700 hover:border-violet-500 shadow-sm"
                        title="Ajouter immédiatement à la campagne"
                      >
                        <Plus size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Notification de confirmation en bas de liste */}
            {importedIds.size > 0 && (
              <div className="px-6 py-3.5 bg-emerald-500/10 border-t border-emerald-500/20 text-sm text-emerald-400 font-semibold flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  <span>{importedIds.size} prospect{importedIds.size > 1 ? 's' : ''} ajouté{importedIds.size > 1 ? 's' : ''} avec succès à la campagne "{activeCampagne?.nom}"</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Aucun résultat après recherche ── */}
      {!isSearching && results.length === 0 && ville && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-neutral-900 border border-neutral-800 rounded-3xl min-h-[350px]">
          <div className="w-20 h-20 rounded-3xl bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto mb-5">
            <Store size={36} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Aucune nouvelle entreprise trouvée à "{ville}"</h3>
          <p className="text-neutral-400 text-sm max-w-md">
            Tous les commerces répertoriés sont déjà enregistrés dans votre CRM ou les filtres actuels sont trop restrictifs.
          </p>
        </div>
      )}
    </div>
  );
}
