import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProspectStore } from '../stores/prospectStore';
import { useCampagneStore } from '../stores/campagneStore';
import { useUIStore } from '../stores/uiStore';
import { usePageStateStore } from '../stores/pageStateStore';
import CustomSelect from '../components/common/CustomSelect';
import {
  Search, Filter, Phone, MapPin, Store, Trash2, Plus,
  ArrowUpDown, Flame, DollarSign, Globe, Calendar, Eye,
  AlertTriangle, UserCheck, Building, CheckSquare, Square,
  X, TrendingUp, ChevronDown,
} from 'lucide-react';
import { PIPELINE_STAGES, SECTEURS, PRIORITIES, STATUTS_WEB } from '../lib/constants';

export default function ProspectsPage() {
  const navigate = useNavigate();
  const prospects = useProspectStore((state) => state.prospects);
  const deleteProspect = useProspectStore((state) => state.deleteProspect);
  const updateProspect = useProspectStore((state) => state.updateProspect);
  const updateProspectStage = useProspectStore((state) => state.updateProspectStage);
  const activeCampagneId = useCampagneStore((state) => state.activeCampagneId);
  const setSelectedProspect = useUIStore((state) => state.setSelectedProspect);
  const setCallingProspectId = useUIStore((state) => state.setCallingProspectId);
  const openConfirmModal = useUIStore((state) => state.openConfirmModal);
  const openAddProspectModal = useUIStore((state) => state.openAddProspectModal);

  const { prospects: prospectsList } = usePageStateStore();
  const setProspectsState = usePageStateStore((s) => s.setProspectsState);
  const { search, stageFilter, secteurFilter } = prospectsList;

  const [quickFilter, setQuickFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // ── Multi-select state ─────────────────────────────────────────────────────
  const [selected, setSelected] = useState(new Set());
  const [bulkStage, setBulkStage] = useState('');
  const [showBulkStage, setShowBulkStage] = useState(false);

  const setSearch = (v) => setProspectsState({ search: v });
  const setStageFilter = (v) => setProspectsState({ stageFilter: v });
  const setSecteurFilter = (v) => setProspectsState({ secteurFilter: v });

  const campagneProspects = useMemo(() =>
    prospects.filter((p) => p.campagne_id === activeCampagneId),
    [prospects, activeCampagneId]
  );

  const secteursPresents = useMemo(() =>
    SECTEURS.filter((s) =>
      campagneProspects.some((p) => p.secteur_id === s.id || p.secteur === s.label)
    ), [campagneProspects]
  );

  const stats = useMemo(() => {
    const total = campagneProspects.length;
    const hotDeals = campagneProspects.filter((p) =>
      ['rdv_pris', 'devis_envoye', 'negoce'].includes(p.pipeline_stage)
    ).length;
    const totalValue = campagneProspects.reduce((sum, p) => sum + (Number(p.montant_estime) || 0), 0);
    const noSiteCount = campagneProspects.filter((p) => p.statut_web === 'aucun_site').length;
    return { total, hotDeals, totalValue, noSiteCount };
  }, [campagneProspects]);

  const filteredProspects = useMemo(() => {
    return campagneProspects
      .filter((p) => {
        const matchesSearch =
          p.nom.toLowerCase().includes(search.toLowerCase()) ||
          (p.telephone && p.telephone.includes(search)) ||
          (p.secteur && p.secteur.toLowerCase().includes(search.toLowerCase()));
        const matchesStage = stageFilter === 'all' || p.pipeline_stage === stageFilter;
        const matchesSecteur =
          secteurFilter === 'all' ||
          p.secteur_id === secteurFilter ||
          p.secteur === SECTEURS.find((s) => s.id === secteurFilter)?.label;
        let matchesQuick = true;
        if (quickFilter === 'hot') matchesQuick = ['rdv_pris', 'devis_envoye', 'negoce'].includes(p.pipeline_stage);
        else if (quickFilter === 'no_site') matchesQuick = p.statut_web === 'aucun_site';
        else if (quickFilter === 'urgent') matchesQuick = p.priorite === 2 || p.priorite === 1;
        return matchesSearch && matchesStage && matchesSecteur && matchesQuick;
      })
      .sort((a, b) => {
        const mod = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'montant') return ((Number(a.montant_estime) || 0) - (Number(b.montant_estime) || 0)) * mod;
        if (sortBy === 'priorite') return ((b.priorite || 0) - (a.priorite || 0)) * mod;
        if (sortBy === 'nom') return a.nom.localeCompare(b.nom) * mod;
        return (new Date(b.updated_at || 0) - new Date(a.updated_at || 0)) * mod;
      });
  }, [campagneProspects, search, stageFilter, secteurFilter, quickFilter, sortBy, sortOrder]);

  // ── Selection helpers ──────────────────────────────────────────────────────
  const allSelected = filteredProspects.length > 0 && selected.size === filteredProspects.length;
  const someSelected = selected.size > 0;

  const toggleSelect = (id, e) => {
    e.stopPropagation();
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (e) => {
    e.stopPropagation();
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredProspects.map(p => p.id)));
    }
  };

  const clearSelection = () => setSelected(new Set());

  // ── Bulk actions ───────────────────────────────────────────────────────────
  const handleBulkDelete = () => {
    openConfirmModal({
      title: `Supprimer ${selected.size} prospect${selected.size > 1 ? 's' : ''}`,
      message: `Cette action est irréversible. Les ${selected.size} prospects sélectionnés seront définitivement supprimés.`,
      confirmText: 'Supprimer',
      onConfirm: () => {
        selected.forEach(id => deleteProspect(id));
        clearSelection();
      },
    });
  };

  const handleBulkStageChange = (stage) => {
    if (!stage) return;
    selected.forEach(id => updateProspectStage(id, stage));
    clearSelection();
    setShowBulkStage(false);
    setBulkStage('');
  };

  if (!activeCampagneId) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-3">
        <Building size={48} className="text-neutral-600" />
        <p className="text-base font-medium">Sélectionnez ou créez une campagne pour afficher vos prospects.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto space-y-5 pb-6">

      {/* En-tête */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Gestion des Prospects
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              {campagneProspects.length}
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">Base de contacts qualifiés et opportunités de vente</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/recherche')}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#181818] hover:bg-[#222] border border-[#333] text-neutral-300 hover:text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Search size={14} className="text-violet-400" />
            Détecter nouveaux prospects
          </button>
          <button
            onClick={() => openAddProspectModal('a_contacter')}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-600/20 transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Nouveau Prospect</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20"><UserCheck size={20} /></div>
          <div><div className="text-xs text-neutral-400 font-medium">Total Prospects</div><div className="text-xl font-black text-white">{stats.total}</div></div>
        </div>
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20"><Flame size={20} /></div>
          <div><div className="text-xs text-neutral-400 font-medium">Deals Chauds</div><div className="text-xl font-black text-amber-400">{stats.hotDeals}</div></div>
        </div>
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20"><DollarSign size={20} /></div>
          <div>
            <div className="text-xs text-neutral-400 font-medium">Valeur Pipeline</div>
            <div className="text-xl font-black text-emerald-400">{stats.totalValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</div>
          </div>
        </div>
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20"><Globe size={20} /></div>
          <div><div className="text-xs text-neutral-400 font-medium">Sans Site Web</div><div className="text-xl font-black text-red-400">{stats.noSiteCount}</div></div>
        </div>
      </div>

      {/* Filtres */}
      <div className="p-3 bg-[#121212] border border-[#262626] rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, téléphone, secteur..."
              className="w-full pl-9 pr-3 py-1.5 bg-[#181818] border border-[#333] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-1 bg-[#181818] border border-[#262626] rounded-xl p-1">
            {[
              { id: 'all', label: 'Tous', activeClass: 'bg-violet-600 text-white' },
              { id: 'hot', label: '🔥 Chauds', activeClass: 'bg-amber-500 text-black' },
              { id: 'no_site', label: 'Sans site', activeClass: 'bg-red-500/20 text-red-400 border border-red-500/30' },
              { id: 'urgent', label: 'Priorité', activeClass: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' },
            ].map(f => (
              <button key={f.id} onClick={() => setQuickFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${quickFilter === f.id ? f.activeClass : 'text-neutral-400 hover:text-white'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-44">
            <CustomSelect value={stageFilter} onChange={setStageFilter}
              options={[{ value: 'all', label: 'Tous les statuts' }, ...PIPELINE_STAGES.map(s => ({ value: s.id, label: s.label, color: s.color }))]}
              icon={Filter} size="sm" />
          </div>
          <div className="w-48">
            <CustomSelect value={secteurFilter} onChange={setSecteurFilter}
              options={[{ value: 'all', label: 'Tous les secteurs' }, ...secteursPresents.map(s => ({ value: s.id, label: s.label }))]}
              icon={Store} searchable size="sm" />
          </div>
          <div className="w-40">
            <CustomSelect value={sortBy} onChange={setSortBy}
              options={[{ value: 'updated_at', label: 'Récent' }, { value: 'montant', label: 'Valeur (€)' }, { value: 'priorite', label: 'Priorité' }, { value: 'nom', label: 'Nom A-Z' }]}
              icon={ArrowUpDown} size="sm" />
          </div>
          {(stageFilter !== 'all' || secteurFilter !== 'all' || search || quickFilter !== 'all') && (
            <button onClick={() => { setSearch(''); setStageFilter('all'); setSecteurFilter('all'); setQuickFilter('all'); }}
              className="text-xs text-violet-400 hover:underline px-2 py-1 shrink-0 font-medium">
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* ── Barre d'actions groupées (apparaît quand sélection active) ── */}
      {someSelected && (
        <div className="flex items-center gap-3 px-4 py-3 bg-violet-600/10 border border-violet-500/30 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-violet-600 flex items-center justify-center">
              <CheckSquare size={13} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white">
              {selected.size} prospect{selected.size > 1 ? 's' : ''} sélectionné{selected.size > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex-1 h-px bg-violet-500/20" />

          {/* Changer étape */}
          <div className="relative">
            <button
              onClick={() => setShowBulkStage(v => !v)}
              className="flex items-center gap-2 px-3.5 py-2 bg-[#1a1a2e] hover:bg-[#22223a] border border-violet-500/40 text-violet-300 text-xs font-semibold rounded-xl transition-all"
            >
              <TrendingUp size={14} />
              Changer étape
              <ChevronDown size={13} className={`transition-transform ${showBulkStage ? 'rotate-180' : ''}`} />
            </button>
            {showBulkStage && (
              <div className="absolute top-full mt-2 left-0 z-50 bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl overflow-hidden min-w-[220px]">
                {PIPELINE_STAGES.map(stage => (
                  <button key={stage.id} onClick={() => handleBulkStageChange(stage.id)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors">
                    <span className={`w-2 h-2 rounded-full ${stage.color.split(' ')[0]}`} />
                    {stage.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Supprimer */}
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 text-xs font-semibold rounded-xl transition-all"
          >
            <Trash2 size={14} />
            Supprimer ({selected.size})
          </button>

          {/* Annuler sélection */}
          <button onClick={clearSelection}
            className="p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-xl transition-all"
            title="Annuler la sélection">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tableau */}
      <div className="flex-1 bg-[#121212] border border-[#262626] rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[420px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-900/90 border-b border-[#262626] text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
                {/* Checkbox tout sélectionner */}
                <th className="px-4 py-3.5 w-10">
                  <button onClick={toggleSelectAll} className="text-neutral-500 hover:text-violet-400 transition-colors">
                    {allSelected
                      ? <CheckSquare size={17} className="text-violet-400" />
                      : someSelected
                        ? <div className="w-[17px] h-[17px] rounded border-2 border-violet-400 bg-violet-400/20 flex items-center justify-center"><div className="w-2 h-0.5 bg-violet-400 rounded" /></div>
                        : <Square size={17} />
                    }
                  </button>
                </th>
                <th className="px-5 py-3.5">Entreprise & Secteur</th>
                <th className="px-5 py-3.5">Étape Pipeline</th>
                <th className="px-5 py-3.5">Présence Web</th>
                <th className="px-5 py-3.5 text-right">Valeur Estimée</th>
                <th className="px-5 py-3.5">Prochain Rappel</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]/70">
              {filteredProspects.length > 0 ? (
                filteredProspects.map((prospect) => {
                  const stageObj = PIPELINE_STAGES.find((s) => s.id === prospect.pipeline_stage) || PIPELINE_STAGES[0];
                  const priorityObj = PRIORITIES.find((pr) => pr.value === prospect.priorite) || PRIORITIES[0];
                  const webObj = STATUTS_WEB.find((w) => w.id === prospect.statut_web) || STATUTS_WEB[0];
                  const isSelected = selected.has(prospect.id);

                  return (
                    <tr
                      key={prospect.id}
                      onClick={() => setSelectedProspect(prospect.id)}
                      className={`transition-colors group cursor-pointer ${isSelected ? 'bg-violet-500/8 border-l-2 border-l-violet-500' : 'hover:bg-neutral-800/40'}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3.5" onClick={(e) => toggleSelect(prospect.id, e)}>
                        <div className="flex items-center justify-center">
                          {isSelected
                            ? <CheckSquare size={17} className="text-violet-400" />
                            : <Square size={17} className="text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                          }
                        </div>
                      </td>

                      {/* Entreprise & Secteur */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white group-hover:text-violet-300 transition-colors text-sm">{prospect.nom}</span>
                          {priorityObj.value > 0 && (
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${priorityObj.color}`}>{priorityObj.label}</span>
                          )}
                        </div>
                        <div className="text-neutral-400 flex items-center gap-2 mt-1">
                          <span className="text-neutral-400 font-medium">{prospect.secteur || 'Secteur inconnu'}</span>
                          {prospect.telephone && <span className="text-neutral-500">• {prospect.telephone}</span>}
                          {prospect.adresse && <span className="text-neutral-500 truncate max-w-[180px]">• {prospect.adresse}</span>}
                        </div>
                      </td>

                      {/* Étape Pipeline */}
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="w-44">
                          <CustomSelect
                            value={prospect.pipeline_stage}
                            onChange={(val) => updateProspectStage(prospect.id, val)}
                            options={PIPELINE_STAGES.map((s) => ({ value: s.id, label: s.label, color: s.color }))}
                            size="sm"
                          />
                        </div>
                      </td>

                      {/* Présence Web */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex px-2.5 py-0.5 rounded text-[11px] font-semibold border ${webObj.color}`}>
                          {webObj.label}
                        </span>
                      </td>

                      {/* Valeur */}
                      <td className="px-5 py-3.5 text-right font-black text-emerald-400 text-sm">
                        {(Number(prospect.montant_estime) || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                      </td>

                      {/* Prochain Rappel */}
                      <td className="px-5 py-3.5 text-neutral-400">
                        {prospect.prochain_rappel ? (
                          <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                            <Calendar size={12} />
                            {new Date(prospect.prochain_rappel).toLocaleDateString('fr-FR')}
                          </span>
                        ) : (
                          <span className="text-neutral-600 font-mono text-xs">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => setCallingProspectId(prospect.id)}
                            className="p-2 bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white rounded-xl transition-all border border-violet-500/30 shadow-sm cursor-pointer"
                            title="Appeler">
                            <Phone size={14} />
                          </button>
                          <button onClick={() => setSelectedProspect(prospect.id)}
                            className="p-2 bg-[#181818] hover:bg-[#222] text-neutral-300 rounded-xl transition-all border border-[#333] cursor-pointer"
                            title="Fiche prospect">
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => openConfirmModal({
                              title: 'Supprimer le prospect',
                              message: `Êtes-vous sûr de vouloir supprimer définitivement "${prospect.nom}" ?`,
                              confirmText: 'Supprimer',
                              onConfirm: () => deleteProspect(prospect.id),
                            })}
                            className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                            title="Supprimer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-16 text-center text-neutral-500">
                    {campagneProspects.length === 0 ? (
                      <div className="space-y-3">
                        <Building size={36} className="mx-auto text-neutral-600" />
                        <p className="text-sm font-medium">Cette campagne ne contient encore aucun prospect.</p>
                        <button onClick={() => navigate('/recherche')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-600/20 transition-all cursor-pointer">
                          <Plus size={14} /> Détecter des prospects avec l'assistant
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm">Aucun prospect ne correspond à vos filtres actuels.</p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#262626] bg-[#0d0d0d] text-xs text-neutral-400 flex items-center justify-between">
          <span>
            Affichage de <strong className="text-white">{filteredProspects.length}</strong> sur <strong className="text-white">{campagneProspects.length}</strong> prospects
            {someSelected && <span className="ml-3 text-violet-400 font-semibold">• {selected.size} sélectionné{selected.size > 1 ? 's' : ''}</span>}
          </span>
          <span className="text-neutral-500 text-[11px]">
            Trie par: {sortBy} • Ordre {sortOrder}
          </span>
        </div>
      </div>
    </div>
  );
}
