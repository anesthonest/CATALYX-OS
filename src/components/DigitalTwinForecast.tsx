import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { 
  Brain, Sparkles, TrendingUp, ShieldAlert, Cpu, 
  HelpCircle, Calendar, Zap, RefreshCw, Layers
} from 'lucide-react';

interface DigitalTwinForecastProps {
  user: UserProfile;
}

interface ForecastState {
  successProbability: number;
  projectDelayWeeks: number;
  burnoutFactor: number;
  burnoutRisk: 'Low' | 'Moderate' | 'High';
  recommendations: string[];
  forecastTrend: Array<{ day: string; speed: number; delay: number }>;
}

export const DigitalTwinForecast: React.FC<DigitalTwinForecastProps> = ({ user }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [forecast, setForecast] = useState<ForecastState | null>(null);

  // Custom simulator triggers
  const [simExecution, setSimExecution] = useState<number>(user.executionScore || 70);
  const [simFocus, setSimFocus] = useState<number>(user.focusScore || 65);
  const [simConsistency, setSimConsistency] = useState<number>(user.consistencyScore || 60);
  const [simMomentum, setSimMomentum] = useState<number>(user.momentumScore || 65);

  const loadTwinForecastModel = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/digital-twin-sim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          xp: user.xp,
          level: user.level,
          executionScore: simExecution,
          focusScore: simFocus,
          consistencyScore: simConsistency,
          momentumScore: simMomentum
        })
      });
      const data = await res.json();
      setForecast(data);
    } catch (err) {
      console.error('Failed to resolve execution twin forecasting model:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTwinForecastModel();
  }, [simExecution, simFocus, simConsistency, simMomentum]);

  const getRiskColor = (risk: string) => {
    if (risk === 'High') return 'text-[#ff007f] bg-pink-500/10 border-pink-500/20';
    if (risk === 'Moderate') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-[#00f5d4] bg-[#00f5d4]/10 border-[#00f5d4]/20';
  };

  return (
    <div className="space-y-6" id="digital-twin-forecast">
      
      {/* HEADER SECTION */}
      <div className="glass-panel p-5 rounded-2xl relative overflow-hidden bg-gradient-to-br from-indigo-950/20 via-slate-950/40 to-black/50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00f5d4]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 text-[9px] font-mono tracking-widest text-brand-cyan border border-brand-cyan/25 bg-brand-cyan/5 rounded-full uppercase">
              MODULE 2: EXECUTION DIGITAL TWIN ENGINE
            </span>
            <h2 className="text-2xl font-display font-semibold text-white mt-2 flex items-center gap-2">
              <Cpu className="w-5.5 h-5.5 text-brand-cyan" />
              Cognitive Digital Twin & Forecasting
            </h2>
            <p className="text-xs text-gray-400 mt-1 max-w-xl font-sans">
              CATALYX V5 models your historical velocity to predict workflow bottlenecks, assess cognitive burn rates, and forecast launch compliance.
            </p>
          </div>

          <button
            onClick={loadTwinForecastModel}
            disabled={loading}
            className="py-1.5 px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-cyan' : ''}`} />
            Recalibrate Twins
          </button>
        </div>
      </div>

      {/* CORE MATRIX GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: SIMULATION REGULATORS */}
        <div className="glass-panel p-5 rounded-2xl space-y-5">
          <div className="flex items-center gap-1.5 text-brand-purple">
            <Layers className="w-4 h-4" />
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Spectrum Regulators</span>
          </div>

          <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
            Slide variables to adjust your subjective states and evaluate future execution outputs under deep simulation.
          </p>

          <div className="space-y-4">
            {/* Range 1 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400 uppercase">EXECUTION VALUE</span>
                <span className="text-brand-purple font-semibold">{simExecution}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={simExecution}
                onChange={(e) => setSimExecution(parseInt(e.target.value))}
                className="w-full accent-brand-purple cursor-pointer bg-slate-900 border border-white/5 h-2 rounded-lg"
              />
              <span className="text-[9px] text-gray-500 block">Corresponds to total raw checklists cleared.</span>
            </div>

            {/* Range 2 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400 uppercase">DEEP FOCUS INDEX</span>
                <span className="text-brand-cyan font-semibold">{simFocus}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={simFocus}
                onChange={(e) => setSimFocus(parseInt(e.target.value))}
                className="w-full accent-brand-cyan cursor-pointer bg-slate-900 border border-white/5 h-2 rounded-lg"
              />
              <span className="text-[9px] text-gray-500 block">Accumulated Pomodoro intervals.</span>
            </div>

            {/* Range 3 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400 uppercase">CONSISTENCY PATTERNS</span>
                <span className="text-brand-pink font-semibold">{simConsistency}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={simConsistency}
                onChange={(e) => setSimConsistency(parseInt(e.target.value))}
                className="w-full accent-brand-pink cursor-pointer bg-slate-900 border border-white/5 h-2 rounded-lg"
              />
              <span className="text-[9px] text-gray-500 block">Consecutive user logging tracking index.</span>
            </div>

            {/* Range 4 */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-gray-400 uppercase">PLANNING VELOCITY</span>
                <span className="text-[#4361ee] font-semibold">{simMomentum}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={simMomentum}
                onChange={(e) => setSimMomentum(parseInt(e.target.value))}
                className="w-full accent-[#4361ee] cursor-pointer bg-slate-900 border border-white/5 h-2 rounded-lg"
              />
              <span className="text-[9px] text-gray-500 block">Friction-free milestone setup speeds.</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DECISION MODEL PREDICTION METRICS */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {forecast ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* Meter 1: Success probability */}
                <div className="p-4 bg-black/30 border border-white/5 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">SUCCESS INDEX PROBABILITY</span>
                  <div className="my-2">
                    <span className="text-4xl font-display font-medium text-brand-purple">{forecast.successProbability}%</span>
                    <span className="text-xs text-gray-400 block mt-1">Calculated sprint completion weight</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                    <div className="bg-brand-purple h-full" style={{ width: `${forecast.successProbability}%` }} />
                  </div>
                </div>

                {/* Meter 2: Delays */}
                <div className="p-4 bg-black/30 border border-white/5 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">ESTIMATED LAUNCH DELAYS</span>
                  <div className="my-2">
                    <span className="text-4xl font-display font-medium text-brand-cyan">{forecast.projectDelayWeeks} <span className="text-xs text-gray-400 font-mono">WKS</span></span>
                    <span className="text-xs text-gray-400 block mt-1">Lag coefficient on backlog item</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                    <div className="bg-brand-cyan h-full" style={{ width: `${Math.min(100, forecast.projectDelayWeeks * 25)}%` }} />
                  </div>
                </div>

                {/* Meter 3: Burnout risk */}
                <div className="p-4 bg-black/30 border border-white/5 rounded-2xl flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">COGNITIVE BURNOUT FACTORS</span>
                  <div className="my-2 flex justify-between items-baseline">
                    <span className="text-4xl font-display font-medium text-brand-pink">{forecast.burnoutFactor}%</span>
                    <span className={`px-2 py-0.5 text-[9px] font-mono border rounded-full uppercase ${getRiskColor(forecast.burnoutRisk)}`}>
                      {forecast.burnoutRisk} RISK
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden">
                    <div className="bg-brand-pink h-full" style={{ width: `${forecast.burnoutFactor}%` }} />
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-28 flex items-center justify-center border border-white/5 bg-black/10 rounded-2xl font-mono text-xs text-gray-500">
                Awaiting Twin recalibration parameters...
              </div>
            )}
          </AnimatePresence>

          {/* PREDICTIVE CHRONOLOGY CHART CARD */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono uppercase text-[#00f5d4] tracking-widest">7-DAY CHRONOLOGICAL VELOCITY FORECAST</span>
              <span className="text-[9px] font-mono text-gray-500">DETERMINISTIC MARKOV TELEMETRY</span>
            </div>

            {forecast && (
              <div className="space-y-3">
                {/* Grid chart visualization */}
                <div className="grid grid-cols-7 gap-2.5 h-36 items-end pt-4 border-b border-white/5 pb-1 select-none">
                  {forecast.forecastTrend.map((trend, idx) => {
                    const speedPercent = Math.min(100, trend.speed);
                    const delayPercent = Math.min(100, trend.delay * 1.5);
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                        <div className="w-full flex justify-center gap-1.5 h-24 items-end">
                          {/* Speed Bar */}
                          <div 
                            className="w-2.5 bg-brand-purple rounded-t"
                            style={{ height: `${speedPercent}%` }}
                            title={`Velocity Speed: ${trend.speed}`}
                          />
                          {/* Delay Bar */}
                          <div 
                            className="w-2.5 bg-brand-pink rounded-t"
                            style={{ height: `${delayPercent}%` }}
                            title={`Delay Coefficient: ${trend.delay}`}
                          />
                        </div>
                        <span className="text-[9px] font-mono text-gray-500">{trend.day}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-4 text-[10px] font-mono justify-center">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-brand-purple rounded-sm" />
                    <span className="text-gray-400">Predicted Active Focus Level</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-brand-pink rounded-sm" />
                    <span className="text-gray-400">Predicted Backlog Friction Indicator</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI COACH TWIN ADVICE DIRECTIVES */}
          {forecast && (
            <div className="glass-panel p-5 rounded-2xl bg-gradient-to-br from-[#9d4edd]/5 to-slate-950/20 space-y-3">
              <div className="flex items-center gap-1.5 text-brand-purple">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest">COGNITIVE TWIN ADVICE DIRECTIVES</span>
              </div>
              <div className="space-y-2">
                {forecast.recommendations.map((rec, index) => (
                  <p key={index} className="text-xs text-gray-300 leading-relaxed font-sans pl-3 border-l-2 border-brand-cyan/40">
                    {rec}
                  </p>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
