import { Phone, Calendar, Trash2, Eye, DollarSign } from 'lucide-react';
import { PIPELINE_STAGES, PRIORITIES } from '../../lib/constants';
import { useUIStore } from '../../stores/uiStore';
import { useProspectStore } from '../../stores/prospectStore';
import CustomSelect from '../common/CustomSelect';

export default function PipelineListView({ prospects }) {
  const setSelectedProspect = useUIStore((s) => s.setSelectedProspect);
  const setCallingProspectId = useUIStore((s) => s.setCallingProspectId);
  const openConfirmModal = useUIStore((s) => s.openConfirmModal);
  const updateProspectStage = useProspectStore((s) => s.updateProspectStage);
  const deleteProspect = useProspectStore((s) => s.deleteProspect);

  return (
    <div className="bg-[#121212] border border-[#262626] rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-900/80 border-b border-[#262626] text-neutral-400 text-xs font-semibold uppercase tracking-wider">
              <th className="px-5 py-3.5">Entreprise & Secteur</th>
              <th className="px-5 py-3.5">Étape Pipeline</th>
              <th className="px-5 py-3.5">Priorité</th>
              <th className="px-5 py-3.5 text-right">Valeur Estimée</th>
              <th className="px-5 py-3.5">Prochain Rappel</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262626]/60">
            {prospects.map((p) => {
              const stageObj = PIPELINE_STAGES.find((s) => s.id === p.pipeline_stage) || PIPELINE_STAGES[0];
              const priorityObj = PRIORITIES.find((pr) => pr.value === p.priorite) || PRIORITIES[0];

              return (
                <tr
                  key={p.id}
                  onClick={() => setSelectedProspect(p.id)}
                  className="hover:bg-neutral-800/40 transition-colors group cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <div className="font-semibold text-white group-hover:text-violet-300 transition-colors">
                      {p.nom}
                    </div>
                    <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span>{p.secteur}</span>
                      {p.telephone && <span className="text-neutral-500">• {p.telephone}</span>}
                    </div>
                  </td>

                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="w-44">
                      <CustomSelect
                        value={p.pipeline_stage}
                        onChange={(val) => updateProspectStage(p.id, val)}
                        options={PIPELINE_STAGES.map((s) => ({
                          value: s.id,
                          label: s.label,
                          color: s.color,
                        }))}
                        size="sm"
                      />
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${priorityObj.color}`}>
                      {priorityObj.label}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right font-semibold text-emerald-400">
                    {(Number(p.montant_estime) || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                  </td>

                  <td className="px-5 py-4 text-xs text-neutral-400">
                    {p.prochain_rappel ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        <Calendar size={12} />
                        {new Date(p.prochain_rappel).toLocaleDateString('fr-FR')}
                      </span>
                    ) : (
                      <span className="text-neutral-600">-</span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setCallingProspectId(p.id)}
                        className="p-1.5 bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white rounded-lg transition-colors border border-violet-500/30"
                        title="Appeler"
                      >
                        <Phone size={14} />
                      </button>

                      <button
                        onClick={() => setSelectedProspect(p.id)}
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors border border-[#333]"
                        title="Voir fiche"
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        onClick={() => {
                          openConfirmModal({
                            title: 'Supprimer le prospect',
                            message: `Supprimer définitvement le prospect "${p.nom}" ?`,
                            confirmText: 'Supprimer',
                            onConfirm: () => deleteProspect(p.id),
                          });
                        }}
                        className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
