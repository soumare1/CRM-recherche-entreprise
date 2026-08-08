import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { MOCK_CAMPAGNES } from '../lib/mockData';

/**
 * Service Campagnes — abstraction Local / Supabase.
 */
export const campagnesService = {

  /** Récupère toutes les campagnes de l'utilisateur. */
  async fetchAll() {
    if (!isSupabaseEnabled()) {
      return { data: MOCK_CAMPAGNES, error: null };
    }
    const { data, error } = await supabase
      .from('campagnes')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  /** Crée une nouvelle campagne. */
  async create(campagneData) {
    if (!isSupabaseEnabled()) {
      return {
        data: {
          ...campagneData,
          id: `campagne-${Date.now()}`,
          created_at: new Date().toISOString(),
        },
        error: null
      };
    }
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('campagnes')
      .insert({ ...campagneData, user_id: user.id })
      .select()
      .single();
    return { data, error };
  },

  /** Met à jour une campagne. */
  async update(id, updates) {
    if (!isSupabaseEnabled()) {
      return { data: { id, ...updates }, error: null };
    }
    const { data, error } = await supabase
      .from('campagnes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  /** Supprime une campagne. */
  async delete(id) {
    if (!isSupabaseEnabled()) {
      return { error: null };
    }
    const { error } = await supabase
      .from('campagnes')
      .delete()
      .eq('id', id);
    return { error };
  },
};
