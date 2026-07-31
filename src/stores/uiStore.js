import { create } from 'zustand';

export const useUIStore = create((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  
  // Pour le slide-over prospect
  selectedProspectId: null,
  setSelectedProspect: (id) => set({ selectedProspectId: id }),
  closeProspectDetail: () => set({ selectedProspectId: null }),

  callingProspectId: null,
  setCallingProspectId: (id) => set({ callingProspectId: id }),

  isCommandPaletteOpen: false,
  setCommandPaletteOpen: (isOpen) => set({ isCommandPaletteOpen: isOpen }),

  // Modal d'ajout de prospect
  isAddProspectModalOpen: false,
  defaultStageForNewProspect: 'a_contacter',
  openAddProspectModal: (stage = 'a_contacter') => set({ isAddProspectModalOpen: true, defaultStageForNewProspect: stage }),
  closeAddProspectModal: () => set({ isAddProspectModalOpen: false }),

  // Modal de planification de RDV unifiée
  isRdvModalOpen: false,
  rdvModalPreselectedProspectId: null,
  openRdvModal: (prospectId = null) => set({ isRdvModalOpen: true, rdvModalPreselectedProspectId: prospectId }),
  closeRdvModal: () => set({ isRdvModalOpen: false, rdvModalPreselectedProspectId: null }),

  // Modal de confirmation globale
  confirmModal: null,
  openConfirmModal: (config) => set({ confirmModal: config }),
  closeConfirmModal: () => set({ confirmModal: null }),
}));
