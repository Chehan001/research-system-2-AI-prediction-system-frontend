import { Beaker, Droplet, Zap, Waves } from 'lucide-react';

const classTone = (label) => {
  if (!label) return 'text-slate-300 border-slate-600/30 bg-slate-900/40';
  const l = label.toLowerCase();
  if (l.includes('unsafe')) return 'text-rose-400 border-rose-500/30 bg-rose-950/20';
  if (l.includes('attention')) return 'text-amber-400 border-amber-500/30 bg-amber-950/20';
  if (l.includes('normal') || l.includes('safe')) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20';
  return 'text-slate-300 border-slate-600/30 bg-slate-900/40';
};

const barTone = (label) => {
  if (!label) return 'bg-slate-500';
  const l = label.toLowerCase();
  if (l.includes('unsafe')) return 'bg-rose-500';
  if (l.includes('attention')) return 'bg-amber-500';
  if (l.includes('normal') || l.includes('safe')) return 'bg-emerald-500';
  return 'bg-blue-500';
};

const StatCard = ({ icon: Icon, label, value, unit }) => (
  <div className="flex-1 min-w-0 border border-slate-800 rounded-lg p-3 bg-slate-950/40">
    <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-mono uppercase tracking-wider mb-1">
      <Icon className="w-3 h-3" />
      {label}
    </div>
    <div className="text-lg font-bold font-display text-slate-100 truncate">
      {value}
      {unit && <span className="text-xs font-normal text-slate-500 ml-1">{unit}</span>}
    </div>
  </div>
);

const ConditionBadge = ({ label, value }) => (
  <div className={`flex-1 min-w-0 flex items-center justify-between px-3 py-2 border rounded-lg ${classTone(value)}`}>
    <span className="text-[10px] font-mono uppercase tracking-wider opacity-70">{label}</span>
    <span className="text-xs font-bold truncate ml-2">{value ?? '—'}</span>
  </div>
);

export default function PredictionPanel({ colorFeatures, onPredict, predictionResult, isPredicting }) {
  const r = predictionResult;
  const probabilities = r?.system_output_probabilities
    ? Object.entries(r.system_output_probabilities).sort((a, b) => b[1] - a[1])
    : [];

  return (
    <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/40 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-slate-400 uppercase tracking-widest">Prediction</span>
        <button
          onClick={onPredict}
          disabled={!colorFeatures || isPredicting}
          className="px-4 py-1.5 text-xs font-mono bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg text-white cursor-pointer transition"
        >
          {isPredicting ? 'Analyzing…' : 'Predict'}
        </button>
      </div>

      {r && (
        <>
          {/* Section 1 — Predicted Parameters */}
          <div>
            <div className="text-xs text-slate-500 mb-2 font-mono uppercase tracking-wider">Predicted Parameters</div>
            <div className="flex gap-2">
              <StatCard icon={Droplet} label="pH" value={r.predicted_ph} />
              <StatCard icon={Zap} label="Conductivity" value={r.predicted_conductivity} unit="µS/cm" />
              <StatCard icon={Waves} label="TDS Range" value={`${r.tds_lower} - ${r.tds_upper}`} unit="mg/L" />
            </div>
          </div>

          {/* Section 2 — Conditions */}
          <div>
            <div className="text-xs text-slate-500 mb-2 font-mono uppercase tracking-wider">Conditions</div>
            <div className="flex gap-2">
              <ConditionBadge label="pH Condition" value={r.ph_condition} />
              <ConditionBadge label="EC Condition" value={r.ec_condition} />
            </div>
          </div>

          {/* Section 3 — Final Water Quality */}
          <div>
            <div className="text-xs text-slate-500 mb-2 font-mono uppercase tracking-wider">Final Water Quality</div>
            <div className={`flex items-center gap-3 p-3 border rounded-lg ${classTone(r.system_output)}`}>
              <Beaker className="w-5 h-5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-lg font-bold font-display truncate">{r.system_output ?? 'Unknown'}</div>
                {r.water_class && (
                  <div className="text-xs opacity-70">Water class: {r.water_class}</div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4 — Class Probability */}
          {probabilities.length > 0 && (
            <div>
              <div className="text-xs text-slate-500 mb-2 font-mono uppercase tracking-wider">Class Probability</div>
              <div className="space-y-1.5">
                {probabilities.map(([cls, pct]) => (
                  <div key={cls} className="flex items-center gap-2 text-xs font-mono">
                    <span className="w-44 truncate text-slate-400" title={cls}>{cls}</span>
                    <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${barTone(cls)}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-slate-400">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!r && !isPredicting && (
        <div className="text-slate-600 text-xs font-mono text-center py-4">
          Analyze an ROI first, then press Predict
        </div>
      )}
    </div>
  );
}