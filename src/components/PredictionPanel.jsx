import { Beaker, AlertTriangle } from 'lucide-react';

const LABEL_COLORS = {
  Acid:    'text-rose-400 border-rose-500/30 bg-rose-950/20',
  Acidic:  'text-rose-400 border-rose-500/30 bg-rose-950/20',
  Base:    'text-blue-400 border-blue-500/30 bg-blue-950/20',
  Basic:   'text-blue-400 border-blue-500/30 bg-blue-950/20',
  Neutral: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
  Safe:    'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
};

const labelStyle = (cls) => LABEL_COLORS[cls] ?? 'text-slate-300 border-slate-600/30 bg-slate-900/40';

export default function PredictionPanel({ colorFeatures, onPredict, predictionResult, isPredicting }) {
  const r = predictionResult;

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
          <div className={`flex items-center gap-3 p-3 border rounded-lg ${labelStyle(r.prediction)}`}>
            <Beaker className="w-5 h-5 flex-shrink-0" />
            <div>
              <div className="text-lg font-bold font-display">{r.prediction.toUpperCase()}</div>
              <div className="text-xs opacity-70">Confidence: {r.confidence}%</div>
            </div>
          </div>

          <div className="space-y-1">
            {Object.entries(r.all_proba).map(([cls, pct]) => (
              <div key={cls} className="flex items-center gap-2 text-xs font-mono">
                <span className="w-14 text-slate-400">{cls}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-10 text-right text-slate-400">{pct}%</span>
              </div>
            ))}
          </div>

          {r.conflict && (
            <div className="flex gap-2 p-2 bg-amber-950/20 border border-amber-500/30 rounded-lg text-amber-400 text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Neighbours disagree — borderline sample. Check pH meter.</span>
            </div>
          )}

          <div>
            <div className="text-xs text-slate-500 mb-2 font-mono uppercase tracking-wider">Closest matches</div>
            {r.neighbours.map((n, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-slate-800 last:border-0 text-xs">
                <div
                  className="w-5 h-5 rounded border border-slate-700 flex-shrink-0"
                  style={{ background: n.hex }}
                />
                <span className="font-mono text-slate-400">{n.hex}</span>
                <span className="text-slate-300">pH {n.ph_meter_value}</span>
                <span className={`ml-auto font-mono text-[10px] px-1.5 py-0.5 rounded border ${labelStyle(n.water_class)}`}>
                  {n.water_class}
                </span>
              </div>
            ))}
          </div>
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
