import { useDraggable } from '@dnd-kit/core';
import { Phone, Calendar, Clock, AlertTriangle, Trash2, DollarSign, MoreVertical, ChevronRight, User } from 'lucide-react';
import { PRIORITIES, PIPELINE_STAGES } from '../../lib/constants';
import { useUIStore } from '../../stores/uiStore';
import { useProspectStore } from '../../stores/prospectStore';
import { useState } from 'react';

export default function ProspectCard({ prospect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: prospect.id,
    data: { prospect },
  });
  const setSelectedProspect = useUIStore((state) => state.setSelectedProspect);
  const setCallingProspectId = useUIStore((state) => state.setCallingProspectId);
  const openConfirmModal = useUIStore((state) => state.openConfirmModal);
  const updateProspectStage = useProspectStore((state) => state.updateProspectStage);
  const deleteProspect = useProspectStore((state) => state.deleteProspect);

  const [menuOpen, setMenuOpen] = useState(false);

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 999 : undefined,
      }
    : undefined;

  const priorite = PRIORITIES.find((p) => p.value === prospect.priorite) || PRIORITIES[0];

  // Calcul du statut de rappel (retard vs aujourdhui vs a venir)
  let reminderStatus = null;
  if (prospect.prochain_rappel) {
    const todayStr = new Date().toISOString().split('T')[0];
    const reminderStr = prospect.prochain_rappel.split('T')[0];
    if (reminderStr < todayStr) {
      reminderStatus = { type: 'retard', label: 'Rappel en retard' };
    } else if (reminderStr === todayStr) {
      reminderStatus = { type: 'aujourdhui', label: "Rappel aujourd'hui" };
    } else {
      reminderStatus = { type: 'avenir', label: new Date(prospect.prochain_rappel).toLocaleDateString('fr-FR') };
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setSelectedProspect(prospect.id)}
      className={`
        group relative p-3.5 mb-3 bg-[#161616] rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none shadow-md
        hover:border-violet-500/60 hover:shadow-[0_8px_25px_rgba(139,92,246,0.15)] hover:bg-[#1a1a1a]
        ${isDragging ? 'border-violet-500 shadow-2xl opacity-90 scale-[1.02] bg-[#1f1f1f]' : 'border-[#262626]'}
      `}
    >
      {/* Header carte : Nom + Priorité + Badge Montant */}
      <div className="flex justify-between items-start mb-1.5 pr-8">
        <div>
          <h4 className="font-bold text-sm text-white group-hover:text-violet-300 transition-colors leading-snug">
            {prospect.nom}
          </h4>
          <p className="text-xs text-neutral-400 mt-0.5">{prospect.secteur}</p>
        </div>

        {priorite.value > 0 && (
          <span
            className={`px-1.5 py-0.5 text-[10px] font-bold rounded border shrink-0 ${priorite.color}`}
            title={`Priorité ${priorite.label}`}
          >
            {priorite.label}
          </span>
        )}
      </div>

      {/* Badge Rappel si présent */}
      {reminderStatus && (
        <div className="my-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
              reminderStatus.type === 'retard'
                ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                : reminderStatus.type === 'aujourdhui'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700'
            }`}
          >
            <Calendar size={11} />
            {reminderStatus.label}
          </span>
        </div>
      )}

      {/* Montant Estimé & Téléphone */}
      <div className="flex items-center justify-between text-xs mt-2.5 pt-2 border-t border-[#222]">
        <div className="flex items-center gap-1 font-extrabold text-emerald-400">
          <DollarSign size={13} className="text-emerald-500" />
          <span>
            {(Number(prospect.montant_estime) || 0).toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              maximumFractionDigits: 0,
            })}
          </span>
        </div>

        {prospect.telephone && (
          <div className="flex items-center gap-1 text-neutral-400 text-[11px]">
            <Phone size={11} />
            <span>{prospect.telephone}</span>
          </div>
        )}
      </div>

      {/* Boutons d'action rapide au survol */}
      <div
        className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="p-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg shadow-lg transition-transform hover:scale-105 cursor-pointer"
          onClick={() => setCallingProspectId(prospect.id)}
          title="Appeler"
        >
          <Phone size={13} />
        </button>

        <button
          className="p-1.5 bg-neutral-800 hover:bg-red-600 text-neutral-400 hover:text-white rounded-lg shadow-lg border border-[#333] transition-colors cursor-pointer"
          onClick={() => {
            openConfirmModal({
              title: 'Supprimer le prospect',
              message: `Êtes-vous sûr de vouloir supprimer le prospect "${prospect.nom}" ?`,
              confirmText: 'Supprimer',
              onConfirm: () => deleteProspect(prospect.id),
            });
          }}
          title="Supprimer"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
