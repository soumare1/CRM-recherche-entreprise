import { useState, useMemo } from 'react';
import { Bell, Calendar, Phone, Check, CheckCheck, Sparkles, Clock, AlertTriangle, ArrowRight, UserCheck, X } from 'lucide-react';
import { useProspectStore } from '../../stores/prospectStore';
import { useCampagneStore } from '../../stores/campagneStore';
import { useUIStore } from '../../stores/uiStore';
import { useNotificationStore } from '../../stores/notificationStore';

export default function NotificationDropdown({ isOpen, onClose }) {
  const prospects = useProspectStore((s) => s.prospects);
  const activeCampagneId = useCampagneStore((s) => s.activeCampagneId);
  const setCallingProspectId = useUIStore((s) => s.setCallingProspectId);
  const setSelectedProspect = useUIStore((s) => s.setSelectedProspect);

  const { readIds, markAsRead, markAllAsRead, dismissNotification } = useNotificationStore();
  const [filterTab, setFilterTab] = useState('tous'); // 'tous' | 'retard' | 'aujourdhui'

  // Calcul dynamique des notifications depuis la liste de prospects
  const notifications = useMemo(() => {
    const list = [];
    const todayStr = new Date().toISOString().split('T')[0];
    const todayObj = new Date(todayStr);

    const activeProspects = prospects.filter(
      (p) => (!activeCampagneId || p.campagne_id === activeCampagneId) && p.pipeline_stage !== 'signe' && p.pipeline_stage !== 'pas_interesse'
    );

    activeProspects.forEach((p) => {
      // 1. Rappel programmé
      if (p.prochain_rappel) {
        const rappelStr = p.prochain_rappel.split('T')[0];
        const rappelObj = new Date(rappelStr);
        const diffDays = Math.round((rappelObj - todayObj) / (1000 * 60 * 60 * 24));

        let type = 'a_venir';
        let label = `Rappel prévu dans ${diffDays}j`;
        let priority = 3;

        if (diffDays < 0) {
          type = 'retard';
          label = `Rappel en retard (${Math.abs(diffDays)}j)`;
          priority = 1;
        } else if (diffDays === 0) {
          type = 'aujourdhui';
          label = `Rappel prévu aujourd'hui !`;
          priority = 2;
        }

        list.push({
          id: `rappel-${p.id}`,
          prospectId: p.id,
          prospectNom: p.nom,
          secteur: p.secteur,
          telephone: p.telephone,
          type,
          label,
          date: p.prochain_rappel,
          priority,
          message: p.notes ? `Note : "${p.notes}"` : `Prévoir un appel de relance.`,
        });
      }

      // 2. Relance nécessaire (injoignable / pas de contact depuis +7 jours)
      else if (p.pipeline_stage === 'pas_decroche' || p.pipeline_stage === 'a_rappeler') {
        const lastContact = p.dernier_contact ? new Date(p.dernier_contact) : new Date(p.created_at || Date.now());
        const daysSinceContact = Math.round((todayObj - lastContact) / (1000 * 60 * 60 * 24));

        if (daysSinceContact >= 3) {
          list.push({
            id: `relance-${p.id}`,
            prospectId: p.id,
            prospectNom: p.nom,
            secteur: p.secteur,
            telephone: p.telephone,
            type: daysSinceContact > 7 ? 'retard' : 'aujourdhui',
            label: `Relance conseillée (${daysSinceContact}j sans contact)`,
            date: p.dernier_contact || p.created_at,
            priority: daysSinceContact > 7 ? 1 : 2,
            message: `Le prospect attend une nouvelle tentative de contact.`,
          });
        }
      }
    });

    // Trier par priorité (1=retard, 2=aujourdhui, 3=a_venir) puis date
    return list.sort((a, b) => a.priority - b.priority);
  }, [prospects, activeCampagneId]);

  if (!isOpen) return null;

  const filteredNotifs = notifications.filter((n) => {
    if (filterTab === 'retard') return n.type === 'retard';
    if (filterTab === 'aujourdhui') return n.type === 'aujourdhui';
    return true;
  });

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const handleCall = (prospectId, notifId) => {
    markAsRead(notifId);
    setCallingProspectId(prospectId);
    onClose();
  };

  const handleOpenDetail = (prospectId, notifId) => {
    markAsRead(notifId);
    setSelectedProspect(prospectId);
    onClose();
  };

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#121212] border border-[#262626] rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
      {/* Header Dropdown */}
      <div className="p-4 border-b border-[#262626] bg-neutral-900/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Rappels & Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-violet-600 text-white">
                  {unreadCount}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-neutral-400">Suivi des appels et relances prospects</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead(notifications.map((n) => n.id))}
            className="text-[11px] text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 hover:underline cursor-pointer"
            title="Tout marquer comme lu"
          >
            <CheckCheck size={14} />
            <span className="hidden sm:inline">Tout lire</span>
          </button>
        )}
      </div>

      {/* Navigation Onglets */}
      <div className="flex border-b border-[#262626] bg-[#181818] p-1 gap-1">
        <button
          onClick={() => setFilterTab('tous')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterTab === 'tous'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
        >
          Tous ({notifications.length})
        </button>
        <button
          onClick={() => setFilterTab('retard')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
            filterTab === 'retard'
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'text-neutral-400 hover:text-red-400'
          }`}
        >
          <AlertTriangle size={12} />
          En retard ({notifications.filter((n) => n.type === 'retard').length})
        </button>
        <button
          onClick={() => setFilterTab('aujourdhui')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
            filterTab === 'aujourdhui'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'text-neutral-400 hover:text-amber-400'
          }`}
        >
          <Clock size={12} />
          Aujourd'hui ({notifications.filter((n) => n.type === 'aujourdhui').length})
        </button>
      </div>

      {/* Liste des rappels */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#262626] p-2 space-y-1">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((notif) => {
            const isRead = readIds.includes(notif.id);

            return (
              <div
                key={notif.id}
                className={`p-3 rounded-xl border transition-all ${
                  isRead
                    ? 'bg-neutral-900/30 border-[#222] opacity-75'
                    : notif.type === 'retard'
                    ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40'
                    : notif.type === 'aujourdhui'
                    ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                    : 'bg-neutral-900/70 border-[#2a2a2a] hover:border-violet-500/30'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        notif.type === 'retard'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : notif.type === 'aujourdhui'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {notif.label}
                    </span>
                    {!isRead && <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />}
                  </div>

                  <button
                    onClick={() => (isRead ? dismissNotification(notif.id) : markAsRead(notif.id))}
                    className="text-neutral-500 hover:text-white p-1 rounded-md transition-colors"
                    title={isRead ? 'Masquer' : 'Marquer comme lu'}
                  >
                    <X size={12} />
                  </button>
                </div>

                <h4 className="text-xs font-bold text-white mb-0.5 flex items-center justify-between">
                  <span>{notif.prospectNom}</span>
                  <span className="text-[10px] font-normal text-neutral-400">{notif.secteur}</span>
                </h4>

                <p className="text-[11px] text-neutral-400 mb-2 line-clamp-2 leading-relaxed">
                  {notif.message}
                </p>

                {/* Boutons d'action sur la notification */}
                <div className="flex items-center justify-between pt-2 border-t border-[#262626]/50">
                  <button
                    onClick={() => handleOpenDetail(notif.prospectId, notif.id)}
                    className="text-[11px] font-medium text-neutral-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ArrowRight size={12} /> Fiche prospect
                  </button>

                  <button
                    onClick={() => handleCall(notif.prospectId, notif.id)}
                    className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Phone size={12} /> Appeler
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center px-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2">
              <CheckCheck size={20} />
            </div>
            <p className="text-xs font-semibold text-neutral-200">Aucun rappel en attente !</p>
            <p className="text-[11px] text-neutral-500 mt-1">
              Tous vos prospects sont à jour ou vos rappels ont été traités.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-[#262626] bg-neutral-900/60 text-center">
        <span className="text-[10px] text-neutral-500 flex items-center justify-center gap-1">
          <Sparkles size={11} className="text-violet-400" />
          Rappels générés automatiquement selon vos appels
        </span>
      </div>
    </div>
  );
}
