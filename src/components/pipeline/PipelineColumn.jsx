import { useDroppable } from '@dnd-kit/core';
import ProspectCard from './ProspectCard';
import { Plus, FolderOpen } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export default function PipelineColumn({ stage, prospects }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const openAddProspectModal = useUIStore((s) => s.openAddProspectModal);

  const totalAmount = prospects.reduce((sum, p) => sum + (Number(p.montant_estime) || 0), 0);

  return (
    <div className="flex flex-col w-80 shrink-0 select-none">
      {/* En-tête de colonne */}
      <div className="flex items-center justify-between mb-3 px-1.5 py-1">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-xs font-bold rounded-lg border shadow-sm ${stage.color}`}>
            {stage.label}
          </span>
          <span className="text-xs font-bold text-neutral-400 bg-[#181818] px-2.5 py-0.5 rounded-full border border-[#262626]">
            {prospects.length}
          </span>
        </div>

        <button
          onClick={() => openAddProspectModal(stage.id)}
          className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors border border-transparent hover:border-[#333] cursor-pointer"
          title={`Ajouter un prospect dans "${stage.label}"`}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Montant total du stage */}
      <div className="px-1.5 mb-3 flex items-center justify-between text-[11px] text-neutral-500">
        <span>Valeur cumulative</span>
        <span className="font-semibold text-neutral-300">
          {totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
        </span>
      </div>

      {/* Zone de drop */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 p-2 rounded-2xl border transition-all duration-200 min-h-[500px] flex flex-col
          ${
            isOver
              ? 'bg-violet-600/10 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.15)] ring-2 ring-violet-500/20'
              : 'bg-[#121212]/80 border-[#222]'
          }
        `}
      >
        {prospects.length > 0 ? (
          prospects.map((prospect) => <ProspectCard key={prospect.id} prospect={prospect} />)
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center border-2 border-dashed border-[#222] rounded-xl my-1">
            <div className="p-2.5 rounded-xl bg-neutral-900 text-neutral-600 mb-2">
              <FolderOpen size={20} />
            </div>
            <p className="text-xs font-semibold text-neutral-500">Aucun prospect</p>
            <button
              onClick={() => openAddProspectModal(stage.id)}
              className="mt-2 text-[11px] text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 cursor-pointer hover:underline"
            >
              <Plus size={12} /> Ajouter ici
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
