import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Network, Database, Sparkles, Brain, CheckCircle, HelpCircle, GitCommit, FileText } from 'lucide-react';

interface ElementNode {
  id: string;
  label: string;
  category: 'user' | 'agent' | 'doc' | 'goal' | 'project';
  desc: string;
  metric: string;
  connections: string[];
}

export const KnowledgeGraphVisualizer: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<string>('profile');

  const nodes: ElementNode[] = [
    {
      id: 'profile',
      label: 'Core Cognitive Identity',
      category: 'user',
      desc: 'Central anchor node representing execution velocity, level ratings, consistency metrics, and general XP compliance.',
      metric: 'Level 1 Core',
      connections: ['engine', 'goals']
    },
    {
      id: 'engine',
      label: 'Multi-Agent Network Core',
      category: 'agent',
      desc: 'Orchestration layer connecting 10 specialized intelligence agents (Strategic, Operations, Risk, etc.) running recursive micro-grounding loops.',
      metric: '10 Agents Live',
      connections: ['profile', 'docs']
    },
    {
      id: 'docs',
      label: 'Institutional SOP Storage',
      category: 'doc',
      desc: 'Standard operating indices, specification files, uploaded manuals, and meeting transcripts within the global Knowledge Vault.',
      metric: '8 SOPs Ingested',
      connections: ['engine', 'projects']
    },
    {
      id: 'goals',
      label: 'Strategic Objectives',
      category: 'goal',
      desc: 'Ambitious short-term tactical sprints and long-term business visions managed in the Goal Center.',
      metric: '92% Alignment',
      connections: ['profile', 'projects']
    },
    {
      id: 'projects',
      label: 'Active Sprint Initiatives',
      category: 'project',
      desc: 'Collaborative development workspaces, project kanbans, checklist dependencies, and team velocity indicators.',
      metric: '4 Sprints Live',
      connections: ['goals', 'docs']
    }
  ];

  const activeNode = nodes.find(n => n.id === selectedNode) || nodes[0];

  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'user': return 'text-brand-purple border-brand-purple/30 bg-brand-purple/10';
      case 'agent': return 'text-brand-cyan border-brand-cyan/30 bg-brand-cyan/10';
      case 'doc': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'goal': return 'text-[#00f5d4] border-[#00f5d4]/30 bg-[#00f5d4]/10';
      case 'project': return 'text-brand-pink border-brand-pink/30 bg-brand-pink/10';
      default: return 'text-gray-400 border-white/5 bg-white/5';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4" id="knowledge-graph-visualizer">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center">
        <div>
          <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest text-brand-cyan border border-brand-cyan/25 bg-brand-cyan/5 rounded-full uppercase">
            MODULE 5: GLOBAL KNOWLEDGE GRAPH
          </span>
          <h3 className="text-lg font-display font-semibold text-white mt-1.5 flex items-center gap-1.5">
            <Network className="w-5 h-5 text-brand-cyan animate-pulse" />
            Global Knowledge Graph Engine
          </h3>
          <p className="text-xs text-gray-400">
            Interactive visual network tracking dependencies, information resources, and execution goals.
          </p>
        </div>

        <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded">
          STATUS: SEED SYNCHRONIZED
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
        
        {/* NETWORK VECTOR FLOW MAP */}
        <div className="lg:col-span-3 p-4 bg-black/30 rounded-2xl border border-white/5 relative h-64 flex flex-col justify-between overflow-hidden select-none">
          <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10 pointer-events-none" />
          
          <div className="relative z-10 flex h-full items-center justify-around">
            {nodes.map((node, index) => {
              const isSelected = node.id === selectedNode;
              const isConnectedAndHighlighted = activeNode.connections.includes(node.id) || isSelected;
              
              return (
                <div key={node.id} className="relative flex flex-col items-center">
                  
                  {/* Connection Line */}
                  {index < nodes.length - 1 && (
                    <div className="absolute left-1/2 w-32 h-0.5 transform -translate-y-1/2 bg-gradient-to-r from-brand-cyan/10 to-brand-purple/15 pointer-events-none mt-5" />
                  )}

                  <button
                    onClick={() => setSelectedNode(node.id)}
                    className={`w-11 h-11 rounded-full border transition-all duration-300 flex items-center justify-center relative cursor-pointer z-10 ${
                      isSelected 
                        ? 'bg-gradient-to-tr from-brand-purple to-brand-cyan text-white shadow-[0_0_15px_rgba(0,245,212,0.3)] border-brand-cyan' 
                        : isConnectedAndHighlighted
                          ? 'bg-slate-900 border-white/20 text-brand-cyan'
                          : 'bg-black/40 border-white/5 text-gray-600 hover:border-white/15'
                    }`}
                  >
                    {node.category === 'user' && <Brain className="w-4 h-4 animate-pulse" />}
                    {node.category === 'agent' && <Database className="w-4 h-4" />}
                    {node.category === 'doc' && <FileText className="w-4 h-4" />}
                    {node.category === 'goal' && <GitCommit className="w-4 h-4" />}
                    {node.category === 'project' && <CheckCircle className="w-4 h-4" />}
                  </button>

                  <span className={`text-[9px] font-mono mt-2 uppercase text-center transition-colors max-w-[80px] break-words ${
                    isSelected ? 'text-brand-cyan font-bold' : isConnectedAndHighlighted ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {node.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-[9px] font-mono text-gray-500 py-1 border-t border-white/5 flex justify-between">
            <span>NETWORK CHANNELS: ACTIVE</span>
            <span>CLICK TO INSPECT DIRECT DEPENDENCY RELATIONS</span>
          </div>
        </div>

        {/* NODE INFORMATION DISCOVERY */}
        <div className="lg:col-span-2 bg-slate-950/20 border border-white/5 p-5 rounded-2xl h-full flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNode.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className={`px-2 py-0.5 text-[8px] font-mono rounded border uppercase ${getCategoryTheme(activeNode.category)}`}>
                    CATEGORY: {activeNode.category.toUpperCase()}
                  </span>
                  <h4 className="text-sm font-semibold text-white mt-1.5">{activeNode.label}</h4>
                </div>
                <span className="text-xs font-mono font-bold text-brand-cyan">{activeNode.metric}</span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed font-sans">
                {activeNode.desc}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <span className="text-[9px] font-mono text-gray-500 uppercase block">CONNECTED NODE EDGES:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeNode.connections.map(cId => {
                    const connNode = nodes.find(n => n.id === cId);
                    return (
                      <span 
                        key={cId}
                        className="px-2 py-0.5 bg-white/5 border border-white/5 text-[9px] font-mono text-brand-purple rounded"
                      >
                        ➜ {connNode?.label || cId}
                      </span>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="pt-4 border-t border-white/5 mt-4 text-[10px] text-gray-500 font-sans leading-normal">
            CATALYX Knowledge Graph runs real-time entity extraction parsing indices, identifying structural gaps in workflows automatically.
          </div>
        </div>

      </div>

    </div>
  );
};
