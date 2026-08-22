import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

/**
 * Composant CustomSelect - Remplace les balises <select> natives par une UI moderne,
 * stylisée en Dark Mode Glassmorphism avec animations, recherche et support d'icônes.
 */
export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Sélectionnez...',
  icon: Icon,
  searchable = false,
  className = '',
  dropdownClassName = '',
  disabled = false,
  size = 'md',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  // Normaliser le format des options (gère tableau d'objets {value, label} ou tableau de strings)
  const normalizedOptions = useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'object' && opt !== null) {
        return {
          value: opt.value !== undefined ? opt.value : opt.id,
          label: opt.label || opt.name || String(opt.value || opt.id),
          icon: opt.icon,
          color: opt.color,
          badge: opt.badge,
        };
      }
      return { value: opt, label: String(opt) };
    });
  }, [options]);

  // Trouver l'option actuellement sélectionnée
  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  // Filtrer si recherche activée
  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return normalizedOptions;
    const q = search.toLowerCase();
    return normalizedOptions.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [normalizedOptions, search, searchable]);

  // Fermer au clic extérieur
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
    setSearch('');
  };

  // Tailles
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs rounded-lg',
    md: 'px-3.5 py-2 text-xs font-semibold rounded-xl',
    lg: 'px-4 py-2.5 text-sm rounded-xl',
  };

  return (
    <div className={`relative inline-block text-left w-full ${className}`} ref={containerRef}>
      {/* Bouton Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 bg-[#181818] border border-[#333] text-white hover:border-violet-500/50 hover:bg-[#1f1f1f] transition-all cursor-pointer shadow-sm ${
          sizeClasses[size] || sizeClasses.md
        } ${isOpen ? 'ring-2 ring-violet-500/30 border-violet-500' : ''} ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {Icon && <Icon size={size === 'sm' ? 14 : 16} className="text-violet-400 shrink-0" />}
          {selectedOption?.icon && <selectedOption.icon size={15} className="shrink-0 text-violet-400" />}

          {selectedOption?.color ? (
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border truncate ${selectedOption.color}`}>
              {selectedOption.label}
            </span>
          ) : (
            <span className="truncate text-white">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          )}
        </div>

        <ChevronDown
          size={14}
          className={`text-neutral-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-violet-400' : ''
          }`}
        />
      </button>

      {/* Menu Deroulant Custom */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 w-full min-w-[200px] bg-[#121212] border border-[#262626] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 p-1.5 ${dropdownClassName}`}
        >
          {/* Champ de recherche si liste longue ou searchable=true */}
          {(searchable || normalizedOptions.length > 7) && (
            <div className="p-1.5 border-b border-[#262626] mb-1 relative">
              <Search size={13} className="absolute left-3 top-3 text-neutral-500" />
              <input
                type="text"
                placeholder="Filtrer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                className="w-full pl-8 pr-7 py-1.5 bg-[#181818] border border-[#333] rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-3 text-neutral-500 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}

          {/* Liste des options */}
          <div className="max-h-60 overflow-y-auto space-y-0.5 p-0.5 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);

                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-all text-left cursor-pointer ${
                      isSelected
                        ? 'bg-violet-600/20 text-violet-300 font-semibold border border-violet-500/30'
                        : 'text-neutral-300 hover:bg-neutral-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      {opt.icon && <opt.icon size={14} className="text-violet-400 shrink-0" />}

                      {opt.color ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border truncate ${opt.color}`}>
                          {opt.label}
                        </span>
                      ) : (
                        <span className="truncate">{opt.label}</span>
                      )}
                    </div>

                    {isSelected && <Check size={14} className="text-violet-400 shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="py-4 text-center text-xs text-neutral-500">Aucun résultat</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
