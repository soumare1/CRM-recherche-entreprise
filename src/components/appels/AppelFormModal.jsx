import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import CustomSelect from '../common/CustomSelect';
import { useUIStore } from '../../stores/uiStore';
import { useProspectStore } from '../../stores/prospectStore';
import { APPEL_RESULTATS, SECTEUR_DATA } from '../../lib/constants';
import { Phone, PhoneOff, Calendar, Save, Sparkles, ChevronDown, ChevronUp, Lightbulb, TrendingUp } from 'lucide-react';

// ── Pitch Assistant Panel ─────────────────────────────────────────────────
function PitchAssistant({ secteurId }) {
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState('accroches');

  const data = SECTEUR_DATA[secteurId];
  if (!data) return null;

  return (
    <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-violet-500/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-violet-400" />
          <span className="text-sm font-semibold text-violet-300">Pitch Assistant</span>
          <span className="text-[10px] text-violet-500 bg-violet-500/15 px-1.5 py-0.5 rounded font-medium">IA</span>
        </div>
        {open ? <ChevronUp size={15} className="text-violet-500" /> : <ChevronDown size={15} className="text-violet-500" />}
      </button>

      {open && (
        <div className="px-4 pb-4">
          {/* Tabs */}
          <div className="flex gap-1 mb-3 bg-[#111] rounded-lg p-1">
            <button
              type="button"
              onClick={() => setTab('accroches')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === 'accroches'
                  ? 'bg-violet-600 text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <Lightbulb size={11} /> Accroches
            </button>
            <button
              type="button"
              onClick={() => setTab('solutions')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                tab === 'solutions'
                  ? 'bg-violet-600 text-white'
                  : 'text-neutral-500 hover:text-neutral-300'
              }`}
            >
              <TrendingUp size={11} /> Solutions
            </button>
          </div>

          {/* Accroches */}
          {tab === 'accroches' && (
            <ul className="space-y-2">
              {data.accroches.map((a, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-neutral-300 leading-relaxed">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-[9px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="italic">"{a}"</span>
                </li>
              ))}
            </ul>
          )}

          {/* Solutions */}
          {tab === 'solutions' && (
            <ul className="space-y-1.5">
              {data.solutions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                  <span className="shrink-0 text-violet-400 mt-0.5">▸</span>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ── Modal principal ───────────────────────────────────────────────────────
export default function AppelFormModal() {
  const callingProspectId = useUIStore(state => state.callingProspectId);
  const setCallingProspectId = useUIStore(state => state.setCallingProspectId);
  const prospects = useProspectStore(state => state.prospects);
  const logAppel = useProspectStore(state => state.logAppel);
  const updateProspect = useProspectStore(state => state.updateProspect);

  const [aDecroche, setADecroche] = useState(null);
  const [resultat, setResultat] = useState('');
  const [notes, setNotes] = useState('');
  const [dateRappel, setDateRappel] = useState('');

  const prospect = prospects.find(p => p.id === callingProspectId);

  useEffect(() => {
    if (callingProspectId) {
      setADecroche(null);
      setResultat('');
      setNotes('');
      setDateRappel('');
    }
  }, [callingProspectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prospect) return;

    await logAppel(prospect.id, {
      a_decroche: aDecroche,
      resultat: aDecroche ? resultat : 'injoignable',
      notes,
      prochain_rappel: dateRappel || null,
    });

    setCallingProspectId(null);
  };

  if (!prospect) return null;

  const resultats = (APPEL_RESULTATS || []).filter(r => r.id !== 'injoignable');

  // Résoudre l'id secteur depuis le label (pour compatibilité avec les anciens prospects)
  const secteurId = prospect.secteur_id
    || Object.entries(SECTEUR_DATA).find(([, v]) =>
        v.sousCategories?.some(s => s === prospect.secteur)
      )?.[0]
    || prospect.secteur?.toLowerCase().replace(/\s+/g, '_').replace(/[&éèêë]/g, c =>
        ({ '&': '', 'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e' }[c] || c)
      );

  const hasPitch = !!SECTEUR_DATA[secteurId];

  return (
    <Modal
      isOpen={!!callingProspectId}
      onClose={() => setCallingProspectId(null)}
      title={`Enregistrer un appel — ${prospect.nom}`}
    >
      <div className={hasPitch ? 'grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6' : ''}>

        {/* ── Formulaire ── */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Décroché ? */}
          <div>
            <label className="block text-sm font-medium text-neutral-400 mb-3">
              Le prospect a-t-il décroché ?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setADecroche(true); setResultat('rappeler'); }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  aDecroche === true
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-[#181818] border-[#333] text-neutral-400 hover:border-emerald-500/50 hover:text-emerald-400'
                }`}
              >
                <Phone size={24} className="mb-2" />
                <span className="font-medium">Oui, contact établi</span>
              </button>
              <button
                type="button"
                onClick={() => { setADecroche(false); setResultat(''); }}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                  aDecroche === false
                    ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                    : 'bg-[#181818] border-[#333] text-neutral-400 hover:border-orange-500/50 hover:text-orange-400'
                }`}
              >
                <PhoneOff size={24} className="mb-2" />
                <span className="font-medium">Non, injoignable</span>
              </button>
            </div>
          </div>

          {/* Résultat */}
          {aDecroche === true && (
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Résultat de l'appel
              </label>
              <CustomSelect
                value={resultat}
                onChange={(val) => setResultat(val)}
                options={resultats.map((r) => ({
                  value: r.id,
                  label: r.label,
                }))}
                placeholder="Sélectionnez un résultat"
                size="lg"
              />
            </div>
          )}

          {/* Date de rappel ou de RDV */}
          {(aDecroche === false || resultat === 'rappeler' || resultat === 'rdv_pris') && (
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                <span className="flex items-center gap-2">
                  <Calendar size={16} />
                  {resultat === 'rdv_pris'
                    ? 'Date du Rendez-vous commercial'
                    : 'Programmer un rappel (optionnel)'}
                </span>
              </label>
              <input
                type="date"
                required={resultat === 'rdv_pris'}
                value={dateRappel}
                onChange={(e) => setDateRappel(e.target.value)}
                className="w-full px-4 py-3 bg-[#181818] border border-[#333] rounded-xl text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          )}

          {/* Notes */}
          {aDecroche !== null && (
            <div>
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Notes d'appel
              </label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Résumé de l'échange..."
                className="w-full px-4 py-3 bg-[#181818] border border-[#333] rounded-xl text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#262626]">
            <button
              type="button"
              onClick={() => setCallingProspectId(null)}
              className="px-5 py-2.5 text-neutral-400 hover:text-white font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={aDecroche === null}
              className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              Enregistrer l'appel
            </button>
          </div>
        </form>

        {/* ── Pitch Assistant (colonne droite si écran large, en bas sinon) ── */}
        {hasPitch && <PitchAssistant secteurId={secteurId} />}
      </div>
    </Modal>
  );
}
