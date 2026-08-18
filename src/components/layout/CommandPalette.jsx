import { useState, useEffect, useRef } from 'react';
import { Search, Users, Navigation } from 'lucide-react';
import { useProspectStore } from '../../stores/prospectStore';
import { useUIStore } from '../../stores/uiStore';
import { useNavigate } from 'react-router-dom';

export default function CommandPalette() {
  const isOpen = useUIStore(state => state.isCommandPaletteOpen);
  const setIsOpen = useUIStore(state => state.setCommandPaletteOpen);
  const [query, setQuery] = useState('');
  const prospects = useProspectStore(state => state.prospects);
  const setSelectedProspect = useUIStore(state => state.setSelectedProspect);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
        setQuery('');
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 10);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredProspects = query === '' 
    ? [] 
    : prospects.filter(p => 
        p.nom.toLowerCase().includes(query.toLowerCase()) || 
        (p.telephone && p.telephone.includes(query)) ||
        (p.secteur && p.secteur.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5);

  const handleSelectProspect = (id) => {
    setSelectedProspect(id);
    setIsOpen(false);
  };

  const actions = [
    { label: 'Aller au Pipeline', icon: Navigation, onSelect: () => { navigate('/pipeline'); setIsOpen(false); } },
    { label: 'Importer des prospects', icon: Navigation, onSelect: () => { navigate('/import'); setIsOpen(false); } },
  ].filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      
      <div className="relative w-full max-w-xl bg-[#121212] rounded-2xl shadow-2xl border border-[#262626] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center px-4 py-3 border-b border-[#262626]">
          <Search size={20} className="text-neutral-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-neutral-500 font-medium"
            placeholder="Rechercher un prospect ou une action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-block px-2 py-1 rounded bg-[#181818] text-[10px] font-mono text-neutral-500 border border-[#262626]">ESC</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto scrollbar-hide py-2">
          {query === '' && (
            <div className="px-4 py-8 text-center text-sm text-neutral-500">
              Tapez pour rechercher parmi vos prospects et actions...
            </div>
          )}

          {query !== '' && filteredProspects.length === 0 && actions.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-neutral-500">
              Aucun résultat pour "{query}"
            </div>
          )}

          {filteredProspects.length > 0 && (
            <div className="mb-4">
              <h3 className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 mt-2">Prospects</h3>
              <ul className="space-y-1">
                {filteredProspects.map(p => (
                  <li key={p.id}>
                    <button
                      onClick={() => handleSelectProspect(p.id)}
                      className="w-full flex items-center px-4 py-2 hover:bg-violet-500/10 text-left transition-colors group"
                    >
                      <Users size={16} className="text-neutral-500 group-hover:text-violet-400 mr-3" />
                      <div className="flex-1">
                        <span className="text-neutral-200 font-medium">{p.nom}</span>
                        <span className="text-neutral-500 text-xs ml-2">{p.secteur}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {actions.length > 0 && (
            <div>
              <h3 className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2 mt-2">Actions</h3>
              <ul className="space-y-1">
                {actions.map((action, i) => (
                  <li key={i}>
                    <button
                      onClick={action.onSelect}
                      className="w-full flex items-center px-4 py-2 hover:bg-neutral-800 text-left transition-colors group"
                    >
                      <action.icon size={16} className="text-neutral-500 group-hover:text-white mr-3" />
                      <span className="text-neutral-200">{action.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
