import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProspectStore } from '../stores/prospectStore';
import { useCampagneStore } from '../stores/campagneStore';
import { useUIStore } from '../stores/uiStore';
import { usePageStateStore } from '../stores/pageStateStore';
import CustomSelect from '../components/common/CustomSelect';
import {
  Search,
  Filter,
  Phone,
  MapPin,
  Store,
  Trash2,
  Plus,
  ArrowUpDown,
  Flame,
  DollarSign,
  Globe,
  Calendar,
  Eye,
  AlertTriangle,
  UserCheck,
  Building,
} from 'lucide-react';
import { PIPELINE_STAGES, SECTEURS, PRIORITIES, STATUTS_WEB } from '../lib/constants';

export default function ProspectsPage() {
  const navigate = useNavigate();
  const prospects = useProspectStore((state) => state.prospects);
  const deleteProspect = useProspectStore((state) => state.deleteProspect);
  const updateProspectStage = useProspectStore((state) => state.updateProspectStage);
  const activeCampagneId = useCampagneStore((state) => state.activeCampagneId);
  const setSelectedProspect = useUIStore((state) => state.setSelectedProspect);
  const setCallingProspectId = useUIStore((state) => state.setCallingProspectId);
  const openConfirmModal = useUIStore((state) => state.openConfirmModal);
  const openAddProspectModal = useUIStore((state) => state.openAddProspectModal);

  const { prospects: prospectsList } = usePageStateStore();
  const setProspectsState = usePageStateStore((s) => s.setProspectsState);
  const { search, stageFilter, secteurFilter } = prospectsList;

  const [quickFilter, setQuickFilter] = useState('all'); // 'all', 'hot', 'no_site', 'urgent'
  const [sortBy, setSortBy] = useState('updated_at'); // 'updated_at', 'montant', 'nom', 'priorite'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  const setSearch = (v) => setProspectsState({ search: v });
  const setStageFilter = (v) => setProspectsState({ stageFilter: v });
  const setSecteurFilter = (v) => setProspectsState({ secteurFilter: v });

  const campagneProspects = useMemo(() => {
    return prospects.filter((p) => p.campagne_id === activeCampagneId);
  }, [prospects, activeCampagneId]);

  // Secteurs uniques présents dans la campagne
  const secteursPresents = useMemo(() => {
    return SECTEURS.filter((s) =>
      campagneProspects.some((p) => p.secteur_id === s.id || p.secteur === s.label)
    );
  }, [campagneProspects]);

  // Métriques KPI
  const stats = useMemo(() => {
    const total = campagneProspects.length;
    const hotDeals = campagneProspects.filter((p) =>
      ['rdv_pris', 'devis_envoye', 'negoce'].includes(p.pipeline_stage)
    ).length;
    const totalValue = campagneProspects.reduce((sum, p) => sum + (Number(p.montant_estime) || 0), 0);
    const noSiteCount = campagneProspects.filter((p) => p.statut_web === 'aucun_site').length;

    return { total, hotDeals, totalValue, noSiteCount };
  }, [campagneProspects]);

  // Filtrage et Tri
  const filteredProspects = useMemo(() => {
    return campagneProspects
      .filter((p) => {
        // Recherche textuelle
        const matchesSearch =
          p.nom.toLowerCase().includes(search.toLowerCase()) ||
          (p.telephone && p.telephone.includes(search)) ||
          (p.secteur && p.secteur.toLowerCase().includes(search.toLowerCase()));

        // Filtre par statut pipeline
        const matchesStage = stageFilter === 'all' || p.pipeline_stage === stageFilter;

        // Filtre par secteur
        const matchesSecteur =
          secteurFilter === 'all' ||
          p.secteur_id === secteurFilter ||
          p.secteur === SECTEURS.find((s) => s.id === secteurFilter)?.label;

        // Quick filters (Filtres rapides)
        let matchesQuick = true;
        if (quickFilter === 'hot') {
          matchesQuick = ['rdv_pris', 'devis_envoye', 'negoce'].includes(p.pipeline_stage);
        } else if (quickFilter === 'no_site') {
          matchesQuick = p.statut_web === 'aucun_site';
        } else if (quickFilter === 'urgent') {
          matchesQuick = p.priorite === 2 || p.priorite === 1;
        }

        return matchesSearch && matchesStage && matchesSecteur && matchesQuick;
      })
      .sort((a, b) => {
        let modifier = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'montant') {
          return ((Number(a.montant_estime) || 0) - (Number(b.montant_estime) || 0)) * modifier;
        }
        if (sortBy === 'priorite') {
          return ((b.priorite || 0) - (a.priorite || 0)) * modifier;
        }
        if (sortBy === 'nom') {
          return a.nom.localeCompare(b.nom) * modifier;
        }
        // Par défaut: date
        return (new Date(b.updated_at || 0) - new Date(a.updated_at || 0)) * modifier;
      });
  }, [campagneProspects, search, stageFilter, secteurFilter, quickFilter, sortBy, sortOrder]);

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
      {/* En-tête de page & Cartes KPI */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Gestion des Prospects
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
              {campagneProspects.length}
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Base de contacts qualifiés et opportunités de vente
          </p>
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

      {/* Cartes KPI Synthèse */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="p-3 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/20">
            <UserCheck size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400 font-medium">Total Prospects</div>
            <div className="text-xl font-black text-white">{stats.total}</div>
          </div>
        </div>

        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Flame size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400 font-medium">Deals Chauds</div>
            <div className="text-xl font-black text-amber-400">{stats.hotDeals}</div>
          </div>
        </div>

        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400 font-medium">Valeur Pipeline</div>
            <div className="text-xl font-black text-emerald-400">
              {stats.totalValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>

        <div className="bg-[#121212] border border-[#262626] rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
            <Globe size={20} />
          </div>
          <div>
            <div className="text-xs text-neutral-400 font-medium">Sans Site Web</div>
            <div className="text-xl font-black text-red-400">{stats.noSiteCount}</div>
          </div>
        </div>
      </div>

      {/* Barre de Filtres & Recherche */}
      <div className="p-3 bg-[#121212] border border-[#262626] rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Recherche */}
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

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1 bg-[#181818] border border-[#262626] rounded-xl p-1">
            <button
              onClick={() => setQuickFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                quickFilter === 'all' ? 'bg-violet-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setQuickFilter('hot')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                quickFilter === 'hot' ? 'bg-amber-500 text-black' : 'text-neutral-400 hover:text-amber-400'
              }`}
            >
              <Flame size={12} /> Chauds
            </button>
            <button
              onClick={() => setQuickFilter('no_site')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                quickFilter === 'no_site' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-neutral-400 hover:text-red-400'
              }`}
            >
              Sans site
            </button>
            <button
              onClick={() => setQuickFilter('urgent')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                quickFilter === 'urgent' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'text-neutral-400 hover:text-orange-400'
              }`}
            >
              Priorité
            </button>
          </div>
        </div>

        {/* Filtres Select & Tri */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Statut Filter */}
          <div className="w-44">
            <CustomSelect
              value={stageFilter}
              onChange={(val) => setStageFilter(val)}
              options={[
                { value: 'all', label: 'Tous les statuts' },
                ...PIPELINE_STAGES.map((s) => ({ value: s.id, label: s.label, color: s.color })),
              ]}
              icon={Filter}
              size="sm"
            />
          </div>

          {/* Secteur Filter */}
          <div className="w-48">
            <CustomSelect
              value={secteurFilter}
              onChange={(val) => setSecteurFilter(val)}
              options={[
                { value: 'all', label: 'Tous les secteurs' },
                ...secteursPresents.map((s) => ({ value: s.id, label: s.label })),
              ]}
              icon={Store}
              searchable={true}
              size="sm"
            />
          </div>

          {/* Bouton Tri */}
          <div className="w-40">
            <CustomSelect
              value={sortBy}
              onChange={(val) => setSortBy(val)}
              options={[
                { value: 'updated_at', label: 'Récent' },
                { value: 'montant', label: 'Valeur (€)' },
                { value: 'priorite', label: 'Priorité' },
                { value: 'nom', label: 'Nom A-Z' },
              ]}
              icon={ArrowUpDown}
              size="sm"
            />
          </div>

          {(stageFilter !== 'all' || secteurFilter !== 'all' || search || quickFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setStageFilter('all');
                setSecteurFilter('all');
                setQuickFilter('all');
              }}
              className="text-xs text-violet-400 hover:underline px-2 py-1 shrink-0 font-medium"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Tableau des Prospects */}
      <div className="flex-1 bg-[#121212] border border-[#262626] rounded-2xl overflow-hidden shadow-xl flex flex-col min-h-[420px]">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-neutral-900/90 border-b border-[#262626] text-neutral-400 text-[11px] font-bold uppercase tracking-wider">
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

                  return (
                    <tr
                      key={prospect.id}
                      onClick={() => setSelectedProspect(prospect.id)}
                      className="hover:bg-neutral-800/40 transition-colors group cursor-pointer"
                    >
                      {/* Entreprise & Secteur */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white group-hover:text-violet-300 transition-colors text-sm">
                            {prospect.nom}
                          </span>
                          {priorityObj.value > 0 && (
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${priorityObj.color}`}>
                              {priorityObj.label}
                            </span>
                          )}
                        </div>
                        <div className="text-neutral-400 flex items-center gap-2 mt-1">
                          <span className="text-neutral-400 font-medium">{prospect.secteur || 'Secteur inconnu'}</span>
                          {prospect.telephone && <span className="text-neutral-500">• {prospect.telephone}</span>}
                          {prospect.adresse && <span className="text-neutral-500">• {prospect.adresse}</span>}
                        </div>
                      </td>

                      {/* Étape Pipeline (Sélecteur direct) */}
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="w-44">
                          <CustomSelect
                            value={prospect.pipeline_stage}
                            onChange={(val) => updateProspectStage(prospect.id, val)}
                            options={PIPELINE_STAGES.map((s) => ({
                              value: s.id,
                              label: s.label,
                              color: s.color,
                            }))}
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

                      {/* Valeur Estimée */}
                      <td className="px-5 py-3.5 text-right font-black text-emerald-400 text-sm">
                        {(Number(prospect.montant_estime) || 0).toLocaleString('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0,
                        })}
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
                          <button
                            onClick={() => setCallingProspectId(prospect.id)}
                            className="p-2 bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white rounded-xl transition-all border border-violet-500/30 shadow-sm cursor-pointer"
                            title="Appeler"
                          >
                            <Phone size={14} />
                          </button>

                          <button
                            onClick={() => setSelectedProspect(prospect.id)}
                            className="p-2 bg-[#181818] hover:bg-[#222] text-neutral-300 rounded-xl transition-all border border-[#333] cursor-pointer"
                            title="Fiche prospect"
                          >
                            <Eye size={14} />
                          </button>

                          <button
                            onClick={() => {
                              openConfirmModal({
                                title: 'Supprimer le prospect',
                                message: `Êtes-vous sûr de vouloir supprimer définitivement "${prospect.nom}" ?`,
                                confirmText: 'Supprimer',
                                onConfirm: () => deleteProspect(prospect.id),
                              });
                            }}
                            className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-neutral-500">
                    {campagneProspects.length === 0 ? (
                      <div className="space-y-3">
                        <Building size={36} className="mx-auto text-neutral-600" />
                        <p className="text-sm font-medium">Cette campagne ne contient encore aucun prospect.</p>
                        <button
                          onClick={() => navigate('/recherche')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-600/20 transition-all cursor-pointer"
                        >
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

        {/* Footer info bar */}
        <div className="px-5 py-3 border-t border-[#262626] bg-[#0d0d0d] text-xs text-neutral-400 flex items-center justify-between">
          <span>
            Affichage de <strong className="text-white">{filteredProspects.length}</strong> sur <strong className="text-white">{campagneProspects.length}</strong> prospects
          </span>
          <span className="text-neutral-500 text-[11px]">
            Trie par: {sortBy} • Ordre {sortOrder}
          </span>
        </div>
      </div>
    </div>
  );
}
