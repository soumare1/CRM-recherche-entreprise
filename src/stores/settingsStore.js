import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Profil utilisateur
      profile: {
        name: 'Kandioura',
        role: 'Fondateur & Lead Developer',
        company: 'AppForge Studio',
        email: 'contact@appforge.dev',
        phone: '+33 6 12 34 56 78',
        avatarSeed: 'Felix',
        customAvatarUrl: '',
        bio: 'Studio de développement d\'applications web & mobile sur mesure pour TPE/PME.',
      },

      // Préférences d'application
      preferences: {
        themeMode: 'dark', // 'dark' | 'light'
        accentColor: 'violet', // 'violet' | 'indigo' | 'blue' | 'emerald' | 'amber' | 'rose'
        defaultCity: 'Paris',
        notificationsEnabled: true,
        emailReminders: true,
        dailySummary: true,
        autoOsmFallback: true,
        defaultTargetSector: 'all',
        currency: 'EUR',
      },

      // Méthodes d'édition du profil
      updateProfile: (updatedFields) =>
        set((state) => ({
          profile: { ...state.profile, ...updatedFields },
        })),

      // Méthodes d'édition des préférences
      updatePreferences: (updatedFields) =>
        set((state) => ({
          preferences: { ...state.preferences, ...updatedFields },
        })),

      // Réinitialisation du profil aux valeurs par défaut
      resetProfile: () =>
        set({
          profile: {
            name: 'Kandioura',
            role: 'Fondateur & Lead Developer',
            company: 'AppForge Studio',
            email: 'contact@appforge.dev',
            phone: '+33 6 12 34 56 78',
            avatarSeed: 'Felix',
            customAvatarUrl: '',
            bio: 'Studio de développement d\'applications web & mobile sur mesure pour TPE/PME.',
          },
        }),
    }),
    {
      name: 'appforge-settings-store',
    }
  )
);
