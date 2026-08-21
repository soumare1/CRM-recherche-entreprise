import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store persisté pour l'état UI des pages.
 * Permet de retrouver le contexte de travail après navigation.
 * Les résultats de recherche (mock) sont volontairement exclus de la
 * persistance (trop lourds + de toute façon re-générables en 1 clic).
 */
export const usePageStateStore = create(
  persist(
    (set) => ({
      // ── Page Recherche ────────────────────────────────────────────────────
      recherche: {
        villeInput: '',
        selectedSecteurs: [],
        selectedStatutsWeb: [],
        showFilters: false,
      },
      setRechercheState: (partial) =>
        set((s) => ({ recherche: { ...s.recherche, ...partial } })),
      resetRechercheState: () =>
        set({
          recherche: {
            villeInput: '',
            selectedSecteurs: [],
            selectedStatutsWeb: [],
            showFilters: false,
          },
        }),

      // ── Page Prospects ────────────────────────────────────────────────────
      prospects: {
        search: '',
        stageFilter: 'all',
        secteurFilter: 'all',
      },
      setProspectsState: (partial) =>
        set((s) => ({ prospects: { ...s.prospects, ...partial } })),
      resetProspectsState: () =>
        set({
          prospects: {
            search: '',
            stageFilter: 'all',
            secteurFilter: 'all',
          },
        }),
    }),
    {
      name: 'appforge-page-state',
      // On ne persiste que les champs légers — pas les résultats de recherche
      partialize: (state) => ({
        recherche: state.recherche,
        prospects: state.prospects,
      }),
    }
  )
);
