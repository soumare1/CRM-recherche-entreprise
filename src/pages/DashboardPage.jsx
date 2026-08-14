import { useNavigate } from 'react-router-dom';
import {
  Users, Phone, Target, TrendingUp, Calendar, AlertCircle,
  ChevronRight, CheckCircle2, XCircle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { useCampagneStore } from '../stores/campagneStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useStatsProspects } from '../hooks/useStatsProspects';
import { PIPELINE_STAGES } from '../lib/constants';

// ── Couleurs des stages pour le funnel ──────────────────────────────────────
const STAGE_COLORS = {
  a_contacter: '#64748b',
  pas_decroche: '#f97316',
  a_rappeler: '#f59e0b',
  rdv_pris: '#3b82f6',
  devis_envoye: '#a855f7',
  negoce: '#ec4899',
  signe: '#10b981',
  pas_interesse: '#ef4444',
};

export default function DashboardPage() {
  const activeCampagneId = useCampagneStore(state => state.activeCampagneId);
  const campagnes = useCampagneStore(state => state.campagnes);
  const theme = useSettingsStore(state => state.theme);
  const isLight = theme === 'light';
  const navigate = useNavigate();

  const stats = useStatsProspects();
  const activeCampagne = campagnes.find(c => c.id === activeCampagneId);

  if (!activeCampagneId) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        Sélectionnez ou créez une campagne pour afficher le tableau de bord.
      </div>
    );
  }

  const kpis = [
    {
      name: 'Total Prospects',
      value: stats.total,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      name: 'Contacts établis',
      value: stats.contactsEtablis,
      sub: `${stats.tauxDecrochage}% de décrochage`,
      icon: Phone,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
    },
    {
      name: 'RDV qualifiés',
      value: stats.rdvPris,
      sub: `${stats.signes} signé${stats.signes > 1 ? 's' : ''}`,
      icon: Target,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      name: 'Taux de conversion',
      value: `${stats.tauxConversion}%`,
      sub: `sur ${stats.contactsEtablis} contacts`,
      icon: TrendingUp,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
  ];

  // Funnel — on exclut pas_interesse du funnel principal
  const funnelStages = stats.parStage ? stats.parStage.filter(s => s.id !== 'pas_interesse' && s.count > 0) : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white mb-1">Tableau de bord</h2>
          <p className="text-sm text-neutral-400">
            Campagne : <span className="text-white font-medium">{activeCampagne?.nom}</span>
          </p>
        </div>
        {stats.aRelancer.length > 0 && (
          <button
            onClick={() => navigate('/relances')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-sm font-medium hover:bg-amber-500/20 transition-colors"
          >
            <AlertCircle size={16} />
            {stats.aRelancer.length} relance{stats.aRelancer.length > 1 ? 's' : ''} à traiter
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className={`p-5 rounded-2xl bg-[#181818] border ${kpi.border}`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight">{kpi.value}</p>
            <p className="text-sm text-neutral-400 font-medium mt-1">{kpi.name}</p>
            {kpi.sub && <p className="text-xs text-neutral-600 mt-0.5">{kpi.sub}</p>}
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activité 7 jours */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#181818] border border-[#262626]">
          <h3 className="text-base font-semibold text-white mb-6">Activité — 7 derniers jours</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.derniers7j} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradAppels" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e2e8f0' : '#262626'} vertical={false} />
                <XAxis dataKey="name" stroke={isLight ? '#475569' : '#525252'} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={isLight ? '#475569' : '#525252'} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{
                    backgroundColor: isLight ? '#ffffff' : '#1a1a1a',
                    borderColor: isLight ? '#e2e8f0' : '#333',
                    borderRadius: '10px',
                    fontSize: '13px',
                    color: isLight ? '#0f172a' : '#ffffff',
                  }}
                  itemStyle={{ color: isLight ? '#0f172a' : '#d4d4d4' }}
                  labelStyle={{ color: isLight ? '#0f172a' : '#ffffff', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="appels" name="Contacts" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#gradAppels)" />
                <Area type="monotone" dataKey="rdvs" name="RDV" stroke="#10b981" strokeWidth={2} fill="none" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {stats.appelsPasses === 0 && (
            <p className="text-center text-xs text-neutral-600 mt-2">
              Le graphique se remplira au fur et à mesure de vos appels
            </p>
          )}
        </div>

        {/* À relancer + signés / perdus */}
        <div className="space-y-4">
          {/* Relances */}
          <div className="p-5 rounded-2xl bg-[#181818] border border-[#262626]">
            <h3 className="text-base font-semibold text-white mb-3">À relancer aujourd'hui</h3>
            {stats.aRelancer.length === 0 ? (
              <div className="flex items-center gap-3 text-emerald-400 text-sm">
                <CheckCircle2 size={18} />
                Tout est à jour !
              </div>
            ) : (
              <div className="space-y-2">
                {stats.aRelancer.slice(0, 4).map(p => (
                  <div key={p.id} className="flex items-center justify-between text-sm py-1.5 border-b border-[#262626] last:border-0">
                    <span className="text-neutral-200 truncate max-w-[140px]">{p.nom}</span>
                    <span className="text-orange-400 text-xs shrink-0">{p.telephone || '—'}</span>
                  </div>
                ))}
                {stats.aRelancer.length > 4 && (
                  <button onClick={() => navigate('/relances')} className="text-xs text-violet-400 hover:underline">
                    + {stats.aRelancer.length - 4} autres →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Signés vs Perdus */}
          <div className="p-5 rounded-2xl bg-[#181818] border border-[#262626]">
            <h3 className="text-base font-semibold text-white mb-3">Résultats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <CheckCircle2 size={16} /> Signés
                </div>
                <span className="text-2xl font-bold text-white">{stats.signes}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                  <XCircle size={16} /> Perdus
                </div>
                <span className="text-2xl font-bold text-white">{stats.perdus}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Funnel de conversion */}
      <div className="p-6 rounded-2xl bg-[#181818] border border-[#262626]">
        <h3 className="text-base font-semibold text-white mb-6">Répartition par étape du pipeline</h3>
        {funnelStages.length === 0 ? (
          <p className="text-neutral-600 text-sm text-center py-8">
            Les données apparaîtront quand vous déplacerez des prospects dans le pipeline.
          </p>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelStages} layout="vertical" margin={{ top: 0, right: 40, left: 0, bottom: 0 }}>
                <XAxis type="number" hide allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={200}
                  tick={{ fill: isLight ? '#475569' : '#a3a3a3', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.05)' }}
                  contentStyle={{
                    backgroundColor: isLight ? '#ffffff' : '#1a1a1a',
                    borderColor: isLight ? '#e2e8f0' : '#333',
                    borderRadius: '10px',
                    fontSize: '13px',
                    color: isLight ? '#0f172a' : '#ffffff',
                  }}
                  formatter={(value) => [`${value} prospect${value > 1 ? 's' : ''}`, '']}
                  labelStyle={{ display: 'none' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={24}>
                  {funnelStages.map((entry) => (
                    <Cell key={entry.id} fill={STAGE_COLORS[entry.id] || '#6366f1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
