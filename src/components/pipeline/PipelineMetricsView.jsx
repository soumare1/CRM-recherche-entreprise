import { useMemo } from 'react';
import { PIPELINE_STAGES } from '../../lib/constants';
import { TrendingUp, Award, DollarSign, Target, CheckCircle2, ArrowRight } from 'lucide-react';

export default function PipelineMetricsView({ prospects }) {
  const stats = useMemo(() => {
    const totalCount = prospects.length;
    const totalValue = prospects.reduce((sum, p) => sum + (Number(p.montant_estime) || 0), 0);

    const stageBreakdown = PIPELINE_STAGES.map((stage) => {
      const stageProspects = prospects.filter((p) => p.pipeline_stage === stage.id);
      const count = stageProspects.length;
      const value = stageProspects.reduce((sum, p) => sum + (Number(p.montant_estime) || 0), 0);
      const percentCount = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

      return {
        ...stage,
        count,
        value,
        percentCount,
      };
    });

    const wonProspects = prospects.filter((p) => p.pipeline_stage === 'signe');
    const wonValue = wonProspects.reduce((sum, p) => sum + (Number(p.montant_estime) || 0), 0);
    const winRate = totalCount > 0 ? Math.round((wonProspects.length / totalCount) * 100) : 0;

    return {
      totalCount,
      totalValue,
      wonCount: wonProspects.length,
      wonValue,
      winRate,
      stageBreakdown,
    };
  }, [prospects]);

  return (
    <div className="space-y-6">
      {/* Cards de métriques en haut */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#121212] border border-[#262626] flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-medium">Pipeline Total</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {stats.totalValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-1">{stats.totalCount} prospects en cours</p>
          </div>
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <DollarSign size={22} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121212] border border-[#262626] flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-medium">Chiffre Gagné / Signé</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
              {stats.wonValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </h3>
            <p className="text-[11px] text-emerald-500/80 mt-1">{stats.wonCount} affaires conclues</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121212] border border-[#262626] flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-medium">Taux de Conversion</p>
            <h3 className="text-2xl font-extrabold text-violet-400 mt-1">{stats.winRate}%</h3>
            <p className="text-[11px] text-neutral-500 mt-1">Gagnés vs prospects engagés</p>
          </div>
          <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Award size={22} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121212] border border-[#262626] flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-400 font-medium">Valeur Moyenne / Deal</p>
            <h3 className="text-2xl font-extrabold text-white mt-1">
              {(stats.totalCount > 0 ? Math.round(stats.totalValue / stats.totalCount) : 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </h3>
            <p className="text-[11px] text-neutral-500 mt-1">Par opportunité de vente</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Target size={22} />
          </div>
        </div>
      </div>

      {/* Visualisation de l'entonnoir (Funnel) */}
      <div className="p-6 rounded-2xl bg-[#121212] border border-[#262626] space-y-6">
        <div className="flex items-center justify-between border-b border-[#262626] pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp size={18} className="text-violet-400" />
              Analyse de l'Entonnoir de Vente (Conversion Funnel)
            </h3>
            <p className="text-xs text-neutral-400">Répartition des opportunités par étape de négociation</p>
          </div>
        </div>

        <div className="space-y-5">
          {stats.stageBreakdown.map((s, idx) => (
            <div key={s.id} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${s.color}`}>
                    {s.label}
                  </span>
                  <span className="text-neutral-400 font-medium">{s.count} prospects</span>
                </div>
                <span className="font-bold text-white">
                  {s.value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} ({s.percentCount}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden border border-[#262626] flex">
                <div
                  className={`h-full transition-all duration-500 ${
                    s.id === 'signe'
                      ? 'bg-emerald-500'
                      : s.id === 'pas_interesse'
                      ? 'bg-red-500/70'
                      : 'bg-violet-600'
                  }`}
                  style={{ width: `${Math.max(s.percentCount, s.count > 0 ? 4 : 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
