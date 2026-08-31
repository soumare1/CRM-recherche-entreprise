import { Phone, Calendar, Trash2, Eye, DollarSign, Globe, ExternalLink } from 'lucide-react';
import { PIPELINE_STAGES, PRIORITIES, STATUTS_WEB } from '../../lib/constants';
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
    <div className="bg-[#121216] border border-[#22222d] rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#181820] border-b border-[#22222d] text-neutral-400 text-xs font-bold uppercase tracking-wider">
              <th className="px-5 py-4">Entreprise & Secteur</th>
              <th className="px-5 py-4">Site Web</th>
              <th className="px-5 py-4">Étape Pipeline</th>
              <th className="px-5 py-4">Priorité</th>
              <th className="px-5 py-4 text-right">Valeur Estimée</th>
              <th className="px-5 py-4">Prochain Rappel</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e1e28]">
            {prospects.map((p) => {
              const stageObj = PIPELINE_STAGES.find((s) => s.id === p.pipeline_stage) || PIPELINE_STAGES[0];
              const priorityObj = PRIORITIES.find((pr) => pr.value === p.priorite) || PRIORITIES[0];
              const cleanDomain = p.site_web
                ? p.site_web.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').split('/')[0]
                : null;

              return (
                <tr
                  key={p.id}
                  onClick={() => setSelectedProspect(p.id)}
                  className="hover:bg-[#181824] transition-colors group cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <div className="font-bold text-white group-hover:text-violet-300 transition-colors">
                      {p.nom}
                    </div>
                    <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                      <span>{p.secteur}</span>
                      {p.telephone && <span className="text-neutral-500">• {p.telephone}</span>}
                    </div>
                  </td>

                  {/* Pilule Site Web */}
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    {cleanDomain ? (
                      <a
                        href={p.site_web}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/25 hover:bg-blue-500/20 hover:border-blue-400 hover:underline transition-all"
                        title={`Ouvrir ${p.site_web}`}
                      >
                        <Globe size={12} className="text-blue-400 shrink-0" />
                        <span className="max-w-[130px] truncate">{cleanDomain}</span>
                        <ExternalLink size={10} className="shrink-0 opacity-70" />
                      </a>
                    ) : (
                      <span className="text-xs text-neutral-500 italic">Aucun site</span>
                    )}
                  </td>

                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="w-48">
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${priorityObj.color}`}>
                      {priorityObj.label}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right font-extrabold text-emerald-400">
                    {(Number(p.montant_estime) || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                  </td>

                  <td className="px-5 py-4 text-xs text-neutral-400">
                    {p.prochain_rappel ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                        <Calendar size={12} />
                        {new Date(p.prochain_rappel).toLocaleDateString('fr-FR')}
                      </span>
                    ) : (
                      <span className="text-neutral-600">-</span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {cleanDomain && (
                        <a
                          href={p.site_web}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg transition-colors border border-blue-500/30"
                          title="Ouvrir le site web"
                        >
                          <Globe size={14} />
                        </a>
                      )}
                      <button
                        onClick={() => setCallingProspectId(p.id)}
                        className="p-1.5 bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white rounded-lg transition-colors border border-violet-500/30 cursor-pointer"
                        title="Appeler"
                      >
                        <Phone size={14} />
                      </button>

                      <button
                        onClick={() => setSelectedProspect(p.id)}
                        className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors border border-[#333] cursor-pointer"
                        title="Voir fiche"
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        onClick={() => {
                          openConfirmModal({
                            title: 'Supprimer le prospect',
                            message: `Supprimer définitivement le prospect "${p.nom}" ?`,
                            confirmText: 'Supprimer',
                            onConfirm: () => deleteProspect(p.id),
                          });
                        }}
                        className="p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
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
