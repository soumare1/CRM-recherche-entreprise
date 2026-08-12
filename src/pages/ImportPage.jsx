import { useState } from 'react';
import { Upload, ClipboardPaste, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useCampagneStore } from '../stores/campagneStore';
import { useProspectStore } from '../stores/prospectStore';
import { parseTSV } from '../lib/utils';
import confetti from 'canvas-confetti';

export default function ImportPage() {
  const [pasteData, setPasteData] = useState('');
  const [preview, setPreview] = useState([]);
  const [imported, setImported] = useState(false);

  const activeCampagneId = useCampagneStore(state => state.activeCampagneId);
  const campagnes = useCampagneStore(state => state.campagnes);
  const activeCampagne = campagnes.find(c => c.id === activeCampagneId);
  const addProspect = useProspectStore(state => state.addProspect);

  const handlePasteChange = (e) => {
    const text = e.target.value;
    setPasteData(text);
    setPreview(text.trim() ? parseTSV(text) : []);
  };

  const handleImport = () => {
    if (!activeCampagneId || preview.length === 0) return;

    preview.forEach(prospect => {
      addProspect({
        ...prospect,
        campagne_id: activeCampagneId,
        pipeline_stage: 'a_contacter',
        priorite: 0,
        tags: [],
      });
    });

    setImported(true);
    setPasteData('');
    setPreview([]);

    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#8b5cf6', '#3b82f6', '#10b981'] });
    setTimeout(() => setImported(false), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Import de prospects</h2>
        <p className="text-sm text-neutral-400">
          Copiez-collez depuis votre fichier Excel pour les ajouter à la campagne{' '}
          <strong className="text-white">{activeCampagne?.nom || '— Sélectionnez une campagne'}</strong>.
        </p>
      </div>

      {imported && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-400">
          <CheckCircle2 size={20} />
          <p className="font-medium">Import réussi ! Les prospects sont maintenant dans votre pipeline.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div className="p-6 rounded-2xl bg-[#181818] border border-[#262626]">
          <div className="flex items-center gap-3 mb-4 text-neutral-200">
            <ClipboardPaste size={20} className="text-violet-500" />
            <h3 className="font-medium">Zone de collage (TSV / Excel)</h3>
          </div>

          <textarea
            value={pasteData}
            onChange={handlePasteChange}
            placeholder={"Ex: AFK Épicerie\tÉpicerie fine\t36 rue Nettie Stevens, 91000\t06 51 49 88 96\tAucun site web\tPas de site"}
            className="w-full h-40 bg-[#121212] border border-[#333] rounded-xl p-4 text-sm text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-mono"
          />

          <p className="mt-2 text-xs text-neutral-600">
            Format attendu (colonnes séparées par tabulation) : Nom · Secteur · Adresse · Téléphone · Description web · Statut
          </p>
        </div>

        {preview.length > 0 && (
          <div className="p-6 rounded-2xl bg-[#181818] border border-violet-500/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-violet-500" />

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-medium text-white mb-1">Prévisualisation</h3>
                <p className="text-xs text-neutral-400">{preview.length} prospect{preview.length > 1 ? 's' : ''} détecté{preview.length > 1 ? 's' : ''}</p>
              </div>

              <button
                onClick={handleImport}
                disabled={!activeCampagneId}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Importer {preview.length} prospect{preview.length > 1 ? 's' : ''}
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-neutral-400">
                <thead className="text-xs uppercase bg-[#121212] text-neutral-500 border-b border-[#262626]">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nom</th>
                    <th className="px-4 py-3 font-medium">Secteur</th>
                    <th className="px-4 py-3 font-medium">Téléphone</th>
                    <th className="px-4 py-3 font-medium">Présence Web</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 5).map((p, i) => (
                    <tr key={i} className="border-b border-[#262626] bg-[#1a1a1a]">
                      <td className="px-4 py-3 font-medium text-neutral-200">{p.nom}</td>
                      <td className="px-4 py-3">{p.secteur || '—'}</td>
                      <td className="px-4 py-3 text-neutral-300">{p.telephone || '—'}</td>
                      <td className="px-4 py-3">
                        {p.statut_web === 'aucun_site' && <span className="text-red-400 text-xs bg-red-400/10 px-2 py-1 rounded">Aucun site</span>}
                        {p.statut_web === 'site_obsolete' && <span className="text-amber-400 text-xs bg-amber-400/10 px-2 py-1 rounded">Obsolète</span>}
                        {p.statut_web === 'site_ok' && <span className="text-emerald-400 text-xs bg-emerald-400/10 px-2 py-1 rounded">Site OK</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 5 && (
                <div className="py-3 text-center text-xs text-neutral-500 bg-[#121212] border-t border-[#262626]">
                  … et {preview.length - 5} autres prospects
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
