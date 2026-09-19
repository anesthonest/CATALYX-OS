import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AIMessage, UserProfile } from '../types';
import { 
  Bot, Send, Sparkles, Trash2, Zap, Brain, ShieldAlert,
  Compass, BookOpen, Sliders, LineChart, Database, Lightbulb, Users, Coins, HelpCircle, Network, CheckCircle
} from 'lucide-react';

interface AICoachTabProps {
  user: UserProfile;
  aiMessages: AIMessage[];
  onSendMessage: (text: string, agentId?: string) => Promise<void>;
  onClearHistory: () => void;
  isSending: boolean;
}

export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  color: string;
  glow: string;
  icon: React.ComponentType<any>;
  objective: string;
  capabilities: string[];
  sampleInputs: string[];
}

export const AICoachTab: React.FC<AICoachTabProps> = ({
  user,
  aiMessages,
  onSendMessage,
  onClearHistory,
  isSending
}) => {
  const [inputText, setInputText] = useState('');
  const [activeAgentId, setActiveAgentId] = useState<string>('strategic');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // V5 Multi-agent spectrum lists
  const agents: AgentDefinition[] = [
    {
      id: 'strategic',
      name: 'Strategic Agent',
      role: 'Enterprise Alignment & OKR Controller',
      color: 'text-brand-purple border-brand-purple/20 bg-brand-purple/5',
      glow: 'shadow-[0_0_15px_rgba(157,78,221,0.15)] border-brand-purple/40',
      icon: Compass,
      objective: 'Align tactical sprints with corporate objectives, break down epics, and draft execution milestones.',
      capabilities: ['Corporate OKR Mapping', 'Sprint Roadmapping', 'Bottleneck Scoping'],
      sampleInputs: [
        "Align current active goals with short-term metrics.",
        "We need an orchestration rollout plan for CATALYX V5.",
        "Draft a 3-step timeline for launching our beta test."
      ]
    },
    {
      id: 'research',
      name: 'Research Agent',
      role: 'Deep Document & SOP Grounding Analyst',
      color: 'text-brand-cyan border-brand-cyan/20 bg-brand-cyan/5',
      glow: 'shadow-[0_0_15px_rgba(0,245,212,0.15)] border-brand-cyan/40',
      icon: BookOpen,
      objective: 'Search, extract, and ground decisions using standard company wikis, SOP documents, and spec sheets.',
      capabilities: ['SOP Chunk Synthesis', 'Metadata Extraction', 'Technical Specifications Audit'],
      sampleInputs: [
        "Summarize standard developer safety guidelines.",
        "Draft an onboarding SOP manual for junior team members.",
        "Synthesize PDF file upload architecture requirements."
      ]
    },
    {
      id: 'operations',
      name: 'Operations Agent',
      role: 'Queue Automation & Operational Optimizer',
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      glow: 'shadow-[0_0_15px_rgba(52,211,153,0.15)] border-emerald-400/40',
      icon: Sliders,
      objective: 'Configure visual automation builders, optimize backlog priority rules, and sanitize execution pipelines.',
      capabilities: ['Pipeline Sanitization', 'Priority Allocation', 'Automation Trigger Scripting'],
      sampleInputs: [
        "Identify active workspace delay hotspots.",
        "Propose visual automation rules for task-goal triggers.",
        "Recommend optimal prioritization weightings for my backlog."
      ]
    },
    {
      id: 'execution',
      name: 'Execution Agent',
      role: 'Action-First Discipline & Momentum Booster',
      color: 'text-brand-pink border-brand-pink/20 bg-brand-pink/5',
      glow: 'shadow-[0_0_15px_rgba(255,0,127,0.15)] border-brand-pink/40',
      icon: Zap,
      objective: 'Unblock analysis paralysis, provide micro-tasking recipes, and maximize personal complete rates.',
      capabilities: ['Dopamine Loop Generation', 'Focus Session Allocation', 'Anti-Procrastination Coaching'],
      sampleInputs: [
        "I feel stuck on designing interfaces today.",
        "Recommend a custom 15-minute high-momentum sprint.",
        "Bypass microtask fatigue with immediate actionable advice."
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics Agent',
      role: 'Cognitive Scoring & Twin Forecaster',
      color: 'text-[#4361ee] border-[#4361ee]/20 bg-[#4361ee]/5',
      glow: 'shadow-[0_0_15px_rgba(67,97,238,0.15)] border-[#4361ee]/40',
      icon: LineChart,
      objective: 'Audit consistency scores, analyze focus logs productivity coefficients, and forecast future delays.',
      capabilities: ['Predictive Delay Forecasting', 'Success Probability Modeling', 'Consistency Deviation Reports'],
      sampleInputs: [
        "Review my Digital Twin consistency trends.",
        "What is the mathematical definition behind focus metrics?",
        "Plot a performance delay coefficient chart."
      ]
    },
    {
      id: 'knowledge',
      name: 'Knowledge Agent',
      role: 'Institutional Memory & Vault Librarian',
      color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
      glow: 'shadow-[0_0_15px_rgba(251,191,36,0.15)] border-amber-400/40',
      icon: Database,
      objective: 'Structure scattered notes, write executive summaries of team chats, and manage the Knowledge Vault index.',
      capabilities: ['Knowledge Graph Structuring', 'Team Chat Summarization', 'Metadata Indexing'],
      sampleInputs: [
        "Organize my research idea notes logically.",
        "Extract core decisions from standard history records.",
        "Structure a knowledge vault index blueprint."
      ]
    },
    {
      id: 'innovation',
      name: 'Innovation Agent',
      role: 'Creative Ideation & Framework Strategist',
      color: 'text-fuchsia-400 border-fuchsia-500/20 bg-fuchsia-500/5',
      glow: 'shadow-[0_0_15px_rgba(232,121,249,0.15)] border-fuchsia-400/40',
      icon: Lightbulb,
      objective: 'Brainstorm creative designs, suggest template recipes, and draft futuristic scaling mechanisms.',
      capabilities: ['UX Design Ideation', 'Marketplace Publishing Guides', 'Future Scaling Strategies'],
      sampleInputs: [
        "Propose a cool execution badge for high-level levels.",
        "Brainstorm a bento-style design for personal workspaces.",
        "How should we structure and deploy template templates?"
      ]
    },
    {
      id: 'organization',
      name: 'Organization Agent',
      role: 'Department Core & KPI Coordinator',
      color: 'text-[#00f5d4] border-[#00f5d4]/20 bg-[#00f5d4]/5',
      glow: 'shadow-[0_0_15px_rgba(0,245,212,0.15)] border-[#00f5d4]/30',
      icon: Users,
      objective: 'Set cross-department KPIs, assign workspaces permissions, and coordinate department performance analytics.',
      capabilities: ['RBAC Mappings', 'Cross-Dept Alignment', 'Team Engagement Scoring'],
      sampleInputs: [
        "Set up permission hierarchies for workspace roles.",
        "Audit research department organizational structures.",
        "Configure manager KPIs for strategic sprints."
      ]
    },
    {
      id: 'financial',
      name: 'Financial Agent',
      role: 'SaaS Economics & Capacity Allocator',
      color: 'text-violet-400 border-violet-500/20 bg-violet-500/5',
      glow: 'shadow-[0_0_15px_rgba(167,139,250,0.15)] border-violet-400/30',
      icon: Coins,
      objective: 'Analyze pricing formulas, manage workspace seat limits, and optimize API consumption allocation.',
      capabilities: ['Subscription Utility Modeling', 'Unit-Cost Allocation', 'Quota Budget Auditing'],
      sampleInputs: [
        "Review professional tier vs enterprise features utility.",
        "Forecast monthly LLM API consumption cost structures.",
        "Map budget safety factors for cloud workloads."
      ]
    },
    {
      id: 'risk',
      name: 'Risk Agent',
      role: 'Burnout Guardian & Threat Audit Advisor',
      color: 'text-[#ff007f] border-[#ff007f]/20 bg-[#ff007f]/5',
      glow: 'shadow-[0_0_15px_rgba(255,0,127,0.15)] border-[#ff007f]/30',
      icon: ShieldAlert,
      objective: 'Audit burnout threats, flag streak risk delays, and coordinate proactive recovery triggers.',
      capabilities: ['Burnout Predictor', 'Streak Resilience Checks', 'Wellness Coaching Dispatch'],
      sampleInputs: [
        "Highlight active burnout indicators in my logs.",
        "Suggest streak protection measures for my account.",
        "Provide a list of instant mental recovery slots."
      ]
    }
  ];

  const currentAgent = agents.find(a => a.id === activeAgentId) || agents[0];

  // Consensus state machine simulation
  const [consensusStep, setConsensusStep] = useState<number>(0); // 0=none, 1..4=running, 5=result
  const [consensusPrompt, setConsensusPrompt] = useState<string>('');
  const [consensusMemo, setConsensusMemo] = useState<string>('');

  // Auto scroll to chat end
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, isSending, consensusStep]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;
    const msg = inputText.trim();
    setInputText('');
    await onSendMessage(msg, activeAgentId);
  };

  const selectPromptPill = async (text: string) => {
    if (isSending) return;
    await onSendMessage(text, activeAgentId);
  };

  // Run Consensus Sequence
  const runConsensusCycle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consensusPrompt.trim() || consensusStep > 0) return;

    setConsensusStep(1);
    
    // Step 1 -> Step 2
    setTimeout(() => {
      setConsensusStep(2);
    }, 1500);

    // Step 2 -> Step 3
    setTimeout(() => {
      setConsensusStep(3);
    }, 3000);

    // Step 3 -> Step 4
    setTimeout(() => {
      setConsensusStep(4);
    }, 4500);

    // Step 4 -> Complete consensus
    setTimeout(() => {
      setConsensusStep(5);
      const isST = consensusPrompt.toLowerCase().includes('database') || consensusPrompt.toLowerCase().includes('firebase');
      
      const plan = `### 🤝 CONVERGENT INTELLIGENCE MEMO (CATALYX V5)
**SUBJECT**: Optimization Consensus Strategy for "${consensusPrompt}"
**TIMESTAMP**: ${new Date().toISOString()}

#### 📈 EXECUTIVE CONSENSUS AGREEMENT:
1. **Strategic Agent (Alignment)**: This initiative anchors user Level ${user.level} goals. Creates immediate workspace epics in alignment with "Performance Index".
2. **Operations Agent (Optimization)**: Recommended checklist workflow:
   - Configure a custom Visual Automation rule (IF Task added -> update Goal index).
   - Partition operational milestones into 4 micro-tasks under High intensity.
3. **Risk Agent (Safety Boundary)**: Recommended execution frequency limits: Limit active work sessions to 45 mins. Secure streak protection indices before midnight.

#### 💡 MULTI-AGENT ADVICE:
*Establish this initiative within standard goals right now to unlock extra +30 XP.*`;
      setConsensusMemo(plan);
    }, 6000);
  };

  const resetConsensus = () => {
    setConsensusStep(0);
    setConsensusPrompt('');
    setConsensusMemo('');
  };

  const ActiveAgentIcon = currentAgent.icon;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-140px)] overflow-hidden" id="ai-coach-tab">
      
      {/* LEFT COLUMN: ADVANCED SPECTRAPLAN AGENT SELECTOR */}
      <div className="xl:col-span-1 glass-panel p-4 rounded-2xl flex flex-col justify-between overflow-y-auto h-full space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-brand-purple">
            <Network className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-mono tracking-wider font-semibold">MULTI-AGENT SPECTRUM V5</span>
          </div>
          
          <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
            Switch between specialized AI Agents inside the live execution network.
          </p>

          <div className="space-y-1.5 max-h-[310px] xl:max-h-[380px] overflow-y-auto pr-1">
            {agents.map((agent) => {
              const Icon = agent.icon;
              const isSelected = agent.id === activeAgentId;
              return (
                <button
                  key={agent.id}
                  onClick={() => {
                    setActiveAgentId(agent.id);
                    resetConsensus();
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all duration-300 flex items-center gap-2.5 cursor-pointer ${
                    isSelected 
                      ? `${agent.glow} ${agent.color} border-brand-purple` 
                      : 'bg-black/10 border-white/5 hover:bg-white/[0.02] text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-white/10' : 'bg-white/5'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">{agent.name}</div>
                    <div className="text-[10px] opacity-70 truncate uppercase font-mono">{agent.id} spectrum</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-Agent Consensus Trigger */}
        <div className="pt-3 border-t border-white/5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-[#00f5d4] font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AGENT AGREEMENT NETWORK</span>
          </div>
          
          {consensusStep === 0 ? (
            <form onSubmit={runConsensusCycle} className="space-y-1.5">
              <input
                type="text"
                required
                placeholder="Enter objective for consensus..."
                value={consensusPrompt}
                onChange={(e) => setConsensusPrompt(e.target.value)}
                className="w-full bg-slate-950/80 border border-white/10 rounded-lg p-2 text-xs text-gray-200 focus:outline-none focus:border-brand-cyan/50"
              />
              <button
                type="submit"
                className="w-full py-2 px-3 bg-gradient-to-r from-brand-purple to-brand-cyan text-white hover:opacity-95 rounded-lg font-mono text-[10px] font-bold tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md"
              >
                TRIGGER AGENT CONSENSUS
              </button>
            </form>
          ) : (
            <div className="bg-black/30 p-3 rounded-lg border border-white/5 space-y-2 text-xs">
              {consensusStep < 5 ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-[9px] font-mono text-gray-500">COGNITIVE STAGES</span>
                    <Bot className="w-3 h-3 text-brand-cyan animate-spin" />
                  </div>
                  <div className="text-[10px] text-gray-300 font-mono leading-relaxed">
                    {consensusStep === 1 && "1. Strategic Agent establishing epic timelines..."}
                    {consensusStep === 2 && "2. Operations Agent appending SOP indices..."}
                    {consensusStep === 3 && "3. Risk Agent checking burnout probability coefficients..."}
                    {consensusStep === 4 && "4. Generating convergent operational advice..."}
                  </div>
                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden p-[1px]">
                    <div 
                      className="bg-gradient-to-r from-brand-purple to-brand-cyan h-full rounded-full transition-all duration-300" 
                      style={{ width: `${(consensusStep / 4) * 100}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-[140px] overflow-y-auto font-mono text-[9px] text-gray-300 leading-normal scrollbar-none whitespace-pre-wrap">
                  {consensusMemo}
                  <button
                    onClick={resetConsensus}
                    className="w-full mt-2 py-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded text-[8px] font-bold"
                  >
                    DISMISS REPORT
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT 3/4 COLUMNS: SYSTEM MESSENGER & AGENT SPECS */}
      <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        
        {/* CENTER COLUMN: LIVE CHAT TERMINAL PANEL */}
        <div className="lg:col-span-2 glass-panel rounded-2xl flex flex-col justify-between overflow-hidden h-full">
          {/* Chat Header */}
          <div className="border-b border-white/5 px-4 py-3 flex justify-between items-center bg-slate-950/20 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple shrink-0">
                <ActiveAgentIcon className="w-4.5 h-4.5 text-brand-purple animate-pulse" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-semibold text-white flex items-center gap-1">
                  {currentAgent.name}
                </h3>
                <p className="text-[9px] text-[#00f5d4] font-mono truncate uppercase">
                  {currentAgent.role}
                </p>
              </div>
            </div>

            <button
              onClick={onClearHistory}
              className="p-1.5 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-lg text-red-400 transition-colors cursor-pointer"
              title="Recycle Chat logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages Feed View */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {aiMessages.map((msg) => {
              const isAI = msg.role === 'ai';
              return (
                <div 
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[90%] ${isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                    isAI 
                      ? 'bg-brand-purple/10 border border-brand-purple/20 text-brand-purple' 
                      : 'bg-brand-cyan/10 border border-brand-cyan/20 text-[#00f5d4]'
                  }`}>
                    {isAI ? <ActiveAgentIcon className="w-3.5 h-3.5" /> : 'EX'}
                  </div>

                  <div className={`p-3 rounded-xl border leading-relaxed text-xs shadow-sm ${
                    isAI 
                      ? 'bg-slate-900/40 border-white/5 text-gray-200' 
                      : 'bg-brand-purple/10 border-brand-purple/20 text-white'
                  }`}>
                    <div className="whitespace-pre-wrap font-sans font-normal text-gray-200">
                      {msg.message}
                    </div>
                    <span className="text-[8px] font-mono text-gray-500 block text-right mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Simulated sending block */}
            {isSending && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto">
                <div className="w-7 h-7 rounded-lg bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple shrink-0">
                  <ActiveAgentIcon className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3 bg-slate-900/40 border border-white/5 rounded-xl flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-brand-purple animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 rounded-full bg-brand-pink animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[10px] text-gray-400 font-mono ml-1.5">Agent processing telemetry...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick directives pills */}
          {aiMessages.length <= 1 && (
            <div className="px-4 py-1.5 shrink-0">
              <span className="text-[9px] font-mono text-gray-500 block mb-1.5 uppercase">SUGGESTED INTEL PARAMETERS:</span>
              <div className="flex flex-wrap gap-1.5">
                {currentAgent.sampleInputs.map((pill, i) => (
                  <button
                    key={i}
                    disabled={isSending}
                    onClick={() => selectPromptPill(pill)}
                    className="px-2 py-1 bg-white/5 hover:bg-brand-purple/10 border border-white/5 rounded-lg text-[10px] text-brand-cyan transition-colors hover:border-brand-purple/40 text-left cursor-pointer"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Box Form */}
          <div className="border-t border-white/5 p-4 bg-slate-950/20 shrink-0">
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isSending}
                placeholder={`Instruct the ${currentAgent.name}...`}
                className="flex-1 bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/50 transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="py-2.5 px-4 bg-gradient-to-r from-brand-purple to-brand-cyan text-white hover:opacity-95 rounded-xl font-semibold text-xs flex items-center gap-1 active:scale-[0.98] transition-all disabled:opacity-35 disabled:scale-100 cursor-pointer shadow-md"
              >
                <span>SEND</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
            <div className="flex justify-between items-center text-[9px] font-mono text-gray-500 mt-1.5">
              <span>ACTIVE ROUTE: AGENTS/{currentAgent.id.toUpperCase()}</span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-2.5 h-2.5 text-brand-cyan" /> Secure military compliance telemetry
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AGENT PROFILE & CAPABILITIES MATRIX */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between overflow-y-auto h-full space-y-4">
          <div className="space-y-4">
            <div className="text-center p-3.5 bg-white/5 border border-white/5 rounded-xl">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-purple to-brand-cyan flex items-center justify-center text-white font-display mx-auto mb-2.5 text-lg shadow-md font-bold">
                V5
              </div>
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">{currentAgent.name}</h3>
              <span className="text-[9px] font-mono text-[#00f5d4] block">SPECTRUM ALIAS ID: {currentAgent.id.toUpperCase()}</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-gray-500 uppercase block">CORE OBJECTIVE</span>
                <p className="text-xs text-gray-300 leading-normal pl-2.5 border-l-2 border-brand-purple">
                  {currentAgent.objective}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-mono text-gray-500 uppercase block">SYSTEM CAPABILITIES</span>
                <ul className="space-y-1.5 pl-1">
                  {currentAgent.capabilities.map((c, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-xs text-gray-400 font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-3 bg-black/20 rounded-lg space-y-1.5 text-[10px]">
              <span className="text-[9px] font-mono text-gray-500 uppercase block">INTELLIGENCE MEMORY MATRIX</span>
              <div className="flex justify-between font-mono text-gray-400">
                <span>Active executive:</span>
                <span className="text-brand-purple font-medium">{user.username}</span>
              </div>
              <div className="flex justify-between font-mono text-gray-400">
                <span>Performance:</span>
                <span className="text-brand-pink font-medium">{user.executionScore}%</span>
              </div>
              <div className="flex justify-between font-mono text-gray-400">
                <span>Consist level:</span>
                <span className="text-brand-cyan font-medium">Level {user.level}</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-gray-500 bg-slate-900/10 border border-white/5 p-2.5 rounded-xl leading-normal font-sans">
            CATALYX V5 multi-agents run on recursive micro-grounding loops. Memory variables are automatically isolated using FireStore security boundaries.
          </div>
        </div>

      </div>

    </div>
  );
};
