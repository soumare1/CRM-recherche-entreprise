import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  KanbanSquare, 
  Search, 
  Upload, 
  Settings,
  Calendar,
  PhoneCall
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: KanbanSquare, label: 'Pipeline', to: '/pipeline' },
  { icon: Users, label: 'Prospects', to: '/prospects' },
  { icon: PhoneCall, label: 'Relances', to: '/relances' },
  { icon: Calendar, label: 'Agenda', to: '/agenda' },
];

const toolsItems = [
  { icon: Search, label: 'Recherche', to: '/recherche' },
  { icon: Upload, label: 'Import Excel', to: '/import' },
];

export default function Sidebar() {
  const isSidebarOpen = useUIStore(state => state.isSidebarOpen);

  return (
    <aside 
      className={`
        fixed inset-y-0 left-0 z-50 flex flex-col 
        bg-black/40 backdrop-blur-xl border-r border-[#262626]
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-20 -translate-x-full lg:translate-x-0'}
      `}
    >
      <div className="flex h-16 items-center px-6 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {isSidebarOpen && <span className="font-semibold text-white tracking-tight">AppForge CRM</span>}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-8 scrollbar-hide">
        
        <div>
          {isSidebarOpen && <h3 className="px-3 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Général</h3>}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavItem key={item.to} item={item} isOpen={isSidebarOpen} />
            ))}
          </nav>
        </div>

        <div>
          {isSidebarOpen && <h3 className="px-3 mb-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">Outils</h3>}
          <nav className="space-y-1">
            {toolsItems.map((item) => (
              <NavItem key={item.to} item={item} isOpen={isSidebarOpen} />
            ))}
          </nav>
        </div>

      </div>
    </aside>
  );
}

function NavItem({ item, isOpen }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) => `
        flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-violet-500/10 text-violet-400 font-medium' 
          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
        }
      `}
      title={!isOpen ? item.label : undefined}
    >
      <Icon size={18} className="shrink-0" strokeWidth={2.5} />
      {isOpen && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}
