import { useDraggable } from '@dnd-kit/core';
import { Phone, Calendar, DollarSign, Trash2, Globe, ExternalLink, GripVertical, AlertTriangle, Building2 } from 'lucide-react';
import { PRIORITIES, PIPELINE_STAGES } from '../../lib/constants';
import { useUIStore } from '../../stores/uiStore';
import { useProspectStore } from '../../stores/prospectStore';

export default function ProspectCard({ prospect }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: prospect.id,
    data: { prospect },
  });
  const setSelectedProspect = useUIStore((state) => state.setSelectedProspect);
  const setCallingProspectId = useUIStore((state) => state.setCallingProspectId);
  const openConfirmModal = useUIStore((state) => state.openConfirmModal);
  const deleteProspect = useProspectStore((state) => state.deleteProspect);

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 999 : undefined,
      }
    : undefined;

  const priorite = PRIORITIES.find((p) => p.value === prospect.priorite) || PRIORITIES[0];

  // Statut du rappel (retard vs aujourdhui vs a venir)
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

  // Format domaine propre pour le bouton site web
  const cleanDomain = prospect.site_web
    ? prospect.site_web.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').split('/')[0]
    : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setSelectedProspect(prospect.id)}
      className={`
        group relative p-4 mb-3.5 bg-[#141417] rounded-2xl border transition-all cursor-grab active:cursor-grabbing select-none shadow-lg
        hover:border-violet-500/50 hover:shadow-[0_10px_30px_rgba(139,92,246,0.18)] hover:bg-[#18181f]
        ${isDragging ? 'border-violet-500 shadow-2xl opacity-95 scale-[1.03] bg-[#1d1d26] ring-2 ring-violet-500/30' : 'border-[#242430]'}
      `}
    >
      {/* Visual top accent indicator */}
      {priorite.value > 0 && (
        <div className={`absolute top-0 left-6 right-6 h-0.5 rounded-full ${priorite.value === 2 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-amber-500'}`} />
      )}

      {/* Header : Handle + Nom + Priorité */}
      <div className="flex items-start justify-between gap-2 mb-2 pr-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <GripVertical size={13} className="text-neutral-600 group-hover:text-neutral-400 shrink-0 transition-colors" />
            <h4 className="font-bold text-sm text-white group-hover:text-violet-300 transition-colors truncate">
              {prospect.nom}
            </h4>
          </div>
          <p className="text-xs text-neutral-400 truncate pl-4">{prospect.secteur || 'Secteur non spécifié'}</p>
        </div>

        {priorite.value > 0 && (
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border shrink-0 ${priorite.color}`}
            title={`Priorité ${priorite.label}`}
          >
            {priorite.label}
          </span>
        )}
      </div>

      {/* Badges de contexte : Site Web & Rappels */}
      <div className="flex flex-wrap items-center gap-1.5 my-2.5">
        {/* Pilule Site Web cliquable */}
        {cleanDomain ? (
          <a
            href={prospect.site_web}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/25 hover:bg-blue-500/20 hover:border-blue-400 hover:underline transition-all group/link"
            title={`Ouvrir ${prospect.site_web}`}
          >
            <Globe size={11} className="shrink-0 text-blue-400" />
            <span className="truncate max-w-[130px]">{cleanDomain}</span>
            <ExternalLink size={10} className="shrink-0 opacity-70 group-hover/link:opacity-100" />
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
            Aucun site web
          </span>
        )}

        {/* Badge Rappel */}
        {reminderStatus && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
              reminderStatus.type === 'retard'
                ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                : reminderStatus.type === 'aujourdhui'
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700'
            }`}
          >
            <Calendar size={10} />
            {reminderStatus.label}
          </span>
        )}
      </div>

      {/* Footer : Valeur & Téléphone */}
      <div className="flex items-center justify-between text-xs pt-2.5 border-t border-[#22222d]">
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-lg font-extrabold text-emerald-400">
          <DollarSign size={12} className="text-emerald-400 shrink-0" />
          <span>
            {(Number(prospect.montant_estime) || 0).toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              maximumFractionDigits: 0,
            })}
          </span>
        </div>

        {prospect.telephone && (
          <div className="flex items-center gap-1 text-neutral-400 font-mono text-[11px]">
            <Phone size={11} className="text-neutral-500" />
            <span>{prospect.telephone}</span>
          </div>
        )}
      </div>

      {/* Actions rapides au survol */}
      <div
        className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {cleanDomain && (
          <a
            href={prospect.site_web}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg transition-transform hover:scale-105"
            title="Visiter le site web"
          >
            <Globe size={12} />
          </a>
        )}
        <button
          className="p-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg shadow-lg transition-transform hover:scale-105 cursor-pointer"
          onClick={() => setCallingProspectId(prospect.id)}
          title="Appeler"
        >
          <Phone size={12} />
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
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
