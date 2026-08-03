import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { PIPELINE_STAGES } from '../../lib/constants';
import PipelineColumn from './PipelineColumn';
import ProspectCard from './ProspectCard';
import PipelineListView from './PipelineListView';
import PipelineMetricsView from './PipelineMetricsView';
import { useProspectStore } from '../../stores/prospectStore';
import { useCampagneStore } from '../../stores/campagneStore';
import { useUIStore } from '../../stores/uiStore';
import CustomSelect from '../common/CustomSelect';
import {
  Kanban,
  List,
  BarChart2,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  AlertTriangle,
  Sparkles,
  Layers,
} from 'lucide-react';

export default function PipelineBoard() {
  const { activeCampagneId, campagnes } = useCampagneStore();
  const { prospects, updateProspectStage } = useProspectStore();
  const openAddProspectModal = useUIStore((s) => s.openAddProspectModal);

  const [activeId, setActiveId] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list' | 'metrics'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSecteur, setSelectedSecteur] = useState('tous');
  const [filterRappel, setFilterRappel] = useState('tous'); // 'tous' | 'retard' | 'aujourdhui'

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Tous les secteurs uniques disponibles dans les prospects
  const secteursDisponibles = useMemo(() => {
    const setSec = new Set(prospects.map((p) => p.secteur).filter(Boolean));
    return Array.from(setSec);
  }, [prospects]);

  // Filtrer les prospects selon la campagne, le terme de recherche, le secteur et le statut de rappel
  const filteredProspects = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return prospects.filter((p) => {
      // 1. Filtrer par campagne
      if (activeCampagneId && p.campagne_id !== activeCampagneId) return false;

      // 2. Recherche par nom ou téléphone
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchNom = p.nom?.toLowerCase().includes(query);
        const matchTel = p.telephone?.includes(query);
        const matchSec = p.secteur?.toLowerCase().includes(query);
        if (!matchNom && !matchTel && !matchSec) return false;
      }

      // 3. Filtre secteur
      if (selectedSecteur !== 'tous' && p.secteur !== selectedSecteur) return false;

      // 4. Filtre Rappel
      if (filterRappel !== 'tous') {
        if (!p.prochain_rappel) return false;
        const reminderStr = p.prochain_rappel.split('T')[0];
        if (filterRappel === 'retard' && reminderStr >= todayStr) return false;
        if (filterRappel === 'aujourdhui' && reminderStr !== todayStr) return false;
      }

      return true;
    });
  }, [prospects, activeCampagneId, searchTerm, selectedSecteur, filterRappel]);

  const activeProspect = activeId ? prospects.find((p) => p.id === activeId) : null;

  // Calcul du montant total & won dans le filtre actuel
  const totalValue = filteredProspects.reduce((sum, p) => sum + (Number(p.montant_estime) || 0), 0);
  const wonValue = filteredProspects
    .filter((p) => p.pipeline_stage === 'signe')
    .reduce((sum, p) => sum + (Number(p.montant_estime) || 0), 0);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
    const { active, over } = event;

    if (!over) return;

    const prospectId = active.id;
    const overId = over.id; // L'id de la colonne (stage)

    const prospect = prospects.find((p) => p.id === prospectId);
    if (prospect && prospect.pipeline_stage !== overId) {
      updateProspectStage(prospectId, overId);

      // Surprise Confettis quand un contrat est signé !
      if (overId === 'signe') {
        import('canvas-confetti').then((confetti) => {
          confetti.default({
            particleCount: 180,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#10b981', '#34d399', '#8b5cf6', '#ffffff'],
          });
        });
      }
    }
  };

  const activeCampagne = campagnes.find((c) => c.id === activeCampagneId);

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Top Banner & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black text-white tracking-tight">Pipeline Commercial</h2>
            {activeCampagne && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {activeCampagne.nom}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            Suivi des opportunités, relances et closing des affaires
          </p>
        </div>

        {/* Boutons de changement de vue & d'ajout */}
        <div className="flex items-center gap-3">
          <div className="flex bg-[#121212] border border-[#262626] rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Kanban size={14} /> Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <List size={14} /> Liste
            </button>
            <button
              onClick={() => setViewMode('metrics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'metrics'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <BarChart2 size={14} /> Entonnoir
            </button>
          </div>

          <button
            onClick={() => openAddProspectModal('a_contacter')}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-600/20 transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Nouveau Prospect</span>
          </button>
        </div>
      </div>

      {/* Barre de Recherche & Filtres */}
      <div className="p-3 bg-[#121212] border border-[#262626] rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Rechercher par nom, tel ou secteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#181818] border border-[#333] rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          {/* Filtre Secteur */}
          <div className="w-48 sm:w-56">
            <CustomSelect
              value={selectedSecteur}
              onChange={(val) => setSelectedSecteur(val)}
              options={[
                { value: 'tous', label: 'Tous les secteurs' },
                ...secteursDisponibles.map((sec) => ({ value: sec, label: sec })),
              ]}
              searchable={true}
              size="sm"
            />
          </div>

          {/* Filtre Rappel */}
          <div className="w-48 sm:w-52">
            <CustomSelect
              value={filterRappel}
              onChange={(val) => setFilterRappel(val)}
              options={[
                { value: 'tous', label: 'Tous les rappels' },
                { value: 'aujourdhui', label: '📅 Rappels aujourd\'hui' },
                { value: 'retard', label: '⚠️ Rappels en retard' },
              ]}
              size="sm"
            />
          </div>
        </div>

        {/* Résumé valeur cumulative */}
        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-[11px] text-neutral-500 block">Opportunités</span>
            <span className="font-bold text-white">{filteredProspects.length} prospects</span>
          </div>
          <div className="h-6 w-px bg-[#262626]" />
          <div className="text-right">
            <span className="text-[11px] text-neutral-500 block">Valeur Filtre</span>
            <span className="font-extrabold text-emerald-400">
              {totalValue.toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Contenu selon le mode de vue */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'list' && <PipelineListView prospects={filteredProspects} />}

        {viewMode === 'metrics' && <PipelineMetricsView prospects={filteredProspects} />}

        {viewMode === 'kanban' && (
          <div className="h-full overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-5 h-full min-h-[550px]">
                {PIPELINE_STAGES.map((stage) => (
                  <PipelineColumn
                    key={stage.id}
                    stage={stage}
                    prospects={filteredProspects.filter((p) => p.pipeline_stage === stage.id)}
                  />
                ))}
              </div>

              <DragOverlay dropAnimation={null}>
                {activeProspect ? (
                  <div className="w-80 shadow-2xl opacity-95 scale-105 rotate-2">
                    <ProspectCard prospect={activeProspect} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
}
