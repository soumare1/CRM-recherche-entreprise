import { useMemo } from 'react';
import { useProspectStore } from '../stores/prospectStore';
import { useCampagneStore } from '../stores/campagneStore';
import { PIPELINE_STAGES } from '../lib/constants';

/**
 * Hook qui calcule toutes les métriques de prospection
 * pour la campagne active, à partir du store local.
 */
export function useStatsProspects() {
  const prospects = useProspectStore(state => state.prospects);
  const activeCampagneId = useCampagneStore(state => state.activeCampagneId);

  return useMemo(() => {
    const p = prospects.filter(x => x.campagne_id === activeCampagneId);

    const total = p.length;

    // Appels passés = prospects ayant un dernier_contact
    const appelsPasses = p.filter(x => x.dernier_contact).length;

    // Décroché au moins une fois = pas dans "a_contacter" et pas "pas_decroche" uniquement
    const contactsEtablis = p.filter(x =>
      !['a_contacter', 'pas_decroche'].includes(x.pipeline_stage)
    ).length;

    // RDV pris (courants + signés + devis envoyés + négoce)
    const rdvPris = p.filter(x =>
      ['rdv_pris', 'devis_envoye', 'negoce', 'signe'].includes(x.pipeline_stage)
    ).length;

    // Signés
    const signes = p.filter(x => x.pipeline_stage === 'signe').length;

    // Perdus
    const perdus = p.filter(x => x.pipeline_stage === 'pas_interesse').length;

    // Taux de conversion (signés / prospects contactés)
    const tauxConversion = contactsEtablis > 0
      ? Math.round((signes / contactsEtablis) * 100)
      : 0;

    // Taux de décrochage (quelqu'un a répondu / appels passés)
    const tauxDecrochage = appelsPasses > 0
      ? Math.round((contactsEtablis / appelsPasses) * 100)
      : 0;

    // Répartition par stage pour le funnel
    const parStage = PIPELINE_STAGES.map(stage => ({
      id: stage.id,
      label: stage.label,
      color: stage.color,
      count: p.filter(x => x.pipeline_stage === stage.id).length,
    }));

    // Relances du jour
    const now = new Date();
    const aRelancer = p.filter(x => {
      if (x.prochain_rappel) return new Date(x.prochain_rappel) <= now;
      if (['pas_decroche', 'a_rappeler'].includes(x.pipeline_stage)) {
        if (!x.dernier_contact) return true;
        const diffDays = (now - new Date(x.dernier_contact)) / (1000 * 60 * 60 * 24);
        return diffDays >= 2;
      }
      return false;
    });

    // Activité fictive sur 7 jours (basée sur dernier_contact)
    const derniers7j = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const label = d.toLocaleDateString('fr-FR', { weekday: 'short' });
      const dateStr = d.toISOString().slice(0, 10);
      const appels = p.filter(x => x.dernier_contact?.slice(0, 10) === dateStr).length;
      const rdvJour = p.filter(x =>
        x.pipeline_stage === 'rdv_pris' && x.updated_at?.slice(0, 10) === dateStr
      ).length;
      return { name: label, appels, rdvs: rdvJour };
    });

    return {
      total,
      appelsPasses,
      contactsEtablis,
      rdvPris,
      signes,
      perdus,
      tauxConversion,
      tauxDecrochage,
      parStage,
      aRelancer,
      derniers7j,
    };
  }, [prospects, activeCampagneId]);
}
