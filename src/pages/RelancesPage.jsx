import { useState, useMemo } from 'react';
import { useProspectStore } from '../stores/prospectStore';
import { useCampagneStore } from '../stores/campagneStore';
import { useUIStore } from '../stores/uiStore';
import {
  Phone,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  Flame,
  CheckCircle2,
  Building,
  Eye,
  CalendarPlus,
  ArrowRight,
  TrendingUp,
  MapPin,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Plus,
  Filter,
} from 'lucide-react';
import { PIPELINE_STAGES, PRIORITIES } from '../lib/constants';

export default function RelancesPage() {
  const prospects = useProspectStore((state) => state.prospects);
  const updateProspect = useProspectStore((state) => state.updateProspect);
  const updateProspectStage = useProspectStore((state) => state.updateProspectStage);
  const activeCampagneId = useCampagneStore((state) => state.activeCampagneId);
  const setSelectedProspect = useUIStore((state) => state.setSelectedProspect);
  const setCallingProspectId = useUIStore((state) => state.setCallingProspectId);
  const openRdvModal = useUIStore((state) => state.openRdvModal);

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'overdue', 'today', 'upcoming', 'stale'
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  // Mois courant pour la vue mini-calendrier
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState(today.toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'

  const campagneProspects = useMemo(() => {
    return prospects.filter((p) => p.campagne_id === activeCampagneId);
  }, [prospects, activeCampagneId]);

  const now = new Date();

  const getIsoDateStr = (dateVal) => {
    if (!dateVal) return '';
    if (typeof dateVal === 'string') {
      return dateVal.includes('T') ? dateVal.split('T')[0] : dateVal;
    }
    try {
      return new Date(dateVal).toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // Traitement & Catégorisation intelligente des relances
  const categorizedRelances = useMemo(() => {
    const todayStr = now.toISOString().split('T')[0];

    const overdue = [];
    const todayList = [];
    const upcoming = [];
    const stale = [];

    campagneProspects.forEach((p) => {
      // Écarter les prospects signés ou perdus de la file de relance active
      if (p.pipeline_stage === 'signe' || p.pipeline_stage === 'pas_interesse') return;

      // Cas 1 : Date de prochain rappel spécifiée
      if (p.prochain_rappel) {
        const rappelDate = new Date(p.prochain_rappel);
        const rappelStr = getIsoDateStr(p.prochain_rappel);

        const diffDays = Math.ceil((now - rappelDate) / (1000 * 60 * 60 * 24));

        if (rappelStr < todayStr) {
          overdue.push({ ...p, relanceType: 'overdue', diffDays });
        } else if (rappelStr === todayStr) {
          todayList.push({ ...p, relanceType: 'today', diffDays: 0 });
        } else {
          upcoming.push({ ...p, relanceType: 'upcoming', diffDays: -diffDays });
        }
      }
      // Cas 2 : Statut à relancer ("pas décroché", "à rappeler") sans date fixe
      else if (['pas_decroche', 'a_rappeler'].includes(p.pipeline_stage)) {
        if (!p.dernier_contact) {
          stale.push({ ...p, relanceType: 'stale', diffDays: 999 });
        } else {
          const diffTime = Math.abs(now - new Date(p.dernier_contact));
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays >= 2) {
            stale.push({ ...p, relanceType: 'stale', diffDays });
          }
        }
      }
    });

    // Fonction de tri par priorité puis par ancienneté/urgence
    const sorter = (a, b) => {
      if ((b.priorite || 0) !== (a.priorite || 0)) return (b.priorite || 0) - (a.priorite || 0);
      return (b.diffDays || 0) - (a.diffDays || 0);
    };

    overdue.sort(sorter);
    todayList.sort(sorter);
    upcoming.sort((a, b) => new Date(a.prochain_rappel) - new Date(b.prochain_rappel));
    stale.sort(sorter);

    const all = [...overdue, ...todayList, ...stale, ...upcoming];

    return { all, overdue, today: todayList, upcoming, stale };
  }, [campagneProspects]);

  // Liste des relances filtrées selon l'onglet, la recherche et le filtre d'étape
  const filteredRelances = useMemo(() => {
    let baseList = categorizedRelances.all;
    if (activeTab === 'overdue') baseList = categorizedRelances.overdue;
    else if (activeTab === 'today') baseList = categorizedRelances.today;
    else if (activeTab === 'upcoming') baseList = categorizedRelances.upcoming;
    else if (activeTab === 'stale') baseList = categorizedRelances.stale;
    else if (activeTab === 'date_filter') {
      baseList = categorizedRelances.all.filter(
        (p) => p.prochain_rappel && getIsoDateStr(p.prochain_rappel) === selectedDateStr
      );
    }

    return baseList.filter((p) => {
      // Filtrage par mot-clé
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = p.nom?.toLowerCase().includes(query);
        const matchPhone = p.telephone?.toLowerCase().includes(query);
        const matchSecteur = p.secteur?.toLowerCase().includes(query);
        if (!matchName && !matchPhone && !matchSecteur) return false;
      }
      // Filtrage par étape
      if (stageFilter !== 'all' && p.pipeline_stage !== stageFilter) return false;

      return true;
    });
  }, [activeTab, categorizedRelances, searchTerm, stageFilter, selectedDateStr]);

  // Génération de la grille mensuelle pour le calendrier de relance
  const monthGridDays = useMemo(() => {
    const days = [];
    const firstDay = new Date(currentYear, currentMonth, 1);
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startDayOfWeek = (firstDay.getDay() + 6) % 7;

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth, -i);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayNum: d.getDate(),
        isCurrentMonth: false,
        count: campagneProspects.filter((p) => p.prochain_rappel && getIsoDateStr(p.prochain_rappel) === dateStr).length,
      });
    }

    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const d = new Date(currentYear, currentMonth, dayNum);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: true,
        isToday: dateStr === today.toISOString().split('T')[0],
        count: campagneProspects.filter((p) => p.prochain_rappel && getIsoDateStr(p.prochain_rappel) === dateStr).length,
      });
    }

    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      const d = new Date(currentYear, currentMonth + 1, dayNum);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        count: campagneProspects.filter((p) => p.prochain_rappel && getIsoDateStr(p.prochain_rappel) === dateStr).length,
      });
    }

    return days;
  }, [currentYear, currentMonth, campagneProspects]);

  // Action rapide de report (+1j, +3j, +7j)
  const handleQuickPostpone = (e, prospectId, daysToAdd) => {
    e.stopPropagation();
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + daysToAdd);
    const isoString = newDate.toISOString().split('T')[0];

    updateProspect(prospectId, {
      prochain_rappel: isoString,
    });
  };

  const currentMonthLabel = useMemo(() => {
    const d = new Date(currentYear, currentMonth, 1);
    const monthName = d.toLocaleDateString('fr-FR', { month: 'long' });
    return monthName.charAt(0).toUpperCase() + monthName.slice(1) + ' ' + currentYear;
  }, [currentYear, currentMonth]);

  if (!activeCampagneId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-3">
        <Building size={48} className="text-neutral-600" />
        <p className="text-base font-medium">Sélectionnez ou créez une campagne pour gérer vos relances.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto space-y-5 pb-8">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Centre de Relances Commerciales
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {categorizedRelances.all.length} à traiter
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Planning intelligent des rappels, relances téléphoniques et opportunités en attente
          </p>
        </div>

        {/* Indicateur d'urgence */}
        {categorizedRelances.overdue.length > 0 && (
          <div className="bg-red-500/10 text-red-400 px-3.5 py-2 rounded-xl border border-red-500/20 flex items-center gap-2 text-xs font-bold shadow-md animate-pulse">
            <AlertCircle size={16} />
            <span>{categorizedRelances.overdue.length} relance(s) en retard !</span>
          </div>
        )}
      </div>

      {/* Cartes Métriques d'Action */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => {
            setActiveTab('overdue');
            setViewMode('list');
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'overdue'
              ? 'bg-red-500/10 border-red-500 text-white shadow-lg shadow-red-500/10'
              : 'bg-[#121212] border-[#262626] text-neutral-400 hover:border-red-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold">En retard</span>
            <AlertCircle size={16} className="text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400">{categorizedRelances.overdue.length}</div>
        </button>

        <button
          onClick={() => {
            setActiveTab('today');
            setViewMode('list');
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'today'
              ? 'bg-amber-500/10 border-amber-500 text-white shadow-lg shadow-amber-500/10'
              : 'bg-[#121212] border-[#262626] text-neutral-400 hover:border-amber-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold">Prévus Aujourd'hui</span>
            <CalendarIcon size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{categorizedRelances.today.length}</div>
        </button>

        <button
          onClick={() => {
            setActiveTab('stale');
            setViewMode('list');
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'stale'
              ? 'bg-violet-500/10 border-violet-500 text-white shadow-lg shadow-violet-500/10'
              : 'bg-[#121212] border-[#262626] text-neutral-400 hover:border-violet-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold">Sans contact (&gt;2j)</span>
            <Clock size={16} className="text-violet-400" />
          </div>
          <div className="text-2xl font-black text-violet-400">{categorizedRelances.stale.length}</div>
        </button>

        <button
          onClick={() => {
            setActiveTab('upcoming');
            setViewMode('list');
          }}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-blue-500/10 border-blue-500 text-white shadow-lg shadow-blue-500/10'
              : 'bg-[#121212] border-[#262626] text-neutral-400 hover:border-blue-500/40'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold">À venir</span>
            <CalendarDays size={16} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{categorizedRelances.upcoming.length}</div>
        </button>
      </div>

      {/* Barre de Recherche, Filtres d'Étape & Toggle de Vue */}
      <div className="bg-[#121212] border border-[#262626] p-3 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2 flex-1">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher une relance (nom, tél, secteur)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#181818] border border-[#333] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Filtre d'étape */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 bg-[#181818] border border-[#333] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="all">Toutes les étapes</option>
            {PIPELINE_STAGES.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bascule Mode de Vue (Liste vs Calendrier) */}
        <div className="flex bg-[#181818] p-1 rounded-xl border border-[#333] text-xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'list' ? 'bg-amber-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Vue Liste
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'calendar' ? 'bg-amber-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Calendrier Mensuel
          </button>
        </div>
      </div>

      {/* ── MODE CALENDRIER DE RELANCES ── */}
      {viewMode === 'calendar' && (
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <CalendarIcon size={18} className="text-amber-400" />
              Planning des Relances - {currentMonthLabel}
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear((y) => y - 1);
                  } else {
                    setCurrentMonth((m) => m - 1);
                  }
                }}
                className="p-1.5 bg-[#181818] hover:bg-[#262626] text-neutral-300 rounded-lg border border-[#333] cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => {
                  setCurrentYear(today.getFullYear());
                  setCurrentMonth(today.getMonth());
                }}
                className="px-2.5 py-1 bg-amber-600/20 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/30 cursor-pointer"
              >
                Mois Actuel
              </button>
              <button
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear((y) => y + 1);
                  } else {
                    setCurrentMonth((m) => m + 1);
                  }
                }}
                className="p-1.5 bg-[#181818] hover:bg-[#262626] text-neutral-300 rounded-lg border border-[#333] cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold text-neutral-500 uppercase tracking-wider py-1 border-b border-[#222]">
            <div>Lun</div>
            <div>Mar</div>
            <div>Mer</div>
            <div>Jeu</div>
            <div>Ven</div>
            <div>Sam</div>
            <div>Dim</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {monthGridDays.map((d, idx) => {
              const isSelected = selectedDateStr === d.dateStr && activeTab === 'date_filter';

              return (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedDateStr(d.dateStr);
                    setActiveTab('date_filter');
                    setViewMode('list');
                  }}
                  className={`min-h-[50px] p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between items-start ${
                    isSelected
                      ? 'bg-amber-600/20 border-amber-500 text-white ring-2 ring-amber-500/50'
                      : d.isToday
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold'
                      : d.isCurrentMonth
                      ? 'bg-[#181818] border-[#242424] text-neutral-300 hover:border-neutral-600'
                      : 'bg-[#101010] border-[#1c1c1c] text-neutral-600'
                  }`}
                >
                  <span className="text-xs font-bold">{d.dayNum}</span>
                  {d.count > 0 && (
                    <span className="px-1 py-0.5 text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded w-full text-center">
                      {d.count} relance{d.count > 1 ? 's' : ''}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Onglets de statut pour la liste */}
      <div className="flex items-center gap-1 bg-[#121212] border border-[#262626] p-1.5 rounded-2xl overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'all' ? 'bg-amber-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Toutes ({categorizedRelances.all.length})
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overdue' ? 'bg-red-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
          }`}
        >
          En retard ({categorizedRelances.overdue.length})
        </button>
        <button
          onClick={() => setActiveTab('today')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'today' ? 'bg-amber-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Aujourd'hui ({categorizedRelances.today.length})
        </button>
        <button
          onClick={() => setActiveTab('stale')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'stale' ? 'bg-violet-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Non contactés ({categorizedRelances.stale.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'upcoming' ? 'bg-blue-600 text-white shadow-md' : 'text-neutral-400 hover:text-white'
          }`}
        >
          À venir ({categorizedRelances.upcoming.length})
        </button>
      </div>

      {/* ── LISTE INTERCONNECTÉE DES RELANCES ── */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
        {filteredRelances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-[#121212] rounded-2xl border border-[#262626] text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-base font-bold text-white">Aucune relance à afficher</h3>
            <p className="text-xs text-neutral-400 max-w-sm">
              Tout est à jour dans cette catégorie pour votre campagne active.
            </p>
          </div>
        ) : (
          filteredRelances.map((prospect) => {
            const stageInfo = PIPELINE_STAGES.find((s) => s.id === prospect.pipeline_stage) || PIPELINE_STAGES[0];
            const priorityObj = PRIORITIES.find((pr) => pr.value === prospect.priorite) || PRIORITIES[0];

            return (
              <div
                key={prospect.id}
                onClick={() => setSelectedProspect(prospect.id)}
                className="bg-[#121212] border border-[#262626] hover:border-amber-500/50 rounded-2xl p-5 transition-all cursor-pointer group shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Infos Prospect */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-black text-white group-hover:text-amber-400 transition-colors">
                      {prospect.nom}
                    </h3>

                    {/* Changeur rapide d'étape du pipeline */}
                    <select
                      value={prospect.pipeline_stage}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateProspectStage(prospect.id, e.target.value);
                      }}
                      className={`text-[11px] font-bold rounded px-2 py-0.5 border bg-[#181818] cursor-pointer focus:outline-none ${stageInfo.color}`}
                    >
                      {PIPELINE_STAGES.map((st) => (
                        <option key={st.id} value={st.id} className="bg-[#181818] text-white">
                          {st.label}
                        </option>
                      ))}
                    </select>

                    {priorityObj.value > 0 && (
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${priorityObj.color}`}>
                        {priorityObj.label}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
                    <span className="font-medium">{prospect.secteur || 'Secteur non défini'}</span>
                    {prospect.telephone && (
                      <span className="flex items-center gap-1.5 text-neutral-300 font-mono">
                        <Phone size={13} className="text-amber-400" />
                        {prospect.telephone}
                      </span>
                    )}
                    {prospect.adresse && (
                      <span className="flex items-center gap-1.5 text-neutral-500 truncate max-w-xs">
                        <MapPin size={13} />
                        {prospect.adresse}
                      </span>
                    )}
                    {prospect.montant_estime > 0 && (
                      <span className="font-bold text-emerald-400">
                        {(Number(prospect.montant_estime) || 0).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    )}
                  </div>

                  {prospect.notes && (
                    <div className="text-xs text-neutral-400 bg-[#181818] p-2.5 rounded-xl border border-[#262626] line-clamp-1 italic">
                      "{prospect.notes}"
                    </div>
                  )}
                </div>

                {/* Badge d'urgence & Actions Interconnectées */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#262626]">
                  {/* Urgence Indicator */}
                  {prospect.relanceType === 'overdue' && (
                    <div className="text-xs font-bold text-red-400 flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-xl">
                      <AlertCircle size={14} />
                      En retard de {prospect.diffDays} jour(s)
                    </div>
                  )}
                  {prospect.relanceType === 'today' && (
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl">
                      <CalendarIcon size={14} />
                      Rappel aujourd'hui
                    </div>
                  )}
                  {prospect.relanceType === 'stale' && (
                    <div className="text-xs font-bold text-violet-400 flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-xl">
                      <Clock size={14} />
                      {prospect.diffDays === 999 ? 'Jamais contacté' : `Sans contact depuis ${prospect.diffDays} j`}
                    </div>
                  )}
                  {prospect.relanceType === 'upcoming' && (
                    <div className="text-xs font-bold text-blue-400 flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-xl">
                      <CalendarDays size={14} />
                      Prévu pour le {new Date(prospect.prochain_rappel).toLocaleDateString('fr-FR')}
                    </div>
                  )}

                  {/* Actions Rapides Interconnectées */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Reporter rapide (+1j, +3j, +7j) */}
                    <div className="flex items-center bg-[#181818] rounded-xl border border-[#333] overflow-hidden">
                      <button
                        onClick={(e) => handleQuickPostpone(e, prospect.id, 1)}
                        className="px-2 py-1.5 hover:bg-[#262626] text-neutral-300 hover:text-white text-xs font-semibold transition-all cursor-pointer border-r border-[#333]"
                        title="Reporter de 1 jour"
                      >
                        +1j
                      </button>
                      <button
                        onClick={(e) => handleQuickPostpone(e, prospect.id, 3)}
                        className="px-2 py-1.5 hover:bg-[#262626] text-neutral-300 hover:text-white text-xs font-semibold transition-all cursor-pointer border-r border-[#333]"
                        title="Reporter de 3 jours"
                      >
                        +3j
                      </button>
                      <button
                        onClick={(e) => handleQuickPostpone(e, prospect.id, 7)}
                        className="px-2 py-1.5 hover:bg-[#262626] text-neutral-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                        title="Reporter de 7 jours"
                      >
                        +7j
                      </button>
                    </div>

                    {/* Planifier RDV direct */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openRdvModal(prospect.id);
                      }}
                      className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white text-xs font-bold rounded-xl border border-blue-500/30 transition-all cursor-pointer flex items-center gap-1"
                      title="Fixer un rendez-vous commercial"
                    >
                      <CalendarPlus size={14} />
                      <span className="hidden sm:inline">Fixer RDV</span>
                    </button>

                    {/* Appeler */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCallingProspectId(prospect.id);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
                    >
                      <Phone size={14} />
                      Appeler
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
