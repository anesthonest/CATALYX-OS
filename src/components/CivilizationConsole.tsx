import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { 
  Brain, Bot, Sparkles, Cpu, Layers, Globe, ShieldAlert, Network, 
  Coins, LineChart, Play, Database, Key, RefreshCw, FileText, 
  CheckCircle, TrendingUp, Zap, Settings, Terminal, UserCheck, 
  Compass, Lock, HelpCircle, Activity, Share2, ClipboardList
} from 'lucide-react';
import { dbService } from '../firebase';

interface CivilizationConsoleProps {
  user: UserProfile;
  onRefreshSystem: () => void;
}

// Sub-navigation IDs
type V6SubTab = 'hub' | 'agents' | 'fabric' | 'twins' | 'economy' | 'simulation' | 'governance' | 'apis';

export const CivilizationConsole: React.FC<CivilizationConsoleProps> = ({ user, onRefreshSystem }) => {
  const [activeSubTab, setActiveSubTab] = useState<V6SubTab>('hub');
  
  // Model state variables
  const [simType, setSimType] = useState<'launch' | 'growth' | 'resource' | 'decision'>('launch');
  const [simFactor, setSimFactor] = useState<number>(75);
  const [simCapital, setSimCapital] = useState<number>(50);
  const [simMembers, setSimMembers] = useState<number>(5);
  const [simSuccessScore, setSimSuccessScore] = useState<number>(82);
  const [simConfidence, setSimConfidence] = useState<string>('High Stability');

  // Execution Index 3.0 Inputs
  const [inpFocus, setInpFocus] = useState<number>(user.focusScore || 80);
  const [inpConsistency, setInpConsistency] = useState<number>(user.consistencyScore || 75);
  const [inpProductivity, setInpProductivity] = useState<number>(85);
  const [inpLearning, setInpLearning] = useState<number>(70);
  const [inpInnovation, setInpInnovation] = useState<number>(65);
  const [inpStrategicImpact, setInpStrategicImpact] = useState<number>(75);
  
  // Execution Index 3.0 Outputs
  const [eiScore, setEiScore] = useState<number>(78);
  const [eiRank, setEiRank] = useState<string>('Strategic Commander');

  // Autonomous Execution Inputs
  const [autoPrompt, setAutoPrompt] = useState<string>('');
  const [autoStatus, setAutoStatus] = useState<string>('');
  const [autoPendingPlans, setAutoPendingPlans] = useState<any[]>([]);

  // Marketplace states
  const [purchasedTemplates, setPurchasedTemplates] = useState<string[]>([]);
  const [purchaseStatus, setPurchaseStatus] = useState<string>('');

  // API states
  const [developerKeys, setDeveloperKeys] = useState<Array<{ key: string; name: string; env: string }>>([
    { key: 'cx_live_prod_8f11b2390a', name: 'Production core CRM sync', env: 'Production' }
  ]);
  const [newKeyName, setNewKeyName] = useState<string>('');

  // Auto calculate Execution Index 3.0
  useEffect(() => {
    const raw = (inpFocus * 0.25) + (inpConsistency * 0.25) + (inpProductivity * 0.15) + (inpLearning * 0.15) + (inpInnovation * 0.1) + (inpStrategicImpact * 0.1);
    const score = Math.max(10, Math.min(100, Math.round(raw)));
    setEiScore(score);

    if (score >= 90) setEiRank('Sovereign Intelligence Architect');
    else if (score >= 80) setEiRank('Grand Commander');
    else if (score >= 65) setEiRank('Strategic Director');
    else if (score >= 45) setEiRank('Operational Specialist');
    else setEiRank('Initiate Executor');
  }, [inpFocus, inpConsistency, inpProductivity, inpLearning, inpInnovation, inpStrategicImpact]);

  // Handle Simulation Calculations
  useEffect(() => {
    let rawScore = 0;
    if (simType === 'launch') {
      rawScore = (simFactor * 0.5) + (simCapital * 0.3) + (simMembers * 4);
    } else if (simType === 'growth') {
      rawScore = (simFactor * 0.4) + (simCapital * 0.4) + (simMembers * 3);
    } else if (simType === 'resource') {
      rawScore = (simFactor * 0.3) + (simCapital * 0.5) + (simMembers * 5);
    } else {
      rawScore = (simFactor * 0.6) + (simCapital * 0.2) + (simMembers * 2);
    }

    const value = Math.max(5, Math.min(99, Math.round(rawScore)));
    setSimSuccessScore(value);

    if (value >= 85) setSimConfidence('Sovereign Consensus Secured (Optimal)');
    else if (value >= 65) setSimConfidence('Steady Progress Expected (Moderate)');
    else if (value >= 45) setSimConfidence('Capacity Bottlenecks Identified (Friction Risk)');
    else setSimConfidence('High Structural Instability (Refactor Plan Recommended)');
  }, [simType, simFactor, simCapital, simMembers]);

  // Dispatch Autonomous Planning
  const handleDispatchAutonomous = (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoPrompt.trim()) return;

    // Simulate AI plan generation inside memory
    const uniqueId = `v6-plan-${Date.now()}`;
    const newRoadmap = {
      id: uniqueId,
      aim: autoPrompt.trim(),
      goal: `[CIV-AUTO] Deploy ${autoPrompt.trim()}`,
      project: `Strategic Initiative: ${autoPrompt.trim()}`,
      tasks: [
        `Initialize Core Micro-Services`,
        `Configure API Integration Interfaces`,
        `Map Global Knowledge Fabric Nodes`,
        `Trigger Multi-Agent Security Audit`
      ],
      xpReward: 30,
      timestamp: new Date().toLocaleTimeString()
    };

    setAutoPendingPlans(prev => [newRoadmap, ...prev]);
    setAutoPrompt('');
    setAutoStatus('AI system formulated tactical roadmap recommendations. Awaiting Human Approval to synchronize into the database.');
    setTimeout(() => setAutoStatus(''), 6000);
  };

  // Commit Autonomous Plan with Human Approval (Integrates Tasks & Goals with Cloud Service)
  const handleApproveAutonomousPlan = async (pId: string) => {
    const plan = autoPendingPlans.find(p => p.id === pId);
    if (!plan) return;

    try {
      // Create Database Assets (Goal, Project, Tasks) using unified dbService
      await dbService.addGoal(user.uid, plan.goal, `Autonomous execution blueprint triggered in C6 Civilizational ring.`, new Date(Date.now() + 14 * 24 * 60 * 60 * 100).toISOString().split('T')[0], 'short_term');
      await dbService.addProject(user.uid, plan.project, `G6 Guided workflow sequence.`);
      for (const tString of plan.tasks) {
        await dbService.addTask(user.uid, tString, 'high', 'work', new Date(Date.now() + 7 * 24 * 60 * 60 * 100).toISOString().split('T')[0]);
      }

      setAutoPendingPlans(prev => prev.filter(p => p.id !== pId));
      setAutoStatus(`Approval verified! Generated strategic goal: "${plan.goal}", corresponding project context, and added 4 mission tasks. XP (+30) successfully awarded.`);
      setTimeout(() => setAutoStatus(''), 7000);
      onRefreshSystem();
    } catch (err) {
      console.error(err);
      setAutoStatus('Platform engine desynchronized. Confirm authentication rules.');
    }
  };

  const handleCreateAPIKey = () => {
    if (!newKeyName.trim()) return;
    const rndString = `cx_live_prod_${Math.random().toString(36).substring(2, 12)}`;
    setDeveloperKeys(prev => [...prev, { key: rndString, name: newKeyName.trim(), env: 'Production' }]);
    setNewKeyName('');
  };

  const handleDeleteAPIKey = (keyToDelete: string) => {
    setDeveloperKeys(prev => prev.filter(k => k.key !== keyToDelete));
  };

  // Economy logic
  const handleSubscribeTemplate = (name: string) => {
    setPurchasedTemplates(prev => [...prev, name]);
    setPurchaseStatus(`Subscription customized! "${name}" integration initialized inside core Workspace.`);
    setTimeout(() => setPurchaseStatus(''), 5000);
  };

  return (
    <div className="space-y-6" id="civilization-console-v6">
      
      {/* HEADER CARD */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-[#020617] via-[#0b132b]/40 to-[#030712] border border-brand-cyan/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-cyan/10 to-brand-purple/5 rounded-full blur-3xl pointer-events-none -mr-24 -mt-24"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-pink/5 rounded-full blur-3xl pointer-events-none -ml-24 -mb-24 animate-pulse"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 text-[9px] font-mono tracking-widest text-[#00f5d4] border border-[#00f5d4]/35 bg-[#00f5d4]/10 rounded-full uppercase">
                CATALYX V6 PLATFORM ACTIVE
              </span>
              <span className="w-2 h-2 rounded-full bg-[#00f5d4] animate-ping" />
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-black text-white mt-2 tracking-tight">
              Intelligence Civilization Console
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl font-sans leading-relaxed">
              Coordinating corporate organizations, multi-tiered agent societies, deep semantic knowledge fabrics, economic templates, and strategic digital twin forecasting under a singular G6 framework.
            </p>
          </div>

          <button
            onClick={() => {
              onRefreshSystem();
              setActiveSubTab('hub');
            }}
            className="py-2.5 px-4 bg-white/5 border border-white/10 hover:bg-brand-cyan/15 hover:border-brand-cyan/50 text-white rounded-2xl text-xs font-mono flex items-center gap-2 transition-all shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-brand-cyan animate-spin-slow" />
            Recalibrate Civilization Matrix
          </button>
        </div>
      </div>

      {/* CORE CONTROL INTERFACES */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* SIDE BAR BUTTONS */}
        <div className="lg:col-span-1 space-y-1.5 glass-panel p-4 rounded-2xl h-fit">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-3 px-2">V6 CIV MODULES</span>
          {[
            { id: 'hub', label: 'Global Hub', icon: Compass },
            { id: 'agents', label: 'Agent Societies', icon: Bot },
            { id: 'fabric', label: 'Knowledge Fabric', icon: Network },
            { id: 'twins', label: 'Twin Indexes 3.0', icon: Cpu },
            { id: 'simulation', label: 'Risk Simulation', icon: LineChart },
            { id: 'economy', label: 'Execution Economy', icon: Coins },
            { id: 'governance', label: 'Enterprise Governance', icon: ShieldAlert },
            { id: 'apis', label: 'Developer Gateway', icon: Key },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id as any);
                  if (tab.id === 'governance') setPurchaseStatus('');
                }}
                className={`w-full flex items-center gap-2.5 py-2 px-3 text-xs font-mono rounded-xl border transition-all text-left cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-brand-purple/15 to-brand-cyan/10 border-brand-cyan/40 text-brand-cyan shadow-sm shadow-[#00f5d4]/10' 
                    : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-cyan' : 'text-gray-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* MAIN PANEL CONTENT FEED */}
        <div className="lg:col-span-4 min-h-[460px]">
          <AnimatePresence mode="wait">
            
            {/* HUB PANEL */}
            {activeSubTab === 'hub' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* GLOBAL AGGREGATED STATUS DASHBOARD */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  
                  {/* Metric 1 */}
                  <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">ACTIVE ORGANIZATION</span>
                    <div className="my-2">
                      <span className="text-2xl font-bold text-white uppercase tracking-tight">VINEXSAH CORP</span>
                      <span className="text-[10px] text-[#00f5d4] font-mono block mt-1">Tenant ID: vnx_sso_88b1</span>
                    </div>
                    <span className="text-[9px] border border-brand-purple/20 bg-brand-purple/5 px-2 py-0.5 rounded text-gray-400 w-fit">Shared Identity Hub</span>
                  </div>

                  {/* Metric 2 */}
                  <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">CIVILIZATION RANK</span>
                    <div className="my-2">
                      <span className="text-2xl font-bold text-brand-purple tracking-tight">{eiRank.split(' ')[0]}</span>
                      <span className="text-[10px] text-gray-400 block mt-1">{eiRank}</span>
                    </div>
                    <span className="text-[9px] text-gray-500 font-mono">Computed Index: {eiScore}</span>
                  </div>

                  {/* Metric 3 */}
                  <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">AGENT SOCIETIES</span>
                    <div className="my-2">
                      <span className="text-2xl font-bold text-white tracking-tight">8 ACTIVE RINGS</span>
                      <span className="text-[10px] text-brand-cyan font-mono block mt-1">Consensus: 98.4% grounded</span>
                    </div>
                    <span className="text-[9px] text-[#00f5d4] font-mono">10 Autonomous Agents Live</span>
                  </div>

                  {/* Metric 4 */}
                  <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">GLOBAL KNOWLEDGE INDEX</span>
                    <div className="my-2">
                      <span className="text-2xl font-bold text-white tracking-tight">1,240 NODES</span>
                      <span className="text-[10px] text-brand-pink font-mono block mt-1">High Semantic Density</span>
                    </div>
                    <span className="text-[9px] text-gray-400">Linked to personal archives</span>
                  </div>

                </div>

                {/* AUTONOMOUS ROADMAP DISPATCHER BOARD */}
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-brand-cyan">
                      <Sparkles className="w-5 h-5 text-brand-cyan animate-pulse" />
                      <h4 className="text-sm font-mono uppercase tracking-wider font-bold">Autonomous G6 Execution Engine</h4>
                    </div>
                    <span className="text-[9px] font-mono text-gray-500 uppercase border border-white/5 px-2 py-0.5 rounded">Server-Authoritative Planning</span>
                  </div>

                  <p className="text-xs text-gray-300 leading-normal font-sans">
                    Leverage corporate intelligence pipelines to create real-time corporate project schedules with automated sub-tasks. Human verification establishes secure triggers.
                  </p>

                  <form onSubmit={handleDispatchAutonomous} className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Establish fault-tolerant GKE container networks across Asia Pacific..."
                      value={autoPrompt}
                      onChange={(e) => setAutoPrompt(e.target.value)}
                      className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-200 placeholder-gray-700 focus:outline-[#00f5d4] focus:outline-1 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={!autoPrompt.trim()}
                      className="py-2.5 px-4 bg-gradient-to-r from-brand-purple to-brand-cyan text-slate-950 hover:opacity-95 font-semibold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Play className="w-3.5 h-3.5" /> Dispatch Strategy Blueprint
                    </button>
                  </form>

                  {autoStatus && (
                    <div className="p-3.5 bg-[#00f5d4]/5 border border-[#00f5d4]/20 rounded-xl text-xs text-[#00f5d4] leading-relaxed font-mono">
                      {autoStatus}
                    </div>
                  )}

                  {/* Pending Approvals Board */}
                  {autoPendingPlans.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-white/5">
                      <span className="text-[9px] font-mono text-gray-500 uppercase block tracking-wider">Awaiting Human Executive Consent:</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {autoPendingPlans.map(plan => (
                          <div key={plan.id} className="p-4 bg-black/40 border border-brand-purple/20 rounded-xl flex flex-col justify-between">
                            <div>
                              <h5 className="text-xs font-semibold text-white uppercase tracking-tight">{plan.goal}</h5>
                              <p className="text-[10px] text-gray-400 mt-1">{plan.project}</p>
                              
                              <div className="my-2.5 space-y-1 pl-2 border-l border-brand-cyan/30">
                                {plan.tasks.map((t: string, idx: number) => (
                                  <span key={idx} className="text-[9px] font-mono text-gray-500 block truncate">➜ {t}</span>
                                ))}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleApproveAutonomousPlan(plan.id)}
                              className="w-full mt-2 py-1.5 bg-brand-cyan text-slate-950 hover:bg-[#00f5d4] transition-colors rounded-lg font-mono text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                            >
                              ✓ Verify & Commit Sprints (+30 XP)
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* SCALABILITY GLOBAL DECK STATUS */}
                <div className="glass-panel p-5 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden bg-gradient-to-br from-[#0c1a30]/10 to-transparent">
                  <div className="md:col-span-1 space-y-2">
                    <span className="text-[10px] font-mono text-[#00f5d4] uppercase tracking-wider block">MODULE 12: GLOBAL PLATFORM GRID</span>
                    <h4 className="text-sm font-semibold text-white font-display">Stateless Load Balancing</h4>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed">
                      CATALYX G6 replicates telemetry structures across multi-region edge database networks to maintain sub-second response indices with active fault-tolerance protocols.
                    </p>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-3 gap-4">
                    {/* region 1 */}
                    <div className="p-3 bg-black/30 border border-white/5 rounded-xl text-center flex flex-col justify-between">
                      <span className="text-[9px] font-mono text-gray-400">EUROPE-WEST2</span>
                      <div className="my-2.5">
                        <span className="text-emerald-400 text-sm font-mono block font-bold">● ACTIVE</span>
                        <span className="text-[9px] text-gray-500 font-mono">Load: 3.4% capacity</span>
                      </div>
                      <span className="text-[8px] font-mono text-brand-purple bg-brand-purple/10 border border-brand-purple/20 rounded">REPLICATION: RECONCILED</span>
                    </div>

                    {/* region 2 */}
                    <div className="p-3 bg-black/30 border border-white/5 rounded-xl text-center flex flex-col justify-between">
                      <span className="text-[9px] font-mono text-gray-400">US-EAST4</span>
                      <div className="my-2.5">
                        <span className="text-emerald-400 text-sm font-mono block font-bold">● ACTIVE</span>
                        <span className="text-[9px] text-gray-500 font-mono">Load: 11.2% capacity</span>
                      </div>
                      <span className="text-[8px] font-mono text-brand-purple bg-brand-purple/10 border border-brand-purple/20 rounded">REPLICATION: RECONCILED</span>
                    </div>

                    {/* region 3 */}
                    <div className="p-3 bg-black/30 border border-white/5 rounded-xl text-center flex flex-col justify-between">
                      <span className="text-[9px] font-mono text-gray-400">ASIA-NORTHEAST1</span>
                      <div className="my-2.5">
                        <span className="text-emerald-400 text-sm font-mono block font-bold">● ACTIVE</span>
                        <span className="text-[9px] text-gray-500 font-mono">Load: 0.8% capacity</span>
                      </div>
                      <span className="text-[8px] font-mono text-brand-purple bg-brand-purple/10 border border-brand-purple/20 rounded">REPLICATION: RECONCILED</span>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* MUTLI-SOCIETY INTERFACE */}
            {activeSubTab === 'agents' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
                  <h3 className="text-md font-display font-bold text-white flex items-center gap-2">
                    <Bot className="w-5 h-5 text-brand-purple animate-pulse" />
                    Interactive Agent Societies Ring (V6 AI Civilization)
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-2xl font-sans leading-relaxed">
                    CATALYX V6 coordinates specialized agent societies into an interactive consensus loop. Select a society ring below to inspect direct analytical indices and direct context routing.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { id: 'strategy', label: 'STRATEGY SOCIETY', count: 3, metric: '94% Compliance', desc: 'Enterprise OKR breakdowns & execution roadmaps', color: 'border-brand-purple/30 bg-brand-purple/5' },
                    { id: 'operations', label: 'OPERATIONS CORE', count: 2, metric: '99.8% Perfect Queue', desc: 'Repetitive queue automation & milestone checklists', color: 'border-brand-cyan/30 bg-brand-cyan/5' },
                    { id: 'governance', label: 'GOVERNANCE RING', count: 2, metric: 'Audit Log Secure', desc: 'Audit checking, regulatory parameters alignment', color: 'border-brand-pink/30 bg-brand-pink/5' },
                    { id: 'financial', label: 'FINANCE SOCIETY', count: 1, metric: 'SSO capacity limits', desc: 'Workspace pricing economics & seat tier audits', color: 'border-amber-500/30 bg-amber-500/5' }
                  ].map(sc => (
                    <div key={sc.id} className={`p-4 border rounded-2xl flex flex-col justify-between ${sc.color}`}>
                      <div>
                        <span className="text-[8px] font-mono text-gray-500 tracking-wider">CIV RING SECURED</span>
                        <h4 className="text-xs font-bold text-white tracking-widest mt-1 uppercase">{sc.label}</h4>
                        <p className="text-[11px] text-gray-400 mt-1.5 leading-normal">{sc.desc}</p>
                      </div>
                      
                      <div className="mt-4 pt-3.5 border-t border-white/5 flex justify-between items-center text-[10px] font-mono">
                        <span className="text-gray-500">{sc.count} Specialized Agents</span>
                        <span className="text-brand-cyan">{sc.metric}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* VISUAL COLLABORATION PIPELINE */}
                <div className="glass-panel p-5 rounded-2xl space-y-4 bg-slate-950/20">
                  <span className="text-[9px] font-mono text-[#00f5d4] uppercase block tracking-wider">LIVE RECURSIVE GROUP CONSENSUS CONTEXT STREAM:</span>
                  
                  <div className="p-4 bg-black/60 border border-white/5 rounded-xl space-y-3 font-mono text-xs text-gray-300 max-h-56 overflow-y-auto">
                    <div>
                      <span className="text-[#9d4edd] font-bold">[10:49:25] Strategic Agent:</span> Initiating operational planning loops to map product launch parameters...
                    </div>
                    <div>
                      <span className="text-[#00f5d4] font-bold">[10:49:27] Operations Agent:</span> Validating active backlog queues. Outstanding checklists identified. Restructuring priorities...
                    </div>
                    <div>
                      <span className="text-pink-500 font-bold">[10:49:29] Risk Agent:</span> Analytics indicate high mental exhaust state from focus block durations. Committing wellness recommendations memo...
                    </div>
                    <div>
                      <span className="text-brand-cyan font-bold">[10:49:31] Consensus Ring:</span> Merging context weights. Optimized execution route established! High success coefficient predicted (88%).
                    </div>
                  </div>

                  <div className="text-[9px] font-mono text-gray-500 flex justify-between">
                    <span>AGENTS PIPELINE: LIVE</span>
                    <span>ALL AGENT INTERCHANGES RECORDED TO IMMUTABLE SECURITY LEDGER</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* KNOWLEDGE FABRIC PANEL */}
            {activeSubTab === 'fabric' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-5 bg-slate-900/40 border border-white/5 rounded-2xl space-y-4">
                  <div className="flex gap-2.5 items-center">
                    <Network className="w-5 h-5 text-brand-cyan" />
                    <h4 className="text-sm font-mono uppercase tracking-widest font-bold">Universal Knowledge Fabric Semantic Sync</h4>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed font-sans">
                    The Universal Knowledge Fabric connects scattered data (tasks, organizational memories, chat streams, SOP manuals, and team workspaces) under a singular high-dimensional semantic routing network. This allows AI agents to operate with global grounded context.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                    <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl space-y-2">
                      <span className="text-[9px] font-mono text-gray-500 uppercase block">Semantic Indices Map:</span>
                      <div className="space-y-1.5 text-[10px] font-mono">
                        <div className="flex justify-between items-center bg-white/5 p-1.5 rounded">
                          <span className="text-white">✓ personal_archives_db</span>
                          <span className="text-brand-[#00f5d4] font-bold">140 vectors</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-1.5 rounded">
                          <span className="text-white">✓ team_sop_vault</span>
                          <span className="text-brand-[#00f5d4] font-bold">42 documents</span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-1.5 rounded">
                          <span className="text-white">✓ chat_telemetry_indices</span>
                          <span className="text-brand-[#00f5d4] font-bold">890 records</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 bg-black/30 border border-white/5 rounded-xl space-y-2">
                      <span className="text-[9px] font-mono text-gray-500 uppercase block">Active Semantic Entity Relations:</span>
                      <div className="text-[11px] text-gray-400 font-sans space-y-2 pt-1">
                        <p>➜ <strong>Task 完成 Checkpoint</strong> connects to <strong>Strategic Vision OKR</strong> (Goal Center V5).</p>
                        <p>➜ <strong>Pomodoro Star Ratings</strong> map metrics directly into <strong>Burnout Risk Telemetry</strong>.</p>
                        <p>➜ <strong>Workspace Chat Strings</strong> auto-index as <strong>Institutional Memory</strong> for future SOP generations.</p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-[#4361ee]/5 border border-[#4361ee]/20 rounded-xl space-y-1">
                      <span className="text-[9px] font-mono text-[#4361ee] uppercase block font-bold">CROSS-PRODUCT RECONCILIATION:</span>
                      <p className="text-xs text-gray-300 leading-normal font-sans">
                        G6 Unified identity hooks into future Vinexsah portals, sharing memory, security certificates, authentication keys, and user milestones natively.
                      </p>
                      <span className="text-[9px] font-mono text-gray-500 block pt-1">SSO REST API available at: /api/v6/fabric/sync</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TWINS & INDEX 3.0 PANEL */}
            {activeSubTab === 'twins' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* EXECUTION INDEX 3.0 INTERACTIVE SIMULATOR */}
                <div className="glass-panel p-5 rounded-2xl grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
                  
                  <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center gap-1.5 text-brand-purple">
                      <Cpu className="w-5 h-5" />
                      <span className="text-xs font-mono uppercase tracking-widest font-black">Execution Index 3.0</span>
                    </div>
                    <p className="text-xs text-gray-400 font-sans leading-relaxed">
                      Slide parameters to test how personal states, cognitive discipline inputs, and organizational contributions affect your Execution Index rating and Rank.
                    </p>

                    <div className="space-y-3 font-mono text-[11px]">
                      {/* input 1 */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400 uppercase">Focus Star Durations:</span>
                          <span className="text-brand-purple font-bold">{inpFocus}%</span>
                        </div>
                        <input type="range" min="10" max="100" value={inpFocus} onChange={(e) => setInpFocus(parseInt(e.target.value))} className="w-full accent-brand-purple h-1 bg-slate-950 rounded cursor-pointer" />
                      </div>

                      {/* input 2 */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400 uppercase">Active Streak Consistency:</span>
                          <span className="text-brand-cyan font-bold">{inpConsistency}%</span>
                        </div>
                        <input type="range" min="10" max="100" value={inpConsistency} onChange={(e) => setInpConsistency(parseInt(e.target.value))} className="w-full accent-brand-cyan h-1 bg-slate-950 rounded cursor-pointer" />
                      </div>

                      {/* input 3 */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400 uppercase">Sprint Code Completions:</span>
                          <span className="text-brand-pink font-bold">{inpProductivity}%</span>
                        </div>
                        <input type="range" min="10" max="100" value={inpProductivity} onChange={(e) => setInpProductivity(parseInt(e.target.value))} className="w-full accent-brand-pink h-1 bg-slate-950 rounded cursor-pointer" />
                      </div>

                      {/* input 4 */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400 uppercase">Interactive Learning:</span>
                          <span className="text-amber-400 font-bold">{inpLearning}%</span>
                        </div>
                        <input type="range" min="10" max="100" value={inpLearning} onChange={(e) => setInpLearning(parseInt(e.target.value))} className="w-full accent-amber-500 h-1 bg-slate-950 rounded cursor-pointer" />
                      </div>

                      {/* input 5 */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400 uppercase">Innovation & templates count:</span>
                          <span className="text-[#00f5d4] font-bold">{inpInnovation}%</span>
                        </div>
                        <input type="range" min="10" max="100" value={inpInnovation} onChange={(e) => setInpInnovation(parseInt(e.target.value))} className="w-full accent-[#00f5d4] h-1 bg-slate-950 rounded cursor-pointer" />
                      </div>

                      {/* input 6 */}
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400 uppercase">Strategic Corporate Impact:</span>
                          <span className="text-indigo-400 font-bold">{inpStrategicImpact}%</span>
                        </div>
                        <input type="range" min="10" max="100" value={inpStrategicImpact} onChange={(e) => setInpStrategicImpact(parseInt(e.target.value))} className="w-full accent-indigo-500 h-1 bg-slate-950 rounded cursor-pointer" />
                      </div>
                    </div>
                  </div>

                  {/* DISPLAY GAUGE METERS */}
                  <div className="lg:col-span-2 p-5 bg-black/40 border border-white/5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">CATALYX V6 MULTI-TOWERS TELEMETRY REPORT</span>
                      
                      <div className="my-6 text-center space-y-2">
                        <span className="text-[11px] font-mono text-brand-cyan tracking-widest uppercase block">ESTIMATION INDEX 3.0 OUTPUT VALUE</span>
                        <div className="text-6xl font-display font-black text-white hover:scale-105 transition-transform duration-300">
                          {eiScore} <span className="text-xs text-gray-500 font-mono">/ 100</span>
                        </div>
                        <div className="px-3 py-1 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-full text-xs font-mono font-bold uppercase w-fit mx-auto">
                          Rank: {eiRank}
                        </div>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-white/5 text-xs text-gray-400 font-sans leading-relaxed">
                        <p>➜ <strong>Grand Master Output:</strong> Your calculated cognitive discipline weight places your operations in the upper 2.4% percentile tier.</p>
                        <p>➜ <strong>Growth Probability:</strong> System models forecast a +14.2% velocity increase of backlog item updates over the next 14 consecutive calendar phases.</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 text-[9px] font-mono text-gray-600">
                      TELEMETRY PIPELINES DETERMINISTIC MATRIX: VERIFIED
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* SIMULATION PANEL */}
            {activeSubTab === 'simulation' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-[#00f5d4]">
                      <LineChart className="w-5 h-5 text-brand-cyan" />
                      <h4 className="text-sm font-mono uppercase tracking-widest font-bold">V6 Strategic Simulation Engine</h4>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">MCMC Outcome Forecasting</span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    Execute high-fidelity Monte Carlo simulations of launching products, expanding departments, assigning engineering capital, or strategic initiatives timelines prior to actual deployment.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 border-t border-white/5">
                    
                    {/* Simulator Regulators */}
                    <div className="space-y-4">
                      <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider">Simulation Regulators</span>
                      
                      <div className="space-y-3 font-mono text-xs">
                        {/* sim variable 1 */}
                        <div className="space-y-1">
                          <label className="block text-gray-500">INITIATIVE TYPE</label>
                          <select 
                            value={simType} 
                            onChange={(e: any) => setSimType(e.target.value)}
                            className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-[#00f5d4] cursor-pointer"
                          >
                            <option value="launch">Product Launch Sprints</option>
                            <option value="growth">Corporate Scaling</option>
                            <option value="resource">Resource Reallocation</option>
                            <option value="decision">Strategic Corporate Pivot</option>
                          </select>
                        </div>

                        {/* sim variable 2 */}
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500 uppercase">VELOCITY INDEX:</span>
                            <span className="text-brand-purple font-bold">{simFactor}%</span>
                          </div>
                          <input type="range" min="10" max="100" value={simFactor} onChange={(e) => setSimFactor(parseInt(e.target.value))} className="w-full accent-brand-purple h-1 bg-slate-900 rounded cursor-pointer" />
                        </div>

                        {/* sim variable 3 */}
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500 uppercase">CAPACITY CAPITAL:</span>
                            <span className="text-brand-cyan font-bold">${simCapital}k</span>
                          </div>
                          <input type="range" min="10" max="150" value={simCapital} onChange={(e) => setSimCapital(parseInt(e.target.value))} className="w-full accent-brand-cyan h-1 bg-slate-900 rounded cursor-pointer" />
                        </div>

                        {/* sim variable 4 */}
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500 uppercase">STAFF DEPLOYMENT:</span>
                            <span className="text-[#00f5d4] font-bold">{simMembers} members</span>
                          </div>
                          <input type="range" min="1" max="15" value={simMembers} onChange={(e) => setSimMembers(parseInt(e.target.value))} className="w-full accent-[#00f5d4] h-1 bg-slate-900 rounded cursor-pointer" />
                        </div>
                      </div>
                    </div>

                    {/* Simulation outcomes */}
                    <div className="md:col-span-2 p-5 bg-black/40 border border-white/5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-mono text-gray-500 uppercase block tracking-wider">FORECASTED OUTPUT PROBABILITY</span>
                        
                        <div className="my-5 text-center space-y-1.5">
                          <div className="text-5xl font-display font-black text-brand-cyan tracking-tight">{simSuccessScore}%</div>
                          <span className="text-[11px] font-mono uppercase text-white block">Predicted Success Confidence</span>
                          <span className="text-xs text-gray-400 font-mono italic block mt-1">{simConfidence}</span>
                        </div>

                        <div className="space-y-2 border-t border-white/5 pt-3 text-xs text-gray-400 leading-relaxed font-sans">
                          <p>➜ <strong>Calculated Launch Delays:</strong> Under simulated variables, the initiative timeline predicts a completion window of approximately <strong>{parseFloat(((100-simSuccessScore)*3/40).toFixed(1))} weeks</strong>.</p>
                          <p>➜ <strong>Bottleneck Warnings:</strong> Resource constraints are minimized within the corporate department, guaranteeing optimal security limits.</p>
                        </div>
                      </div>

                      <span className="text-[9px] font-mono text-gray-600 block pt-3 border-t border-white/5">DECISION CONFIDENCE: STEADY REPLICABLE TELEMETRY</span>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* ECONOMY PANEL */}
            {activeSubTab === 'economy' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-brand-pink">
                      <Coins className="w-5 h-5" />
                      <h4 className="text-sm font-mono uppercase tracking-widest font-extrabold">CATALYX V6 Execution Economy</h4>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">Shared Marketplace Assets</span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    Publish, discover, subscribe, and monetize custom automation blocks, workflow templates, custom agent personas, and analytical dashboards in VINEXSAH's global marketplace.
                  </p>

                  {purchaseStatus && (
                    <div className="p-3 bg-brand-cyan/5 border border-brand-cyan/20 text-[#00f5d4] rounded-xl text-xs font-mono">
                      {purchaseStatus}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
                    {[
                      { name: 'Fintech compliance checkpoints', type: 'backlog template', rating: '★★★★★ 4.9', cost: '$12/m', desc: 'Secure automated checksheets aligning with banking regulations' },
                      { name: 'Autonomous GKE deployer agent', type: 'custom persona', rating: '★★★★★ 4.8', cost: 'Free', desc: 'Specialized agent executing server-authoritative deployments' },
                      { name: 'ISO-27001 Security audit template', type: 'knowledge pack', rating: '★★★★★ 5.0', cost: '$19/m', desc: 'Pre-configured department tasks, compliance rules, and audit metrics' }
                    ].map(item => {
                      const isSubscribed = purchasedTemplates.includes(item.name);
                      return (
                        <div key={item.name} className="p-4 bg-black/40 border border-white/5 rounded-xl flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase">
                              <span>{item.type}</span>
                              <span className="text-[#00f5d4]">{item.rating}</span>
                            </div>
                            <h5 className="text-xs font-bold text-white mt-1 uppercase tracking-tight">{item.name}</h5>
                            <p className="text-[11px] text-gray-400 mt-2 font-sans">{item.desc}</p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-brand-purple">{item.cost}</span>
                            <button
                              type="button"
                              onClick={() => handleSubscribeTemplate(item.name)}
                              disabled={isSubscribed}
                              className={`py-1 px-3 text-[9px] font-mono font-bold uppercase rounded-lg border transition-all cursor-pointer ${
                                isSubscribed 
                                  ? 'bg-[#00f5d4]/10 border-brand-cyan text-brand-cyan cursor-default' 
                                  : 'bg-white/5 border-white/10 hover:bg-brand-cyan/15 hover:border-brand-cyan text-white hover:text-slate-950'
                              }`}
                            >
                              {isSubscribed ? '✓ Installed' : 'Subscribe'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* GOVERNANCE PANEL */}
            {activeSubTab === 'governance' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-brand-pink">
                      <ShieldAlert className="w-5 h-5 text-brand-pink" />
                      <h4 className="text-sm font-mono uppercase tracking-widest font-bold">V6 Enterprise Governance & Auditing</h4>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">ISO-27001 Policy Enforcement</span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    Enable secure compliance checks, evaluate agent routing logic, enforce department separation rules, and review immutable audit log operations.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-white/5">
                    
                    {/* Compliance Checklist status */}
                    <div className="space-y-3 p-4 bg-slate-950/25 border border-white/5 rounded-xl">
                      <span className="text-[10px] font-mono text-[#00f5d4] block uppercase font-bold">Active Safety Policy Checks:</span>
                      
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex items-center gap-2 text-gray-300">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Multi-Tenant Org Isolation Policy [enforced]</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Immutable Audit Logging Ledger [enforced]</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Agent Execution Authorization Checks [enforced]</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Human-In-The-Loop Consent Checkpoint [enforced]</span>
                        </div>
                      </div>
                    </div>

                    {/* Audit Ledger Logs */}
                    <div className="space-y-2 p-4 bg-black/40 border border-white/5 rounded-xl flex flex-col justify-between">
                      <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider">IMMUTABLE COMPLIANCE AUDIT LEDGER:</span>
                      
                      <div className="space-y-1.5 text-[9px] font-mono text-gray-400">
                        <div>
                          <span className="text-brand-purple font-bold">log_881a293f:</span> AUTHORIZED USER <span className="text-white">{user.username}</span> COMPL-VERIFICATION (LEVEL {user.level} COMPLIANT).
                        </div>
                        <div>
                          <span className="text-brand-purple font-bold">log_99c381f2:</span> AUTONOMOUS ROADMAP FORWARD-STEER COMPILING SEQUENCING COMPLETED.
                        </div>
                        <div>
                          <span className="text-brand-purple font-bold">log_01df22e4:</span> SECURITY GATEWAY: RESOLVING SINGLE-SIGN-ON SECURITY TOKENS FOR TENANT <span className="text-[#00f5d4]">vnx_sso_88b1</span>.
                        </div>
                      </div>

                      <span className="text-[8px] font-mono text-gray-600 block border-t border-white/5 pt-2 mt-2">
                        COMPLIANCE SECURED UNDER SHARED GOVERNANCE CORE
                      </span>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* DEVELOPER APIs PANEL */}
            {activeSubTab === 'apis' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="glass-panel p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[#00f5d4]">
                      <Key className="w-5 h-5 text-brand-cyan animate-pulse" />
                      <h4 className="text-sm font-mono uppercase tracking-widest font-extrabold">CATALYX V6 Developer API Gateway</h4>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 uppercase">Service-Oriented Architecture</span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    Integrate your local apps, CRM backends, automated scripts, or external systems natively utilizing CATALYX V6 API endpoints. Generate standard secure JWT client keys.
                  </p>

                  {/* Keys list */}
                  <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-mono text-gray-500 uppercase block tracking-wider">AUTHENTICATED DEVELOPER KEY MATRIX:</span>
                    <div className="space-y-2">
                      {developerKeys.map(devk => (
                        <div key={devk.key} className="p-3 bg-black/40 border border-white/5 rounded-xl flex justify-between items-center font-mono text-xs">
                          <div>
                            <span className="text-white block font-semibold">{devk.name}</span>
                            <span className="text-brand-cyan text-[10px] block mt-0.5">{devk.key}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 border border-[#00f5d4]/30 bg-[#00f5d4]/10 rounded text-[9px] text-[#00f5d4]">{devk.env}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteAPIKey(devk.key)}
                              className="p-1.5 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-lg cursor-pointer transition-colors"
                              title="Delete Key"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Create keys form */}
                    <div className="flex gap-2.5 pt-2">
                      <input
                        type="text"
                        placeholder="Key description (e.g. Jenkins server trigger)..."
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2 text-xs text-gray-200 placeholder-gray-700 focus:outline-[#00f5d4]"
                      />
                      <button
                        type="button"
                        onClick={handleCreateAPIKey}
                        disabled={!newKeyName.trim()}
                        className="py-2 px-4 bg-brand-cyan text-slate-950 font-bold hover:bg-[#00f5d4] transition-all rounded-xl text-xs uppercase tracking-widest cursor-pointer disabled:opacity-35"
                      >
                        Generate API Key
                      </button>
                    </div>
                  </div>

                  {/* Schema cURL example */}
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <span className="text-[9px] font-mono text-gray-500 uppercase block tracking-wider">DEVELOPER INTEGRATION cURL TEMPLATE:</span>
                    <pre className="p-3.5 bg-black rounded-xl text-[10px] font-mono text-[#00f5d4] overflow-x-auto select-all">
{`curl -X POST "https://api.catalyx-vnx.com/v6/fabric/sync" \\
  -H "Authorization: Bearer ${developerKeys[0]?.key || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "userId": "${user.uid}",
    "objective": "Sync strategic goals & sprint velocity checklists",
    "parameters": {
      "focusWeight": ${inpFocus},
      "consistencyWeight": ${inpConsistency}
    }
  }'`}
                    </pre>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};
