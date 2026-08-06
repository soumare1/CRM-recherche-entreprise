import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { MOCK_PROSPECTS } from '../lib/mockData';

/**
 * Service Prospects — abstraction Local / Supabase.
 * Toutes les fonctions retournent { data, error }.
 */
export const prospectsService = {

  /** Récupère tous les prospects d'une campagne. */
  async fetchByCampagne(campagneId) {
    if (!isSupabaseEnabled()) {
      return { data: MOCK_PROSPECTS.filter(p => p.campagne_id === campagneId), error: null };
    }
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .eq('campagne_id', campagneId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  /** Crée un nouveau prospect. */
  async create(prospectData) {
    if (!isSupabaseEnabled()) {
      // Mode local : retourne le prospect avec un id généré
      return {
        data: {
          ...prospectData,
          id: `prospect-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        error: null
      };
    }
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('prospects')
      .insert({ ...prospectData, user_id: user.id })
      .select()
      .single();
    return { data, error };
  },

  /** Met à jour un prospect. */
  async update(id, updates) {
    if (!isSupabaseEnabled()) {
      return { data: { id, ...updates, updated_at: new Date().toISOString() }, error: null };
    }
    const { data, error } = await supabase
      .from('prospects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  /** Met à jour le stage pipeline d'un prospect. */
  async updateStage(id, newStage) {
    return this.update(id, { pipeline_stage: newStage });
  },

  /** Supprime un prospect. */
  async delete(id) {
    if (!isSupabaseEnabled()) {
      return { error: null };
    }
    const { error } = await supabase.from('prospects').delete().eq('id', id);
    return { error };
  },

  /** Enregistre un appel et met à jour le prospect. */
  async logAppel(prospectId, appelData) {
    if (!isSupabaseEnabled()) {
      // Mode local : on simule juste la mise à jour du prospect
      const stageMap = {
        injoignable: 'pas_decroche',
        rappeler: 'a_rappeler',
        rdv_pris: 'rdv_pris',
        pas_interesse: 'pas_interesse',
        interesse: 'a_rappeler',
      };
      const newStage = appelData.a_decroche
        ? (stageMap[appelData.resultat] || null)
        : 'pas_decroche';

      const updates = {
        dernier_contact: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(appelData.notes && { notes: appelData.notes }),
        ...(appelData.prochain_rappel && { prochain_rappel: appelData.prochain_rappel }),
        ...(newStage && { pipeline_stage: newStage }),
      };
      return { data: updates, error: null };
    }

    // Mode Supabase : insert dans la table appels
    const { data: { user } } = await supabase.auth.getUser();

    const { error: appelError } = await supabase.from('appels').insert({
      prospect_id: prospectId,
      date_appel: new Date().toISOString(),
      a_decroche: appelData.a_decroche,
      resultat: appelData.a_decroche ? appelData.resultat : 'injoignable',
      notes: appelData.notes || null,
      user_id: user.id,
    });

    if (appelError) return { data: null, error: appelError };

    // Le trigger Supabase met à jour dernier_contact automatiquement.
    // On met aussi à jour le stage et le prochain rappel manuellement.
    const stageMap = {
      injoignable: 'pas_decroche',
      rappeler: 'a_rappeler',
      rdv_pris: 'rdv_pris',
      pas_interesse: 'pas_interesse',
      interesse: 'a_rappeler',
    };
    const newStage = appelData.a_decroche
      ? (stageMap[appelData.resultat] || null)
      : 'pas_decroche';

    const updates = {
      ...(newStage && { pipeline_stage: newStage }),
      ...(appelData.prochain_rappel && { prochain_rappel: appelData.prochain_rappel }),
    };

    if (Object.keys(updates).length > 0) {
      await supabase.from('prospects').update(updates).eq('id', prospectId);
    }

    return { data: updates, error: null };
  },
};
