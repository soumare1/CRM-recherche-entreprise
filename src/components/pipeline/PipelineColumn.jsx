import { useDroppable } from '@dnd-kit/core';
import ProspectCard from './ProspectCard';
import { Plus, FolderOpen, DollarSign, Sparkles } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

export default function PipelineColumn({ stage, prospects }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  const openAddProspectModal = useUIStore((s) => s.openAddProspectModal);

  const totalAmount = prospects.reduce((sum, p) => sum + (Number(p.montant_estime) || 0), 0);

  return (
    <div className="flex flex-col w-84 shrink-0 select-none">
      {/* En-tête de colonne avec hiérarchie visuelle claire */}
      <div className="p-3 mb-2 bg-[#121216] border border-[#22222d] rounded-2xl shadow-md">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`px-3 py-1 text-xs font-black rounded-xl border shadow-sm truncate ${stage.color}`}>
              {stage.label}
            </span>
            <span className="text-xs font-black text-neutral-300 bg-[#1b1b24] px-2.5 py-0.5 rounded-full border border-[#2a2a38] shrink-0">
              {prospects.length}
            </span>
          </div>

          <button
            onClick={() => openAddProspectModal(stage.id)}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-violet-600/20 hover:border-violet-500/40 transition-all border border-transparent cursor-pointer shrink-0"
            title={`Ajouter un prospect dans "${stage.label}"`}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Valeur totale de la colonne */}
        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#1c1c26]">
          <span className="text-[11px] font-medium text-neutral-500">Valeur totale</span>
          <span className="font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
            {totalAmount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* Zone de drop réceptive */}
      <div
        ref={setNodeRef}
        className={`
          flex-1 p-2 rounded-2xl border transition-all duration-300 min-h-[520px] flex flex-col
          ${
            isOver
              ? 'bg-violet-600/15 border-violet-500/80 shadow-[0_0_35px_rgba(139,92,246,0.25)] ring-2 ring-violet-500/30'
              : 'bg-[#0f0f13]/90 border-[#1c1c26]'
          }
        `}
      >
        {prospects.length > 0 ? (
          prospects.map((prospect) => <ProspectCard key={prospect.id} prospect={prospect} />)
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-14 px-4 text-center border-2 border-dashed border-[#222230] rounded-xl my-1 group/empty">
            <div className="p-3 rounded-2xl bg-[#161620] text-neutral-600 group-hover/empty:text-violet-400 group-hover/empty:bg-violet-600/10 transition-colors mb-2">
              <FolderOpen size={22} />
            </div>
            <p className="text-xs font-bold text-neutral-400">Aucun prospect</p>
            <p className="text-[11px] text-neutral-600 mt-0.5">Faites glisser une carte ici</p>
            <button
              onClick={() => openAddProspectModal(stage.id)}
              className="mt-3 px-3 py-1.5 bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/30 text-violet-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} /> Ajouter un prospect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
