import { useState, useRef } from 'react';
import { 
  User, 
  FolderKanban, 
  Database, 
  Save, 
  RotateCcw,
  Download, 
  Upload, 
  Check, 
  Trash2, 
  Plus, 
  Sparkles, 
  ShieldCheck, 
  Building, 
  Mail, 
  Phone, 
  AlertTriangle,
  Sliders,
  Pencil,
  X,
  Moon,
  Sun,
  Palette
} from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { useCampagneStore } from '../stores/campagneStore';
import { useProspectStore } from '../stores/prospectStore';
import CustomSelect from '../components/common/CustomSelect';
import { useUIStore } from '../stores/uiStore';
import { isSupabaseEnabled } from '../lib/supabase';
import { SECTEURS } from '../lib/constants';

const AVATAR_SEEDS = ['Felix', 'Aneka', 'Bandit', 'Alexander', 'Willow', 'Oliver', 'Maya', 'Zion', 'Trouble', 'Pepper'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saveToast, setSaveToast] = useState(false);

  const { profile, preferences, updateProfile, updatePreferences, resetProfile } = useSettingsStore();
  const { campagnes, activeCampagneId, setActiveCampagne, addCampagne, updateCampagne, removeCampagne } = useCampagneStore();
  const prospects = useProspectStore((state) => state.prospects);
  const openConfirmModal = useUIStore((state) => state.openConfirmModal);

  // Form local state pour Profil
  const [formData, setFormData] = useState({ ...profile });
  const [prefData, setPrefData] = useState({ ...preferences });

  // Modales Campagne
  const [showAddCampagne, setShowAddCampagne] = useState(false);
  const [newCampagneNom, setNewCampagneNom] = useState('');
  const [newCampagneDesc, setNewCampagneDesc] = useState('');

  const [editingCampagne, setEditingCampagne] = useState(null); // { id, nom, description }

  // Import JSON ref
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState(null);

  const triggerToast = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile(formData);
    triggerToast();
  };

  const handleResetProfile = () => {
    openConfirmModal({
      title: 'Réinitialiser le profil',
      message: 'Voulez-vous réinitialiser les informations du profil aux valeurs par défaut ?',
      confirmText: 'Réinitialiser',
      onConfirm: () => {
        resetProfile();
        const defaultState = useSettingsStore.getState().profile;
        setFormData({ ...defaultState });
        triggerToast();
      },
    });
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    updatePreferences(prefData);
    triggerToast();
  };

  const handleAddCampagneSubmit = (e) => {
    e.preventDefault();
    if (!newCampagneNom.trim()) return;
    addCampagne(newCampagneNom.trim(), newCampagneDesc.trim());
    setNewCampagneNom('');
    setNewCampagneDesc('');
    setShowAddCampagne(false);
    triggerToast();
  };

  const handleEditCampagneSubmit = (e) => {
    e.preventDefault();
    if (!editingCampagne || !editingCampagne.nom.trim()) return;
    updateCampagne(editingCampagne.id, {
      nom: editingCampagne.nom.trim(),
      description: editingCampagne.description.trim(),
    });
    setEditingCampagne(null);
    triggerToast();
  };

  // Exporter la base complète (JSON)
  const handleExportData = () => {
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile,
      preferences,
      campagnes,
      prospects,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appforge_crm_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importer un fichier JSON
  const handleImportData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.profile) {
          updateProfile(data.profile);
          setFormData({ ...data.profile });
        }
        if (data.preferences) {
          updatePreferences(data.preferences);
          setPrefData({ ...data.preferences });
        }

        // Si prospects présents dans le backup
        if (Array.isArray(data.prospects)) {
          useProspectStore.setState({ prospects: data.prospects });
        }
        if (Array.isArray(data.campagnes)) {
          useCampagneStore.setState({ campagnes: data.campagnes });
        }

        setImportStatus({ success: true, message: 'Sauvegarde restaurée avec succès !' });
        setTimeout(() => setImportStatus(null), 4000);
      } catch (err) {
        setImportStatus({ success: false, message: 'Fichier JSON invalide.' });
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  // Réinitialiser les données locales
  const handleResetStorage = () => {
    openConfirmModal({
      title: 'Réinitialiser la base de données',
      message: 'Attention : toutes les données locales (prospects et campagnes) seront réinitialisées. Continuer ?',
      confirmText: 'Réinitialiser tout',
      onConfirm: () => {
        localStorage.clear();
        window.location.reload();
      },
    });
  };

  const avatarUrl = formData.customAvatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.avatarSeed || 'Felix'}`;

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto space-y-6 pb-12">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl shadow-xl shadow-emerald-500/20 font-medium text-sm animate-in fade-in slide-in-from-bottom-5">
          <Check size={18} />
          Modifications enregistrées avec succès !
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Paramètres & Profil</h2>
        <p className="text-sm text-neutral-400">
          Gérez votre profil prospecteur, vos campagnes, vos préférences et la sauvegarde de vos données.
        </p>
      </div>

      {/* Onglets */}
      <div className="flex border-b border-[#262626] gap-2 overflow-x-auto scrollbar-hide">
        {[
          { id: 'profile', label: 'Mon Profil', icon: User },
          { id: 'campagnes', label: 'Campagnes', icon: FolderKanban },
          { id: 'preferences', label: 'Préférences & UX', icon: Sliders },
          { id: 'data', label: 'Sauvegarde & Données', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap ${
                isActive
                  ? 'border-violet-500 text-violet-400 bg-violet-500/5'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── ONGLET 1 : MON PROFIL ── */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire Profil */}
          <form onSubmit={handleSaveProfile} className="lg:col-span-2 space-y-6">
            <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-5">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <User size={20} className="text-violet-400" />
                Informations personnelles
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Nom complet</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Rôle / Poste</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Entreprise / Studio</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Email professionnel</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Téléphone direct</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Présentation / Accroche</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Avatar Selector */}
            <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Sparkles size={20} className="text-fuchsia-400" />
                Personnalisation de l'avatar
              </h3>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2">Style d'avatar prédéfini</label>
                <div className="flex flex-wrap gap-3">
                  {AVATAR_SEEDS.map((seed) => {
                    const isSelected = formData.avatarSeed === seed && !formData.customAvatarUrl;
                    return (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarSeed: seed, customAvatarUrl: '' })}
                        className={`w-12 h-12 rounded-xl border-2 p-0.5 transition-all overflow-hidden bg-neutral-900 ${
                          isSelected ? 'border-violet-500 scale-110 shadow-lg shadow-violet-500/20' : 'border-[#333] hover:border-neutral-500'
                        }`}
                      >
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                          alt={seed}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Ou URL d'image personnalisée</label>
                <input
                  type="url"
                  placeholder="https://exemple.com/mon-avatar.png"
                  value={formData.customAvatarUrl}
                  onChange={(e) => setFormData({ ...formData, customAvatarUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-violet-600/20"
              >
                <Save size={18} />
                Enregistrer le profil
              </button>

              <button
                type="button"
                onClick={handleResetProfile}
                className="flex items-center gap-2 px-4 py-3 bg-[#181818] hover:bg-neutral-800 text-neutral-400 hover:text-white font-medium text-sm rounded-xl border border-[#333] transition-colors"
              >
                <RotateCcw size={16} />
                Réinitialiser
              </button>
            </div>
          </form>

          {/* Carte Aperçu Profil */}
          <div className="space-y-6">
            <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-r from-violet-600/30 to-fuchsia-600/30" />
              
              <div className="relative mt-8 mb-4">
                <div className="w-24 h-24 rounded-2xl border-4 border-[#121212] bg-neutral-900 overflow-hidden shadow-2xl">
                  <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                </div>
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-[#121212] rounded-full shadow-md" />
              </div>

              <h4 className="text-xl font-bold text-white mb-1">{formData.name || 'Nom Prospecteur'}</h4>
              <p className="text-xs text-violet-400 font-medium mb-1">{formData.role || 'Rôle'}</p>
              <p className="text-xs text-neutral-400 flex items-center gap-1 mb-4">
                <Building size={12} /> {formData.company || 'AppForge Studio'}
              </p>

              {formData.bio && (
                <p className="text-xs text-neutral-400 bg-[#181818] border border-[#262626] p-3 rounded-xl mb-4 italic">
                  "{formData.bio}"
                </p>
              )}

              <div className="w-full pt-4 border-t border-[#262626] space-y-2 text-left text-xs text-neutral-300">
                <div className="flex items-center gap-2 truncate">
                  <Mail size={14} className="text-neutral-500 shrink-0" />
                  <span className="truncate">{formData.email}</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Phone size={14} className="text-neutral-500 shrink-0" />
                  <span>{formData.phone}</span>
                </div>
              </div>
            </div>

            {/* Statistiques Prospecteur */}
            <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-4">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider text-neutral-400">Statistiques CRM</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#181818] border border-[#262626] p-3.5 rounded-xl">
                  <span className="text-2xl font-bold text-white">{prospects.length}</span>
                  <p className="text-xs text-neutral-400 mt-1">Prospects total</p>
                </div>
                <div className="bg-[#181818] border border-[#262626] p-3.5 rounded-xl">
                  <span className="text-2xl font-bold text-emerald-400">
                    {prospects.filter(p => p.pipeline_stage === 'signe').length}
                  </span>
                  <p className="text-xs text-neutral-400 mt-1">Signés</p>
                </div>
                <div className="bg-[#181818] border border-[#262626] p-3.5 rounded-xl">
                  <span className="text-2xl font-bold text-violet-400">{campagnes.length}</span>
                  <p className="text-xs text-neutral-400 mt-1">Campagnes</p>
                </div>
                <div className="bg-[#181818] border border-[#262626] p-3.5 rounded-xl">
                  <span className="text-2xl font-bold text-amber-400">
                    {prospects.filter(p => p.pipeline_stage === 'rdv_pris').length}
                  </span>
                  <p className="text-xs text-neutral-400 mt-1">RDV pris</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ONGLET 2 : GESTION DES CAMPAGNES ── */}
      {activeTab === 'campagnes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <FolderKanban size={20} className="text-violet-400" />
              Vos campagnes de prospection ({campagnes.length})
            </h3>
            <button
              onClick={() => setShowAddCampagne(true)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm rounded-xl transition-colors shadow-md shadow-violet-600/20"
            >
              <Plus size={16} />
              Nouvelle campagne
            </button>
          </div>

          {/* Liste des campagnes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {campagnes.map((c) => {
              const isActive = c.id === activeCampagneId;
              const count = prospects.filter((p) => p.campagne_id === c.id).length;
              return (
                <div
                  key={c.id}
                  className={`bg-[#121212] border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                    isActive ? 'border-violet-500/80 bg-violet-500/5 shadow-lg shadow-violet-500/10' : 'border-[#262626] hover:border-neutral-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(10,255,160,0.6)]' : 'bg-neutral-600'}`} />
                        <h4 className="font-semibold text-white text-base truncate">{c.nom}</h4>
                      </div>
                      {isActive && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                          Active
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 line-clamp-2">
                      {c.description || 'Pas de description renseignée.'}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#262626] flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-400">
                      {count} prospect{count !== 1 ? 's' : ''}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {!isActive && (
                        <button
                          onClick={() => setActiveCampagne(c.id)}
                          className="px-3 py-1.5 text-xs font-medium bg-[#181818] hover:bg-violet-600 text-neutral-300 hover:text-white rounded-lg transition-colors border border-[#333]"
                        >
                          Activer
                        </button>
                      )}
                      
                      {/* Bouton Éditer */}
                      <button
                        onClick={() => setEditingCampagne({ id: c.id, nom: c.nom, description: c.description || '' })}
                        className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800/80 rounded-lg transition-colors"
                        title="Éditer"
                      >
                        <Pencil size={16} />
                      </button>

                      {/* Bouton Supprimer */}
                      <button
                        type="button"
                        disabled={campagnes.length <= 1}
                        onClick={() => {
                          if (campagnes.length <= 1) return;
                          openConfirmModal({
                            title: 'Supprimer la campagne',
                            message: `Êtes-vous sûr de vouloir supprimer la campagne "${c.nom}" ? Tous les prospects associés seront également supprimés.`,
                            confirmText: 'Supprimer',
                            onConfirm: () => {
                              removeCampagne(c.id);
                              triggerToast();
                            },
                          });
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          campagnes.length > 1
                            ? 'text-neutral-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer'
                            : 'text-neutral-700 opacity-40 cursor-not-allowed'
                        }`}
                        title={campagnes.length > 1 ? "Supprimer la campagne" : "Au moins une campagne doit être conservée"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal Ajout Campagne */}
          {showAddCampagne && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <form onSubmit={handleAddCampagneSubmit} className="bg-[#121212] border border-[#262626] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white">Créer une nouvelle campagne</h4>
                  <button type="button" onClick={() => setShowAddCampagne(false)} className="text-neutral-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Nom de la campagne</label>
                  <input
                    type="text"
                    placeholder="ex: Restos Lyon Q3"
                    value={newCampagneNom}
                    onChange={(e) => setNewCampagneNom(e.target.value)}
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Description (optionnelle)</label>
                  <textarea
                    rows={3}
                    placeholder="Objectifs, ciblage..."
                    value={newCampagneDesc}
                    onChange={(e) => setNewCampagneDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddCampagne(false)}
                    className="px-4 py-2 text-sm text-neutral-400 hover:text-white"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-600/20"
                  >
                    Créer
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Modal Édition Campagne */}
          {editingCampagne && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <form onSubmit={handleEditCampagneSubmit} className="bg-[#121212] border border-[#262626] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-white">Éditer la campagne</h4>
                  <button type="button" onClick={() => setEditingCampagne(null)} className="text-neutral-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Nom de la campagne</label>
                  <input
                    type="text"
                    value={editingCampagne.nom}
                    onChange={(e) => setEditingCampagne({ ...editingCampagne, nom: e.target.value })}
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={editingCampagne.description}
                    onChange={(e) => setEditingCampagne({ ...editingCampagne, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-sm text-white focus:outline-none focus:border-violet-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCampagne(null)}
                    className="px-4 py-2 text-sm text-neutral-400 hover:text-white"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-600/20"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── ONGLET 3 : PRÉFÉRENCES & UX ── */}
      {activeTab === 'preferences' && (
        <form onSubmit={handleSavePreferences} className="space-y-6 max-w-3xl">
          {/* Section 1 : Thème & Apparence */}
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-6 shadow-lg">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Palette size={20} className="text-violet-400" />
              Thème & Thème de couleurs d'accentuation
            </h3>

            {/* Mode Sombre vs Clair */}
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                Mode d'Affichage
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...prefData, themeMode: 'dark' };
                    setPrefData(updated);
                    updatePreferences(updated);
                  }}
                  className={`p-4 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                    (prefData.themeMode || 'dark') === 'dark'
                      ? 'bg-violet-500/10 border-violet-500 text-white ring-2 ring-violet-500/40 shadow-lg'
                      : 'bg-[#181818] border-[#262626] text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-violet-400">
                    <Moon size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Mode Sombre (Dark)</div>
                    <div className="text-xs text-neutral-400">Design sombre immersif haute performance</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const updated = { ...prefData, themeMode: 'light' };
                    setPrefData(updated);
                    updatePreferences(updated);
                  }}
                  className={`p-4 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                    prefData.themeMode === 'light'
                      ? 'bg-violet-500/10 border-violet-500 text-white ring-2 ring-violet-500/40 shadow-lg'
                      : 'bg-[#181818] border-[#262626] text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <Sun size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold">Mode Clair (Light)</div>
                    <div className="text-xs text-neutral-400">Fond blanc haute lisibilité pour travail de jour</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Thèmes de Couleurs d'Accentuation */}
            <div className="pt-4 border-t border-[#262626]">
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                Couleur principale d'accentuation
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'violet', label: 'Violet Néon', color: '#8b5cf6', class: 'bg-violet-600' },
                  { id: 'indigo', label: 'Indigo Profond', color: '#4f46e5', class: 'bg-indigo-600' },
                  { id: 'blue', label: 'Bleu Royal', color: '#2563eb', class: 'bg-blue-600' },
                  { id: 'emerald', label: 'Émeraude', color: '#059669', class: 'bg-emerald-600' },
                  { id: 'amber', label: 'Ambre Solaire', color: '#d97706', class: 'bg-amber-600' },
                  { id: 'rose', label: 'Rose Néon', color: '#e11d48', class: 'bg-rose-600' },
                ].map((c) => {
                  const isSelected = (prefData.accentColor || 'violet') === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        const updated = { ...prefData, accentColor: c.id };
                        setPrefData(updated);
                        updatePreferences(updated);
                      }}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#181818] border-white text-white ring-2 ring-violet-500/50 shadow-md'
                          : 'bg-[#181818] border-[#262626] text-neutral-400 hover:border-neutral-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full ${c.class} shrink-0 shadow-sm`} />
                      <span className="text-xs font-bold">{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2 : Réglages Prospection */}
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-6 shadow-lg">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Sliders size={20} className="text-violet-400" />
              Réglages par défaut de la prospection
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Ville par défaut (Recherche)</label>
                <input
                  type="text"
                  value={prefData.defaultCity}
                  onChange={(e) => setPrefData({ ...prefData, defaultCity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#333] rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1.5">Secteur cible favori</label>
                <CustomSelect
                  value={prefData.defaultTargetSector}
                  onChange={(val) => setPrefData({ ...prefData, defaultTargetSector: val })}
                  options={[
                    { value: 'all', label: 'Tous les secteurs' },
                    ...SECTEURS.map((s) => ({ value: s.id, label: s.label })),
                  ]}
                  searchable={true}
                  size="lg"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-4 border-t border-[#262626] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-white">Recherche OpenStreetMap hybride</h4>
                  <p className="text-xs text-neutral-400">Compléter automatiquement avec des prospects virtuels si la ville est peu dense.</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefData.autoOsmFallback}
                  onChange={(e) => setPrefData({ ...prefData, autoOsmFallback: e.target.checked })}
                  className="w-5 h-5 accent-violet-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1f1f1f]">
                <div>
                  <h4 className="text-sm font-medium text-white">Rappels de relances quotidiennes</h4>
                  <p className="text-xs text-neutral-400">Afficher un badge de rappel lorsque des relances sont en retard.</p>
                </div>
                <input
                  type="checkbox"
                  checked={prefData.emailReminders}
                  onChange={(e) => setPrefData({ ...prefData, emailReminders: e.target.checked })}
                  className="w-5 h-5 accent-violet-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-violet-600/20"
          >
            <Save size={18} />
            Enregistrer les préférences
          </button>
        </form>
      )}

      {/* ── ONGLET 4 : SAUVEGARDE & DONNÉES ── */}
      {activeTab === 'data' && (
        <div className="space-y-6 max-w-4xl">
          {/* Statut Backend / Supabase */}
          <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl border ${isSupabaseEnabled() ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="text-base font-semibold text-white">
                  {isSupabaseEnabled() ? 'Mode Supabase Cloud Connecté' : 'Mode Stockage Local (localStorage)'}
                </h4>
                <p className="text-xs text-neutral-400">
                  {isSupabaseEnabled()
                    ? 'Vos données sont synchronisées en temps réel sur la base de données cloud Supabase.'
                    : 'Vos prospects et campagnes sont enregistrés dans la mémoire de votre navigateur.'}
                </p>
              </div>
            </div>

            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${isSupabaseEnabled() ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
              {isSupabaseEnabled() ? 'Cloud Synced' : 'Mode Local'}
            </span>
          </div>

          {/* Export / Import */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exporter */}
            <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-3">
                  <Download size={20} />
                </div>
                <h4 className="text-base font-semibold text-white mb-1">Exporter la base CRM</h4>
                <p className="text-xs text-neutral-400">
                  Téléchargez l'intégralité de vos prospects, campagnes et réglages au format JSON pour les sauvegarder.
                </p>
              </div>

              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#181818] hover:bg-violet-600 text-white font-medium text-sm rounded-xl border border-[#333] hover:border-violet-500 transition-all"
              >
                <Download size={16} />
                Télécharger la sauvegarde (.json)
              </button>
            </div>

            {/* Importer */}
            <div className="bg-[#121212] border border-[#262626] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 flex items-center justify-center mb-3">
                  <Upload size={20} />
                </div>
                <h4 className="text-base font-semibold text-white mb-1">Restaurer une sauvegarde</h4>
                <p className="text-xs text-neutral-400">
                  Importez un fichier JSON généré précédemment pour restaurer l'état de votre CRM.
                </p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportData}
                accept=".json"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#181818] hover:bg-fuchsia-600 text-white font-medium text-sm rounded-xl border border-[#333] hover:border-fuchsia-500 transition-all"
              >
                <Upload size={16} />
                Sélectionner un fichier (.json)
              </button>
            </div>
          </div>

          {importStatus && (
            <div className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-2 ${importStatus.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              {importStatus.success ? <Check size={18} /> : <AlertTriangle size={18} />}
              {importStatus.message}
            </div>
          )}

          {/* Zone de Danger */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-red-400 font-semibold text-base">
              <AlertTriangle size={20} />
              Zone de réinitialisation
            </div>
            <p className="text-xs text-neutral-400">
              Réinitialise le stockage local du navigateur. Cette action efface toutes les données en mémoire locale.
            </p>
            <button
              onClick={handleResetStorage}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white font-medium text-sm rounded-xl border border-red-500/40 transition-colors"
            >
              <Trash2 size={16} />
              Réinitialiser le stockage local
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
