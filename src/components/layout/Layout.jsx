import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useUIStore } from '../../stores/uiStore';
import ProspectDetail from '../prospects/ProspectDetail';
import CommandPalette from './CommandPalette';
import AppelFormModal from '../appels/AppelFormModal';
import GlobalConfirmModal from '../common/GlobalConfirmModal';
import ProspectFormModal from '../prospects/ProspectFormModal';
import RdvFormModal from '../rdv/RdvFormModal';

export default function Layout() {
  const isSidebarOpen = useUIStore(state => state.isSidebarOpen);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#ededed] flex overflow-hidden selection:bg-violet-500/30">
      <Sidebar />
      
      <div 
        className={`
          flex-1 flex flex-col min-w-0
          transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isSidebarOpen ? 'lg:ml-64 ml-0' : 'lg:ml-20 ml-0'}
        `}
      >
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-[#0a0a0a] to-[#121212]">
          <div className="mx-auto max-w-7xl p-6 h-full">
            <Outlet />
          </div>
        </main>
      </div>
      
      <ProspectDetail />
      <CommandPalette />
      <AppelFormModal />
      <ProspectFormModal />
      <RdvFormModal />
      <GlobalConfirmModal />
    </div>
  );
}
