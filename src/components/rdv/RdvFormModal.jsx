import { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import CustomSelect from '../common/CustomSelect';
import { useUIStore } from '../../stores/uiStore';
import { useProspectStore } from '../../stores/prospectStore';
import { useCampagneStore } from '../../stores/campagneStore';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Phone,
  UserCheck,
  Plus,
  Save,
  Building,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { PIPELINE_STAGES, SECTEURS } from '../../lib/constants';

export default function RdvFormModal() {
  const isOpen = useUIStore((s) => s.isRdvModalOpen);
  const close = useUIStore((s) => s.closeRdvModal);
  const preselectedProspectId = useUIStore((s) => s.rdvModalPreselectedProspectId);

  const prospects = useProspectStore((s) => s.prospects);
  const addProspect = useProspectStore((s) => s.addProspect);
  const updateProspect = useProspectStore((s) => s.updateProspect);
  const activeCampagneId = useCampagneStore((s) => s.activeCampagneId);

  // Onglet courant : 'existant' ou 'nouveau'
  const [mode, setMode] = useState('existant');

  // Champs prospect existant
  const [selectedProspectId, setSelectedProspectId] = useState('');

  // Champs nouveau prospect
  const [newProspect, setNewProspect] = useState({
    nom: '',
    secteur: 'Boulangerie-Pâtisserie',
    telephone: '',
    adresse: '',
    montant_estime: '1500',
  });

  // Champs communs RDV
  const todayStr = new Date().toISOString().split('T')[0];
  const [dateRdv, setDateRdv] = useState(todayStr);
  const [heureRdv, setHeureRdv] = useState('10:00');
  const [formatRdv, setFormatRdv] = useState('visio'); // 'visio', 'presentiel', 'telephone'
  const [notesRdv, setNotesRdv] = useState('');

  // Liste des prospects de la campagne active
  const campagneProspects = useMemo(() => {
    return prospects.filter((p) => !activeCampagneId || p.campagne_id === activeCampagneId);
  }, [prospects, activeCampagneId]);

  useEffect(() => {
    if (isOpen) {
      if (preselectedProspectId) {
        setMode('existant');
        setSelectedProspectId(preselectedProspectId);
      } else {
        setMode('existant');
        setSelectedProspectId(campagneProspects[0]?.id || '');
      }

      setDateRdv(new Date().toISOString().split('T')[0]);
      setHeureRdv('10:00');
      setFormatRdv('visio');
      setNotesRdv('');
      setNewProspect({
        nom: '',
        secteur: 'Boulangerie-Pâtisserie',
        telephone: '',
        adresse: '',
        montant_estime: '1500',
      });
    }
  }, [isOpen, preselectedProspectId, campagneProspects]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calcul de la date ISO du rendez-vous
    const fullDateIso = `${dateRdv}T${heureRdv}:00.000Z`;

    if (mode === 'existant') {
      if (!selectedProspectId) return;

      const target = prospects.find((p) => p.id === selectedProspectId);
      if (!target) return;

      const updatedNotes = notesRdv.trim()
        ? (target.notes ? target.notes + '\n' : '') + `[RDV ${formatRdv.toUpperCase()}] ${notesRdv.trim()}`
        : target.notes;

      await updateProspect(target.id, {
        pipeline_stage: 'rdv_pris',
        prochain_rappel: fullDateIso,
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      });
    } else {
      if (!newProspect.nom.trim()) return;

      const noteContent = notesRdv.trim()
        ? `[RDV ${formatRdv.toUpperCase()}] ${notesRdv.trim()}`
        : `RDV qualifié planifié pour le ${dateRdv} à ${heureRdv}`;

      await addProspect({
        nom: newProspect.nom.trim(),
        secteur: newProspect.secteur,
        telephone: newProspect.telephone,
        adresse: newProspect.adresse,
        statut_web: 'aucun_site',
        pipeline_stage: 'rdv_pris',
        montant_estime: Number(newProspect.montant_estime) || 0,
        priorite: 2,
        prochain_rappel: fullDateIso,
        notes: noteContent,
        campagne_id: activeCampagneId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    close();
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Planifier un Rendez-vous Commercial">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Sélecteur de Mode (Onglets Existant vs Nouveau) */}
        {!preselectedProspectId && (
          <div className="flex bg-[#111] p-1 rounded-xl border border-[#262626] gap-1">
            <button
              type="button"
              onClick={() => setMode('existant')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'existant'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <UserCheck size={14} />
              <span>Prospect Existant</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('nouveau')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'nouveau'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Plus size={14} />
              <span>Créer & Planifier</span>
            </button>
          </div>
        )}

        {/* ── Mode A : Prospect Existant ── */}
        {mode === 'existant' && (
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 flex items-center gap-1.5">
              <UserCheck size={14} className="text-blue-400" /> Sélectionner le Prospect *
            </label>
            <CustomSelect
              value={selectedProspectId}
              onChange={(val) => setSelectedProspectId(val)}
              options={campagneProspects.map((p) => ({
                value: p.id,
                label: `${p.nom} — (${p.secteur || 'Sans secteur'})`,
              }))}
              placeholder="Rechercher un prospect..."
              size="lg"
            />
          </div>
        )}

        {/* ── Mode B : Nouveau Prospect ── */}
        {mode === 'nouveau' && (
          <div className="space-y-3 bg-[#161616] p-3.5 rounded-xl border border-[#282828]">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
              Informations du nouveau prospect
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Nom entreprise *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Boulangerie Moderne"
                  value={newProspect.nom}
                  onChange={(e) => setNewProspect({ ...newProspect, nom: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Secteur</label>
                <input
                  type="text"
                  placeholder="ex: Coiffure, Restauration..."
                  value={newProspect.secteur}
                  onChange={(e) => setNewProspect({ ...newProspect, secteur: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Téléphone</label>
                <input
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={newProspect.telephone}
                  onChange={(e) => setNewProspect({ ...newProspect, telephone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Valeur estimée (€)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={newProspect.montant_estime}
                  onChange={(e) => setNewProspect({ ...newProspect, montant_estime: e.target.value })}
                  className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded-lg text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Paramètres du Rendez-vous ── */}
        <div className="space-y-4 pt-1 border-t border-[#262626]">
          <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={14} className="text-blue-400" /> Date & Format du Rendez-vous
          </h4>

          {/* Date & Heure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Date du RDV *</label>
              <input
                type="date"
                required
                value={dateRdv}
                onChange={(e) => setDateRdv(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Heure du RDV *</label>
              <input
                type="time"
                required
                value={heureRdv}
                onChange={(e) => setHeureRdv(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Format RDV (Visio / Présentiel / Téléphone) */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-2">Format du Rendez-vous</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormatRdv('visio')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  formatRdv === 'visio'
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500 shadow-md'
                    : 'bg-[#181818] border-[#333] text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Video size={18} className="mb-1" />
                Visioconférence
              </button>

              <button
                type="button"
                onClick={() => setFormatRdv('presentiel')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  formatRdv === 'presentiel'
                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500 shadow-md'
                    : 'bg-[#181818] border-[#333] text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <MapPin size={18} className="mb-1" />
                Sur place
              </button>

              <button
                type="button"
                onClick={() => setFormatRdv('telephone')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  formatRdv === 'telephone'
                    ? 'bg-violet-600/20 text-violet-400 border-violet-500 shadow-md'
                    : 'bg-[#181818] border-[#333] text-neutral-400 hover:text-white hover:border-neutral-700'
                }`}
              >
                <Phone size={18} className="mb-1" />
                Téléphone
              </button>
            </div>
          </div>

          {/* Notes / Ordre du jour */}
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
              Notes & Ordre du jour (optionnel)
            </label>
            <textarea
              rows="2"
              value={notesRdv}
              onChange={(e) => setNotesRdv(e.target.value)}
              placeholder="ex: Présentation de la maquette web, préparation devis..."
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-white text-xs placeholder-neutral-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Boutons d'action */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#262626]">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-neutral-400 hover:text-white text-xs font-medium cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <Save size={16} />
            <span>Valider le Rendez-vous</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
