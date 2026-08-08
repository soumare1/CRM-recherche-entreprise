import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_CAMPAGNES } from '../lib/mockData';
import { campagnesService } from '../services/campagnesService';
import { isSupabaseEnabled } from '../lib/supabase';
import { useProspectStore } from './prospectStore';

export const useCampagneStore = create(
  persist(
    (set, get) => ({
      campagnes: MOCK_CAMPAGNES,
      activeCampagneId: MOCK_CAMPAGNES[0]?.id || null,
      isLoading: false,

      /** Charge les campagnes depuis Supabase (si activé). */
      loadCampagnes: async () => {
        if (!isSupabaseEnabled()) return;
        set({ isLoading: true });
        const { data, error } = await campagnesService.fetchAll();
        if (!error && data) {
          const currentActive = get().activeCampagneId;
          const validActive = data.some(c => c.id === currentActive) ? currentActive : (data[0]?.id || null);
          set({
            campagnes: data,
            activeCampagneId: validActive,
            isLoading: false,
          });
          if (validActive) {
            useProspectStore.getState().loadProspects(validActive);
          }
        } else {
          set({ isLoading: false });
        }
      },

      setActiveCampagne: (id) => {
        set({ activeCampagneId: id });
        if (isSupabaseEnabled() && id) {
          useProspectStore.getState().loadProspects(id);
        }
      },

      addCampagne: async (dataOrNom, description = '') => {
        const payload = typeof dataOrNom === 'string'
          ? { nom: dataOrNom, description }
          : dataOrNom;

        const { data, error } = await campagnesService.create(payload);
        if (error || !data) return;
        set((state) => ({
          campagnes: [data, ...state.campagnes],
          activeCampagneId: data.id, // Active automatiquement la nouvelle campagne
        }));
        if (isSupabaseEnabled() && data.id) {
          useProspectStore.getState().loadProspects(data.id);
        }
      },

      updateCampagne: async (id, updates) => {
        set((state) => ({
          campagnes: state.campagnes.map(c => c.id === id ? { ...c, ...updates } : c),
        }));
        await campagnesService.update(id, updates);
      },

      removeCampagne: async (id) => {
        const currentCampagnes = get().campagnes;
        const newCampagnes = currentCampagnes.filter(c => c.id !== id);
        let newActiveId = get().activeCampagneId;

        if (newActiveId === id) {
          newActiveId = newCampagnes[0]?.id || null;
        }

        set({
          campagnes: newCampagnes,
          activeCampagneId: newActiveId,
        });

        // Nettoie les prospects de cette campagne
        useProspectStore.setState((state) => ({
          prospects: state.prospects.filter(p => p.campagne_id !== id),
        }));

        if (isSupabaseEnabled() && newActiveId) {
          useProspectStore.getState().loadProspects(newActiveId);
        }

        await campagnesService.delete(id);
      },
    }),
    {
      name: 'crm-campagnes-storage-v3',
      partialize: (state) => ({
        campagnes: isSupabaseEnabled() ? [] : state.campagnes,
        activeCampagneId: state.activeCampagneId,
      }),
    }
  )
);
