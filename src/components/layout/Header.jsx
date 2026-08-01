import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, User, Settings, LogOut, ChevronDown, Layers } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useCampagneStore } from '../../stores/campagneStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useAuth } from '../../context/AuthContext';
import { useProspectStore } from '../../stores/prospectStore';
import { useNotificationStore } from '../../stores/notificationStore';
import NotificationDropdown from './NotificationDropdown';
import CustomSelect from '../common/CustomSelect';

export default function Header() {
  const navigate = useNavigate();
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setCommandPaletteOpen = useUIStore((state) => state.setCommandPaletteOpen);
  const { campagnes, activeCampagneId, setActiveCampagne } = useCampagneStore();
  const { profile } = useSettingsStore();
  const { signOut } = useAuth();
  const prospects = useProspectStore((state) => state.prospects);
  const readIds = useNotificationStore((state) => state.readIds);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Calcul du nombre de rappels non lus
  const unreadNotifCount = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayObj = new Date(todayStr);

    const list = [];
    const activeProspects = prospects.filter(
      (p) => (!activeCampagneId || p.campagne_id === activeCampagneId) && p.pipeline_stage !== 'signe' && p.pipeline_stage !== 'pas_interesse'
    );

    activeProspects.forEach((p) => {
      if (p.prochain_rappel) {
        list.push(`rappel-${p.id}`);
      } else if (p.pipeline_stage === 'pas_decroche' || p.pipeline_stage === 'a_rappeler') {
        const lastContact = p.dernier_contact ? new Date(p.dernier_contact) : new Date(p.created_at || Date.now());
        const days = Math.round((todayObj - lastContact) / (1000 * 60 * 60 * 24));
        if (days >= 3) list.push(`relance-${p.id}`);
      }
    });

    return list.filter((id) => !readIds.includes(id)).length;
  }, [prospects, activeCampagneId, readIds]);

  const activeCampagne = campagnes.find((c) => c.id === activeCampagneId);

  const avatarUrl =
    profile.customAvatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.avatarSeed || 'Felix'}`;

  // Fermeture au clic extérieur
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-black/20 backdrop-blur-md border-b border-[#262626] sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Campagne Selector Dropdown */}
        <div className="w-52 sm:w-60">
          <CustomSelect
            value={activeCampagneId || (campagnes[0]?.id || '')}
            onChange={(val) => setActiveCampagne(val)}
            options={campagnes.map((c) => ({
              value: c.id,
              label: c.nom,
            }))}
            icon={Layers}
            size="sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-[#333] text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 transition-colors text-sm"
        >
          <Search size={16} />
          <span>Rechercher...</span>
          <kbd className="hidden sm:inline-block ml-4 px-1.5 py-0.5 rounded bg-neutral-800 text-[10px] font-mono text-neutral-500">
            ⌘K
          </kbd>
        </button>

        {/* Notifications & Rappels Trigger */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className={`p-2 rounded-xl transition-all relative cursor-pointer ${
              notifDropdownOpen
                ? 'bg-violet-600/20 text-violet-400 border border-violet-500/30'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
            title="Notifications & Rappels"
          >
            <Bell size={20} />
            {unreadNotifCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#121212] shadow-sm animate-pulse">
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={notifDropdownOpen}
            onClose={() => setNotifDropdownOpen(false)}
          />
        </div>

        {/* Profil Dropdown Trigger */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-xl hover:bg-neutral-800/50 border border-transparent hover:border-[#333] transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-[#333] overflow-hidden shrink-0">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight">{profile.name}</span>
              <span className="text-[10px] text-violet-400 truncate max-w-[110px]">{profile.role}</span>
            </div>
            <ChevronDown size={14} className="text-neutral-400" />
          </button>

          {/* Menu Deroulant Profil */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#121212] border border-[#262626] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-3 border-b border-[#262626] mb-1">
                <p className="text-sm font-semibold text-white truncate">{profile.name}</p>
                <p className="text-xs text-neutral-400 truncate">{profile.email}</p>
                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  {profile.company}
                </span>
              </div>

              <div className="space-y-0.5">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/60 rounded-xl transition-colors"
                >
                  <User size={15} className="text-violet-400" />
                  Mon Profil & Avatar
                </button>

                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800/60 rounded-xl transition-colors"
                >
                  <Settings size={15} className="text-neutral-400" />
                  Paramètres CRM
                </button>
              </div>

              <div className="pt-1.5 mt-1.5 border-t border-[#262626]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <LogOut size={15} />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
