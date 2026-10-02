import React, { useState } from 'react';
import { 
  Plug, CheckCircle2, RefreshCw, Lock, ExternalLink 
} from 'lucide-react';
import { IntegrationConnection } from '../types';
import { IntegrationService } from '../services/integrationService';
import { MicrosoftIntegrationModal } from './integrations/MicrosoftIntegrationModal';

interface Props {
  orgId: string;
}

export const IntegrationsTab: React.FC<Props> = ({ orgId }) => {
  const [integrations, setIntegrations] = useState<IntegrationConnection[]>(() => 
    IntegrationService.getIntegrations(orgId)
  );
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; latencyMs: number; message: string } | null>(null);
  const [isMicrosoftModalOpen, setIsMicrosoftModalOpen] = useState(false);

  const handleTestConnection = async (integrationId: string) => {
    setTestingId(integrationId);
    setTestResult(null);

    try {
      const result = await IntegrationService.testConnection(orgId, integrationId);
      setTestResult({
        id: integrationId,
        latencyMs: result.latencyMs,
        message: result.message,
      });
      setIntegrations(IntegrationService.getIntegrations(orgId));
    } catch (e: any) {
      setTestResult({
        id: integrationId,
        latencyMs: 0,
        message: 'Connection failed or timed out.',
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleToggle = (integration: IntegrationConnection) => {
    const nextStatus = integration.status === 'connected' ? 'disconnected' : 'connected';
    const nextHealth = nextStatus === 'connected' ? 'healthy' : 'offline';
    IntegrationService.updateStatus(orgId, integration.id, nextStatus, nextHealth);
    setIntegrations(IntegrationService.getIntegrations(orgId));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-brand-purple/20 text-purple-300 border border-brand-purple/30">
              Enterprise Connector Mesh
            </span>
            <span className="text-xs text-gray-400 font-medium">Server-Side Masked Credentials</span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">Enterprise System Integrations</h2>
          <p className="text-sm text-gray-400">
            Securely bridge CATALYX autonomous workforce with corporate tools, repositories, and transactional databases.
          </p>
        </div>

        <button
          onClick={() => setIsMicrosoftModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/20"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Launch Microsoft 365 & OneDrive Bridge</span>
        </button>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map(conn => {
          const isConnected = conn.status === 'connected';
          const isTesting = testingId === conn.id;
          const result = testResult?.id === conn.id ? testResult : null;

          return (
            <div
              key={conn.id}
              className={`rounded-xl border p-6 shadow-lg flex flex-col justify-between space-y-4 backdrop-blur-md transition ${
                isConnected
                  ? 'bg-slate-900/70 border-white/10'
                  : 'bg-slate-900/40 border-white/5 opacity-75'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-brand-purple/20 border border-brand-purple/30 text-purple-300 flex items-center justify-center font-bold text-sm">
                      <Plug className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{conn.name}</h4>
                      <span className="text-[10px] uppercase font-bold text-gray-400">{conn.category}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    conn.health === 'healthy' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : conn.health === 'degraded' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}>
                    {conn.status}
                  </span>
                </div>

                {/* Masked Credentials Display (Prevent Secret Leakage) */}
                <div className="p-2.5 bg-slate-950/70 rounded-lg border border-white/10 space-y-1 font-mono text-[11px] text-gray-300">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="flex items-center gap-1 font-sans text-[10px] font-semibold uppercase">
                      <Lock className="w-3 h-3" /> Encrypted Credentials
                    </span>
                    <span className="text-[10px]">AES-256</span>
                  </div>
                  {Object.entries(conn.configMasked).map(([k, v]) => (
                    <div key={k} className="truncate">
                      {k}: <span className="text-brand-cyan">{String(v)}</span>
                    </div>
                  ))}
                </div>

                {/* Diagnostics / Test Result */}
                {result && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Ping Successful
                      </span>
                      <span className="font-mono text-[11px]">{result.latencyMs}ms</span>
                    </div>
                    <p className="text-[11px] text-emerald-200">{result.message}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggle(conn)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                    isConnected
                      ? 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
                      : 'bg-brand-purple/20 text-purple-300 border-brand-purple/30 hover:bg-brand-purple/30'
                  }`}
                >
                  {isConnected ? 'Disconnect' : 'Connect'}
                </button>

                <button
                  onClick={() => handleTestConnection(conn.id)}
                  disabled={isTesting || !isConnected}
                  className="text-xs font-semibold px-3 py-1.5 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition flex items-center gap-1.5 disabled:opacity-40 shadow-md cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <MicrosoftIntegrationModal
        isOpen={isMicrosoftModalOpen}
        onClose={() => setIsMicrosoftModalOpen(false)}
      />
    </div>
  );
};
