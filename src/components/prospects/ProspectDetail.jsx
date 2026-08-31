import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import { useProspectStore } from '../../stores/prospectStore';
import { X, Phone, Globe, MapPin, Calendar, Plus, Clock, Save, TrendingUp, Trash2, Monitor, Smartphone } from 'lucide-react';
import { PIPELINE_STAGES, SECTEUR_DATA, SECTEURS, getOffresForSecteur } from '../../lib/constants';

export default function ProspectDetail() {
  const selectedProspectId = useUIStore(state => state.selectedProspectId);
  const closeProspectDetail = useUIStore(state => state.closeProspectDetail);
  const setCallingProspectId = useUIStore(state => state.setCallingProspectId);
  const openRdvModal = useUIStore(state => state.openRdvModal);
  const prospects = useProspectStore(state => state.prospects);
  const updateProspect = useProspectStore(state => state.updateProspect);
  const deleteProspect = useProspectStore(state => state.deleteProspect);
  const navigate = useNavigate();

  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');

  const prospect = prospects.find(p => p.id === selectedProspectId);

  if (!prospect) return null;

  const stageInfo = PIPELINE_STAGES.find(s => s.id === prospect.pipeline_stage) || PIPELINE_STAGES[0];

  const secteurId = prospect.secteur_id
    || SECTEURS.find(s => s.label === prospect.secteur)?.id;
  const secteurData = SECTEUR_DATA[secteurId];
  const offresRecommandees = getOffresForSecteur(secteurId);

  const webLabel = {
    aucun_site: { label: 'Aucun site web', color: 'text-red-400 bg-red-400/10' },
    site_obsolete: { label: 'Site web obsolète', color: 'text-amber-400 bg-amber-400/10' },
    site_ok: { label: 'Site web présent', color: 'text-emerald-400 bg-emerald-400/10' }
  }[prospect.statut_web] || { label: prospect.statut_web, color: 'text-neutral-400 bg-neutral-400/10' };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    const existingNotes = prospect.notes ? prospect.notes + '\n' : '';
    updateProspect(prospect.id, { notes: existingNotes + noteText.trim() });
    setNoteText('');
    setShowNoteInput(false);
  };

  const handleDelete = () => {
    useUIStore.getState().openConfirmModal({
      title: 'Supprimer le prospect',
      message: `Êtes-vous sûr de vouloir supprimer le prospect "${prospect.nom}" ?`,
      confirmText: 'Supprimer définitivement',
      onConfirm: () => {
        deleteProspect(prospect.id);
        closeProspectDetail();
      },
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
        onClick={closeProspectDetail}
      />
      <div className="fixed inset-y-0 right-0 w-full md:w-[520px] bg-[#121212] border-l border-[#262626] z-[101] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#262626]">
          <div>
            <h2 className="text-xl font-semibold text-white tracking-tight">{prospect.nom}</h2>
            <p className="text-sm text-neutral-400 mt-0.5">{prospect.secteur}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Supprimer ce prospect"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={closeProspectDetail}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Statut */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md border ${stageInfo.color}`}>
              {stageInfo.label}
            </span>
            <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-md ${webLabel.color}`}>
              {webLabel.label}
            </span>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 gap-3">
            {prospect.telephone && (
              <div className="p-4 rounded-xl bg-[#181818] border border-[#262626] flex items-center gap-3">
                <Phone size={18} className="text-violet-400 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-500 mb-0.5">Téléphone</p>
                  <p className="text-white font-medium">{prospect.telephone}</p>
                </div>
              </div>
            )}

            {prospect.adresse && (
              <div className="p-4 rounded-xl bg-[#181818] border border-[#262626] flex items-center gap-3">
                <MapPin size={18} className="text-violet-400 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-500 mb-0.5">Adresse</p>
                  <p className="text-white font-medium text-sm">{prospect.adresse}</p>
                </div>
              </div>
            )}

            {prospect.notes && (
              <div className="p-4 rounded-xl bg-[#181818] border border-[#262626] flex items-start gap-3">
                <Globe size={18} className="text-violet-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-xs text-neutral-500 mb-0.5">Notes</p>
                  <p className="text-neutral-300 text-sm whitespace-pre-wrap break-words">{prospect.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions rapides */}
          <div>
            <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">Actions Rapides</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  closeProspectDetail();
                  setCallingProspectId(prospect.id);
                }}
                className="flex items-center justify-center gap-2 p-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl transition-colors font-medium"
              >
                <Phone size={18} />
                Appeler
              </button>
              <button
                onClick={() => {
                  closeProspectDetail();
                  openRdvModal(prospect.id);
                }}
                className="flex items-center justify-center gap-2 p-3 bg-neutral-800 hover:bg-neutral-700 text-white border border-[#333] rounded-xl transition-colors font-medium cursor-pointer"
              >
                <Calendar size={18} />
                Prendre RDV
              </button>
            </div>
          </div>

          {/* ── Offres AppForge recommandées ── */}
          {offresRecommandees.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp size={13} />
                Offres AppForge recommandées
              </h3>
              <div className="space-y-3">
                {offresRecommandees.map(offre => {
                  const colorMap = {
                    violet: { card: 'border-violet-500/30 bg-violet-500/5', badge: 'bg-violet-500/20 text-violet-300 border-violet-500/40', price: 'text-violet-300', icon: 'text-violet-400' },
                    blue:   { card: 'border-blue-500/30 bg-blue-500/5',     badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',     price: 'text-blue-300',   icon: 'text-blue-400' },
                    emerald:{ card: 'border-emerald-500/30 bg-emerald-500/5',badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',price:'text-emerald-300',icon:'text-emerald-400'},
                  };
                  const c = colorMap[offre.color] || colorMap.violet;
                  const IconComp = offre.icon === 'Monitor' ? Monitor : offre.icon === 'Smartphone' ? Smartphone : Globe;

                  return (
                    <div key={offre.id} className={`p-4 rounded-xl border ${c.card}`}>
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2 rounded-lg bg-[#1a1a1a] ${c.icon}`}>
                          <IconComp size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-white">{offre.label}</span>
                            {offre.badge && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${c.badge}`}>{offre.badge}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {offre.tarifs.map((t, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div>
                              <span className="text-neutral-300 text-xs">{t.label}</span>
                              {t.detail && <span className="text-neutral-600 text-[11px] ml-1.5">— {t.detail}</span>}
                            </div>
                            <span className={`font-semibold ${c.price} shrink-0 ml-3`}>
                              {t.price
                                ? `${t.price}${t.unite}`
                                : `${t.min.toLocaleString('fr-FR')}${t.max ? ` – ${t.max.toLocaleString('fr-FR')}` : ''}${t.suffix || ''} ${t.unite}`
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tarifs détaillés par secteur */}
              {secteurData?.tarifs?.length > 0 && (
                <div className="mt-3 p-3 rounded-xl bg-[#181818] border border-[#262626]">
                  <p className="text-[11px] text-neutral-500 font-medium mb-2 uppercase tracking-wide">Détail pour {prospect.secteur}</p>
                  <div className="space-y-2">
                    {secteurData.tarifs.map((t, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-neutral-300">{t.solution}</p>
                          <p className="text-[11px] text-neutral-600">{t.modele}</p>
                        </div>
                        <p className="text-xs font-semibold text-white shrink-0 ml-3">
                          {t.min.toLocaleString('fr-FR')}{t.max ? ` – ${t.max.toLocaleString('fr-FR')}` : '+'} €
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline d'activité */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Activité récente</h3>
              <button
                onClick={() => setShowNoteInput(v => !v)}
                className="p-1 rounded bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                title="Ajouter une note"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Input ajout de note */}
            {showNoteInput && (
              <div className="mb-4 p-3 rounded-xl bg-[#181818] border border-violet-500/30 space-y-2">
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Ajouter une note..."
                  className="w-full bg-transparent text-sm text-white placeholder-neutral-600 resize-none focus:outline-none"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => { setShowNoteInput(false); setNoteText(''); }}
                    className="text-xs text-neutral-500 hover:text-white px-3 py-1"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveNote}
                    disabled={!noteText.trim()}
                    className="flex items-center gap-1.5 text-xs bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-3 py-1 rounded-lg transition-colors"
                  >
                    <Save size={12} /> Sauvegarder
                  </button>
                </div>
              </div>
            )}

            <div className="relative border-l border-[#333] ml-3 space-y-6">
              {prospect.dernier_contact && (
                <div className="relative pl-6">
                  <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-orange-500 rounded-full border-[3px] border-[#121212]"></div>
                  <p className="text-sm font-medium text-white">Dernier contact enregistré</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                    <Clock size={12} />
                    <span>{new Date(prospect.dernier_contact).toLocaleString('fr-FR')}</span>
                  </div>
                </div>
              )}

              <div className="relative pl-6">
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-violet-500 rounded-full border-[3px] border-[#121212]"></div>
                <p className="text-sm font-medium text-white">Ajouté au CRM</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                  <Clock size={12} />
                  <span>{new Date(prospect.created_at).toLocaleString('fr-FR')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton de suppression en bas */}
          <div className="pt-6 border-t border-[#262626]">
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-colors font-medium text-sm"
            >
              <Trash2 size={16} />
              Supprimer définitivement ce prospect
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
