import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { useCampagneStore } from '../stores/campagneStore';
import { useProspectStore } from '../stores/prospectStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const loadCampagnes = useCampagneStore(state => state.loadCampagnes);
  const activeCampagneId = useCampagneStore(state => state.activeCampagneId);
  const loadProspects = useProspectStore(state => state.loadProspects);

  useEffect(() => {
    if (!isSupabaseEnabled()) {
      // Mode local : pas d'auth, on passe directement
      setUser({ id: 'local', email: 'local@mode.local' });
      setLoading(false);
      return;
    }

    // Mode Supabase : écouter la session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Charger les données depuis Supabase dès que l'utilisateur est connecté
  useEffect(() => {
    if (user && isSupabaseEnabled()) {
      loadCampagnes().then(() => {
        if (activeCampagneId) loadProspects(activeCampagneId);
      });
    }
  }, [user]);

  const signInWithEmail = async (email) => {
    if (!isSupabaseEnabled()) return { error: null };
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error };
  };

  const signOut = async () => {
    if (!isSupabaseEnabled()) return;
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
