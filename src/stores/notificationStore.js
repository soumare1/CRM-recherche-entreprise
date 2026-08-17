import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      readIds: [],
      dismissedIds: [],

      markAsRead: (id) => set((state) => ({
        readIds: state.readIds.includes(id) ? state.readIds : [...state.readIds, id]
      })),

      markAllAsRead: (notificationIds) => set((state) => ({
        readIds: Array.from(new Set([...state.readIds, ...notificationIds]))
      })),

      dismissNotification: (id) => set((state) => ({
        dismissedIds: state.dismissedIds.includes(id) ? state.dismissedIds : [...state.dismissedIds, id]
      })),

      clearAllDismissed: () => set({ readIds: [], dismissedIds: [] }),
    }),
    {
      name: 'crm-notifications-storage-v1',
    }
  )
);
