import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import CustomSelect from '../common/CustomSelect';
import { useUIStore } from '../../stores/uiStore';
import { useProspectStore } from '../../stores/prospectStore';
import { useCampagneStore } from '../../stores/campagneStore';
import { PIPELINE_STAGES, PRIORITIES, STATUTS_WEB, SECTEUR_DATA } from '../../lib/constants';
import { UserPlus, Building, Phone, MapPin, Globe, DollarSign, Calendar, AlertTriangle, Save } from 'lucide-react';

export default function ProspectFormModal() {
  const isOpen = useUIStore((s) => s.isAddProspectModalOpen);
  const close = useUIStore((s) => s.closeAddProspectModal);
  const defaultStage = useUIStore((s) => s.defaultStageForNewProspect);
  const activeCampagneId = useCampagneStore((s) => s.activeCampagneId);
  const addProspect = useProspectStore((s) => s.addProspect);

  const [formData, setFormData] = useState({
    nom: '',
    secteur: 'Boulangerie-Pâtisserie',
    telephone: '',
    adresse: '',
    statut_web: 'aucun_site',
    pipeline_stage: 'a_contacter',
    montant_estime: '1500',
    priorite: 1,
    prochain_rappel: '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        nom: '',
        secteur: 'Boulangerie-Pâtisserie',
        telephone: '',
        adresse: '',
        statut_web: 'aucun_site',
        pipeline_stage: defaultStage || 'a_contacter',
        montant_estime: '1500',
        priorite: 1,
        prochain_rappel: '',
      });
    }
  }, [isOpen, defaultStage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom.trim()) return;

    await addProspect({
      ...formData,
      campagne_id: activeCampagneId,
      montant_estime: Number(formData.montant_estime) || 0,
      priorite: Number(formData.priorite),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    close();
  };

  return (
    <Modal isOpen={isOpen} onClose={close} title="Nouveau prospect dans le Pipeline">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom & Secteur */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 flex items-center gap-1.5">
              <Building size={14} className="text-violet-400" /> Nom de l'entreprise *
            </label>
            <input
              type="text"
              required
              placeholder="ex: Boulangerie Moderne"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 placeholder-neutral-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Secteur d'activité</label>
            <input
              type="text"
              placeholder="ex: Coiffure, Restauration..."
              value={formData.secteur}
              onChange={(e) => setFormData({ ...formData, secteur: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Téléphone & Adresse */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 flex items-center gap-1.5">
              <Phone size={14} className="text-emerald-400" /> Téléphone
            </label>
            <input
              type="tel"
              placeholder="06 12 34 56 78"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 placeholder-neutral-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 flex items-center gap-1.5">
              <MapPin size={14} className="text-amber-400" /> Ville / Adresse
            </label>
            <input
              type="text"
              placeholder="Évry-Courcouronnes"
              value={formData.adresse}
              onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Étape Pipeline & Valeur estimée */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5">Étape du Pipeline</label>
            <CustomSelect
              value={formData.pipeline_stage}
              onChange={(val) => setFormData({ ...formData, pipeline_stage: val })}
              options={PIPELINE_STAGES.map((s) => ({
                value: s.id,
                label: s.label,
                color: s.color,
              }))}
              size="lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 flex items-center gap-1.5">
              <DollarSign size={14} className="text-emerald-400" /> Valeur Estimée (€)
            </label>
            <input
              type="number"
              min="0"
              step="100"
              value={formData.montant_estime}
              onChange={(e) => setFormData({ ...formData, montant_estime: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Priorité & Rappel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle size={14} className="text-amber-400" /> Priorité
            </label>
            <CustomSelect
              value={formData.priorite}
              onChange={(val) => setFormData({ ...formData, priorite: Number(val) })}
              options={PRIORITIES.map((p) => ({
                value: p.value,
                label: p.label,
                color: p.color,
              }))}
              size="lg"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-violet-400" /> Programmer un rappel
            </label>
            <input
              type="date"
              value={formData.prochain_rappel}
              onChange={(e) => setFormData({ ...formData, prochain_rappel: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-white text-sm focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#262626]">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-neutral-400 hover:text-white text-sm font-medium"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-violet-600/20 cursor-pointer"
          >
            <Save size={16} />
            Ajouter au Pipeline
          </button>
        </div>
      </form>
    </Modal>
  );
}
