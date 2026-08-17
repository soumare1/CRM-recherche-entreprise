import { useState, useMemo } from 'react';
import { useProspectStore } from '../stores/prospectStore';
import { useCampagneStore } from '../stores/campagneStore';
import { useUIStore } from '../stores/uiStore';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Video,
  Phone,
  Building,
  Eye,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Plus,
  CalendarDays,
  UserCheck,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { PIPELINE_STAGES, PRIORITIES } from '../lib/constants';

export default function AgendaPage() {
  const prospects = useProspectStore((state) => state.prospects);
  const activeCampagneId = useCampagneStore((state) => state.activeCampagneId);
  const setSelectedProspect = useUIStore((state) => state.setSelectedProspect);
  const setCallingProspectId = useUIStore((state) => state.setCallingProspectId);
  const openRdvModal = useUIStore((state) => state.openRdvModal);

  // État de la date sélectionnée pour la navigation Mensuelle (Année / Mois)
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11
  const [selectedDateStr, setSelectedDateStr] = useState(today.toISOString().split('T')[0]); // YYYY-MM-DD
  const [filterMode, setFilterMode] = useState('selected_day'); // 'selected_day' | 'full_month'
  const [agendaTypeFilter, setAgendaTypeFilter] = useState('all'); // 'all', 'rdv', 'rappel'

  const campagneProspects = useMemo(() => {
    return prospects.filter((p) => p.campagne_id === activeCampagneId);
  }, [prospects, activeCampagneId]);

  // Tous les événements (RDV qualifiés + Rappels fixés)
  const agendaEvents = useMemo(() => {
    const list = [];
    const baseDate = new Date();

    campagneProspects.forEach((p, index) => {
      // 1. RDV pris
      if (p.pipeline_stage === 'rdv_pris') {
        let dateObj = new Date();
        if (p.prochain_rappel) {
          dateObj = new Date(p.prochain_rappel);
        } else {
          // Simulation réaliste si pas de date fixe saisie
          dateObj.setDate(baseDate.getDate() + (index % 5));
          dateObj.setHours(9 + (index % 7), 0, 0, 0);
        }

        list.push({
          id: `event-rdv-${p.id}`,
          prospect: p,
          type: 'rdv',
          title: `Rendez-vous Démo / Vente - ${p.nom}`,
          date: dateObj,
          mode: index % 2 === 0 ? 'visio' : 'presentiel',
        });
      }
      // 2. Prochains rappels téléphoniques planifiés
      else if (p.prochain_rappel) {
        const dateObj = new Date(p.prochain_rappel);
        list.push({
          id: `event-rappel-${p.id}`,
          prospect: p,
          type: 'rappel',
          title: `Rappel téléphonique - ${p.nom}`,
          date: dateObj,
          mode: 'telephone',
        });
      }
    });

    return list.sort((a, b) => a.date - b.date);
  }, [campagneProspects]);

  // Navigation dans les mois
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDateStr(now.toISOString().split('T')[0]);
    setFilterMode('selected_day');
  };

  // Génération de la grille mensuelle (7 colonnes : Lundi à Dimanche)
  const monthGridDays = useMemo(() => {
    const days = [];
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Décalage du jour de la semaine (Lundi=0, ..., Dimanche=6)
    const startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

    // Jours du mois précédent (remplissage)
    const totalDaysPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const dayNum = totalDaysPrevMonth - i;
      const d = new Date(currentYear, currentMonth - 1, dayNum);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isToday: dateStr === today.toISOString().split('T')[0],
        count: agendaEvents.filter((ev) => ev.date.toISOString().split('T')[0] === dateStr).length,
      });
    }

    // Jours du mois courant
    for (let dayNum = 1; dayNum <= totalDaysInMonth; dayNum++) {
      const d = new Date(currentYear, currentMonth, dayNum);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr,
        dayNum,
        isCurrentMonth: true,
        isToday: dateStr === today.toISOString().split('T')[0],
        count: agendaEvents.filter((ev) => ev.date.toISOString().split('T')[0] === dateStr).length,
      });
    }

    // Jours du mois suivant (compléter la grille jusqu'à 35 ou 42 cases)
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      const d = new Date(currentYear, currentMonth + 1, dayNum);
      const dateStr = d.toISOString().split('T')[0];
      days.push({
        date: d,
        dateStr,
        dayNum,
        isCurrentMonth: false,
        isToday: dateStr === today.toISOString().split('T')[0],
        count: agendaEvents.filter((ev) => ev.date.toISOString().split('T')[0] === dateStr).length,
      });
    }

    return days;
  }, [currentYear, currentMonth, agendaEvents]);

  // Événements filtrés pour la liste du bas
  const filteredEvents = useMemo(() => {
    return agendaEvents.filter((ev) => {
      // Filtrage par type (all, rdv, rappel)
      if (agendaTypeFilter === 'rdv' && ev.type !== 'rdv') return false;
      if (agendaTypeFilter === 'rappel' && ev.type !== 'rappel') return false;

      // Mode : Jour spécifique vs Tout le mois
      if (filterMode === 'selected_day') {
        const evDateStr = ev.date.toISOString().split('T')[0];
        return evDateStr === selectedDateStr;
      } else {
        // Mois complet
        return (
          ev.date.getFullYear() === currentYear &&
          ev.date.getMonth() === currentMonth
        );
      }
    });
  }, [agendaEvents, agendaTypeFilter, filterMode, selectedDateStr, currentYear, currentMonth]);

  // Statistiques du mois sélectionné
  const monthStats = useMemo(() => {
    const monthEvents = agendaEvents.filter(
      (ev) => ev.date.getFullYear() === currentYear && ev.date.getMonth() === currentMonth
    );
    const totalRDVs = monthEvents.filter((e) => e.type === 'rdv').length;
    const totalValue = monthEvents
      .filter((e) => e.type === 'rdv')
      .reduce((sum, e) => sum + (Number(e.prospect.montant_estime) || 0), 0);

    return { totalEvents: monthEvents.length, totalRDVs, totalValue };
  }, [agendaEvents, currentYear, currentMonth]);

  // Libellé du mois et année en français (ex: "Août 2026")
  const currentMonthLabel = useMemo(() => {
    const d = new Date(currentYear, currentMonth, 1);
    const monthName = d.toLocaleDateString('fr-FR', { month: 'long' });
    return monthName.charAt(0).toUpperCase() + monthName.slice(1) + ' ' + currentYear;
  }, [currentYear, currentMonth]);

  // Libellé de la date sélectionnée (ex: "Mardi 25 Août 2026")
  const selectedDateLabel = useMemo(() => {
    if (!selectedDateStr) return '';
    const parts = selectedDateStr.split('-');
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }, [selectedDateStr]);

  if (!activeCampagneId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-3">
        <Building size={48} className="text-neutral-600" />
        <p className="text-base font-medium">Sélectionnez ou créez une campagne pour voir votre agenda.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto space-y-5 pb-8">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            Agenda Commercial
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {agendaEvents.length} événements au total
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Vue mensuelle interactive & liste chronologique des rendez-vous et relances
          </p>
        </div>

        <button
          onClick={() => openRdvModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Planifier un RDV</span>
        </button>
      </div>

      {/* Cartes Métriques Synthèse du mois */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <CalendarDays size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400 font-medium">RDV Qualifiés ({currentMonthLabel.split(' ')[0]})</div>
            <div className="text-xl font-black text-white">{monthStats.totalRDVs}</div>
          </div>
        </div>

        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400 font-medium">Portefeuille du Mois</div>
            <div className="text-xl font-black text-emerald-400">
              {monthStats.totalValue.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-[#121212] border border-[#262626] rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
            <UserCheck size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400 font-medium">Événements du Mois</div>
            <div className="text-base font-bold text-violet-300 mt-0.5">
              {monthStats.totalEvents} planifié(s)
            </div>
          </div>
        </div>
      </div>

      {/* ── CALENDRIER MENSUEL GRILLE (Full Month View) ── */}
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 shadow-xl space-y-4">
        {/* Navigation du mois */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <CalendarIcon size={20} className="text-blue-400" />
              {currentMonthLabel}
            </h2>
            {filterMode === 'selected_day' && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {selectedDateLabel}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 bg-[#181818] hover:bg-[#262626] text-neutral-300 hover:text-white rounded-xl border border-[#333] transition-all cursor-pointer flex items-center gap-1 text-xs font-medium"
              title="Mois précédent"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">Mois préc.</span>
            </button>

            <button
              onClick={handleGoToToday}
              className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-bold rounded-xl border border-blue-500/30 transition-all cursor-pointer"
            >
              Aujourd'hui
            </button>

            <button
              onClick={handleNextMonth}
              className="p-2 bg-[#181818] hover:bg-[#262626] text-neutral-300 hover:text-white rounded-xl border border-[#333] transition-all cursor-pointer flex items-center gap-1 text-xs font-medium"
              title="Mois suivant"
            >
              <span className="hidden sm:inline">Mois suiv.</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Jours de la semaine Header */}
        <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold text-neutral-500 uppercase tracking-wider py-1 border-b border-[#222]">
          <div>Lun</div>
          <div>Mar</div>
          <div>Mer</div>
          <div>Jeu</div>
          <div>Ven</div>
          <div>Sam</div>
          <div>Dim</div>
        </div>

        {/* Grille Mensuelle des jours */}
        <div className="grid grid-cols-7 gap-1.5">
          {monthGridDays.map((dayObj, idx) => {
            const isSelected = selectedDateStr === dayObj.dateStr && filterMode === 'selected_day';

            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedDateStr(dayObj.dateStr);
                  setFilterMode('selected_day');
                }}
                className={`min-h-[56px] sm:min-h-[64px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between items-start relative ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-600/20 ring-2 ring-blue-500/50'
                    : dayObj.isToday
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 font-bold'
                    : dayObj.isCurrentMonth
                    ? 'bg-[#181818] border-[#242424] text-neutral-300 hover:border-neutral-600 hover:bg-[#222]'
                    : 'bg-[#101010] border-[#1c1c1c] text-neutral-600 hover:text-neutral-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-blue-300' : ''}`}>
                    {dayObj.dayNum}
                  </span>
                  {dayObj.isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                  )}
                </div>

                {/* Badge d'événements pour ce jour */}
                {dayObj.count > 0 && (
                  <div className="mt-1 w-full">
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded-md w-full justify-center ${
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {dayObj.count} RDV
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── BARRE DE FILTRES ET LISTE CHRONOLOGIQUE DES RDV ── */}
      <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 shadow-xl space-y-4 flex-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#222] pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock size={18} className="text-blue-400" />
              {filterMode === 'selected_day'
                ? `Rendez-vous du ${selectedDateLabel}`
                : `Tous les rendez-vous de ${currentMonthLabel}`}
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Liste triée par ordre chronologique ({filteredEvents.length} résultat{filteredEvents.length > 1 ? 's' : ''})
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Mode d'affichage (Jour vs Mois complet) */}
            <div className="flex bg-[#181818] p-1 rounded-xl border border-[#333] text-xs">
              <button
                onClick={() => setFilterMode('selected_day')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterMode === 'selected_day'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Jour sélectionné
              </button>
              <button
                onClick={() => setFilterMode('full_month')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  filterMode === 'full_month'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Tout le mois
              </button>
            </div>

            {/* Filtre Type (Tous, RDV Vente, Rappels) */}
            <div className="flex bg-[#181818] p-1 rounded-xl border border-[#333] text-xs">
              <button
                onClick={() => setAgendaTypeFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  agendaTypeFilter === 'all'
                    ? 'bg-[#2a2a2a] text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setAgendaTypeFilter('rdv')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  agendaTypeFilter === 'rdv'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                RDV
              </button>
              <button
                onClick={() => setAgendaTypeFilter('rappel')}
                className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  agendaTypeFilter === 'rappel'
                    ? 'bg-violet-600/30 text-violet-300 border border-violet-500/30'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Rappels
              </button>
            </div>
          </div>
        </div>

        {/* ── LISTE CHRONOLOGIQUE DES ÉVÉNEMENTS ── */}
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <CalendarIcon size={24} />
              </div>
              <h4 className="text-sm font-bold text-white">Aucun événement trouvé</h4>
              <p className="text-xs text-neutral-400 max-w-sm">
                {filterMode === 'selected_day'
                  ? `Aucun rendez-vous ou rappel programmé pour le ${selectedDateLabel}.`
                  : `Aucun rendez-vous ou rappel trouvé dans tout le mois de ${currentMonthLabel}.`}
              </p>
              <button
                onClick={() => openRdvModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer mt-1"
              >
                <Plus size={14} /> Planifier un nouveau rendez-vous
              </button>
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const { prospect } = ev;
              const stageInfo =
                PIPELINE_STAGES.find((s) => s.id === prospect.pipeline_stage) || PIPELINE_STAGES[0];
              const priorityObj =
                PRIORITIES.find((pr) => pr.value === prospect.priorite) || PRIORITIES[0];

              const formattedDate = ev.date.toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              });
              const formattedTime = ev.date.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedProspect(prospect.id)}
                  className="bg-[#161616] border border-[#262626] hover:border-blue-500/50 rounded-2xl p-4 transition-all cursor-pointer group shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  {/* Bloc Date & Heure */}
                  <div className="flex items-center gap-3.5 shrink-0">
                    <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                      <span className="text-[10px] text-blue-300 font-bold uppercase">
                        {formattedDate}
                      </span>
                      <span className="text-base font-black my-0.5">{formattedTime}</span>
                      <span className="text-[9px] text-blue-400 font-extrabold uppercase">
                        {ev.type === 'rdv' ? 'RDV Démo' : 'Rappel'}
                      </span>
                    </div>

                    {/* Mode (Visio / Présentiel / Tél) */}
                    <div className="space-y-1">
                      {ev.mode === 'visio' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Video size={13} /> Visioconférence
                        </span>
                      )}
                      {ev.mode === 'presentiel' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <MapPin size={13} /> Sur place
                        </span>
                      )}
                      {ev.mode === 'telephone' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          <Phone size={13} /> Appel de suivi
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Infos Prospect & Montant */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-black text-white group-hover:text-blue-400 transition-colors">
                        {prospect.nom}
                      </h3>
                      <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${stageInfo.color}`}>
                        {stageInfo.label}
                      </span>
                      {priorityObj.value > 0 && (
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold rounded border ${priorityObj.color}`}>
                          {priorityObj.label}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                      <span>{prospect.secteur || 'Secteur non défini'}</span>
                      {prospect.telephone && (
                        <span className="flex items-center gap-1 text-neutral-300 font-mono">
                          <Phone size={12} className="text-blue-400" />
                          {prospect.telephone}
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
                  </div>

                  {/* Actions Rapides */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#262626] w-full md:w-auto justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCallingProspectId(prospect.id);
                      }}
                      className="p-2.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl transition-all border border-blue-500/30 cursor-pointer"
                      title="Lancer l'appel"
                    >
                      <Phone size={15} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProspect(prospect.id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#202020] hover:bg-[#2a2a2a] text-neutral-300 hover:text-white text-xs font-bold rounded-xl border border-[#333] transition-all cursor-pointer"
                    >
                      <Eye size={14} />
                      Fiche Prospect
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
