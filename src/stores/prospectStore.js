import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_PROSPECTS } from '../lib/mockData';
import { prospectsService } from '../services/prospectsService';
import { isSupabaseEnabled } from '../lib/supabase';

export const useProspectStore = create(
  persist(
    (set, get) => ({
      prospects: MOCK_PROSPECTS,
      isLoading: false,
      error: null,

      /** Charge les prospects depuis Supabase (si activé) pour une campagne. */
      loadProspects: async (campagneId) => {
        if (!isSupabaseEnabled()) return; // Mode local : données déjà dans le store
        set({ isLoading: true });
        const { data, error } = await prospectsService.fetchByCampagne(campagneId);
        if (error) {
          set({ error: error.message, isLoading: false });
        } else {
          // Merge avec les prospects existants (autres campagnes)
          set((state) => ({
            prospects: [
              ...state.prospects.filter(p => p.campagne_id !== campagneId),
              ...data,
            ],
            isLoading: false,
          }));
        }
      },

      /** Ajoute un prospect (local ou Supabase). */
      addProspect: async (prospectData) => {
        const { data, error } = await prospectsService.create(prospectData);
        if (error) { set({ error: error.message }); return; }
        set((state) => ({ prospects: [data, ...state.prospects] }));
      },

      /** Met à jour un prospect. */
      updateProspect: async (id, updates) => {
        // Optimistic update
        set((state) => ({
          prospects: state.prospects.map(p =>
            p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
          ),
        }));
        const { error } = await prospectsService.update(id, updates);
        if (error) {
          // Rollback n'est pas implémenté ici (acceptable pour un MVP)
          set({ error: error.message });
        }
      },

      /** Supprime un prospect. */
      deleteProspect: async (id) => {
        set((state) => ({ prospects: state.prospects.filter(p => p.id !== id) }));
        const { error } = await prospectsService.delete(id);
        if (error) set({ error: error.message });
      },

      /** Déplace un prospect dans le pipeline (optimistic). */
      updateProspectStage: async (id, newStage) => {
        set((state) => ({
          prospects: state.prospects.map(p =>
            p.id === id ? { ...p, pipeline_stage: newStage, updated_at: new Date().toISOString() } : p
          ),
        }));
        const { error } = await prospectsService.updateStage(id, newStage);
        if (error) set({ error: error.message });
      },

      /** Enregistre un appel et met à jour le stage automatiquement. */
      logAppel: async (prospectId, appelData) => {
        const { data, error } = await prospectsService.logAppel(prospectId, appelData);
        if (error) { set({ error: error.message }); return; }
        // Applique les mises à jour retournées par le service
        set((state) => ({
          prospects: state.prospects.map(p =>
            p.id === prospectId ? { ...p, ...data } : p
          ),
        }));
      },
    }),
    {
      name: 'crm-prospects-storage-v3',
      // En mode Supabase, on ne persiste pas (Supabase fait office de source de vérité)
      partialize: (state) => isSupabaseEnabled() ? {} : { prospects: state.prospects },
    }
  )
);
