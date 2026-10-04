import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  microsoftIntegrationService, MicrosoftAccountConnection, OneDriveItem 
} from '../../services/microsoftIntegrationService';
import { 
  X, CheckCircle2, AlertCircle, FileText, Download, 
  ExternalLink, Unplug, ShieldCheck, RefreshCw, Folder, Sparkles
} from 'lucide-react';

interface MicrosoftIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MicrosoftIntegrationModal: React.FC<MicrosoftIntegrationModalProps> = ({ isOpen, onClose }) => {
  const [connection, setConnection] = useState<MicrosoftAccountConnection>({ connected: false, scopes: [] });
  const [items, setItems] = useState<OneDriveItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'onedrive' | 'settings'>('onedrive');
  const [handoffNotice, setHandoffNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  const loadStatus = async () => {
    setIsLoading(true);
    const conn = await microsoftIntegrationService.getConnectionStatus();
    setConnection(conn);
    const res = await microsoftIntegrationService.browseOneDrive();
    if (res.success) {
      setItems(res.items);
    }
    setIsLoading(false);
  };

  const handleConnect = async () => {
    if (connection.enabled === false) {
      setHandoffNotice('Microsoft 365 connection is temporarily disabled awaiting Azure credentials.');
      setTimeout(() => setHandoffNotice(null), 4000);
      return;
    }
    setIsLoading(true);
    const res = await microsoftIntegrationService.connectMicrosoftAccount();
    if (res.success && res.authUrl) {
      window.location.href = res.authUrl;
    } else if (res.message) {
      setHandoffNotice(res.message);
      setTimeout(() => setHandoffNotice(null), 4000);
    }
    setIsLoading(false);
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    await microsoftIntegrationService.disconnectMicrosoftAccount();
    await loadStatus();
    setIsLoading(false);
  };

  const handleLaunchProtocol = (item: OneDriveItem) => {
    const type = item.officeType || 'word';
    if (type === 'generic') return;

    setHandoffNotice(`Dispatching ms-${type}: desktop protocol handoff...`);
    microsoftIntegrationService.launchOfficeDesktopHandoff({
      officeType: type,
      fileUrl: item.downloadUrl || item.webUrl,
      fileName: item.name,
      onFallback: () => {
        setHandoffNotice(`Desktop protocol launched. If Office desktop is uninstalled, use OneDrive Web.`);
        setTimeout(() => setHandoffNotice(null), 4000);
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
              M
            </div>
            <div>
              <h2 className="text-base font-display font-bold text-white">Microsoft 365 & OneDrive Ecosystem</h2>
              <p className="text-xs text-gray-400">Word, Excel, PowerPoint & OneDrive Graph Protocol Integration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-5 py-3 bg-slate-950/50 border-b border-white/5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${
              connection.connected 
                ? 'bg-emerald-400' 
                : connection.enabled === false 
                  ? 'bg-amber-400/80' 
                  : 'bg-slate-400'
            }`}></span>
            <span className="text-gray-300">
              {connection.connected 
                ? `Connected (${connection.userPrincipalName || 'Tenant Account'})` 
                : connection.enabled === false
                  ? 'Microsoft 365 integration temporarily disabled.'
                  : 'Microsoft 365 connection unavailable until integration is enabled.'}
            </span>
          </div>

          {connection.connected ? (
            <button
              onClick={handleDisconnect}
              disabled={isLoading}
              className="text-red-400 hover:text-red-300 flex items-center gap-1.5 cursor-pointer text-[11px]"
            >
              <Unplug className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          ) : connection.enabled === false ? (
            <div className="flex items-center gap-1.5 text-gray-500 text-[11px] font-mono">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500/70" />
              <span>Azure Credentials Pending</span>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="text-brand-cyan hover:underline flex items-center gap-1.5 cursor-pointer text-[11px]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Connect Microsoft Account</span>
            </button>
          )}
        </div>

        {/* Disabled Notice Banner */}
        {connection.enabled === false && (
          <div className="mx-5 mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs font-mono flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-semibold text-amber-300">Microsoft 365 Integration Temporarily Disabled</div>
              <p className="text-[11px] text-amber-200/80 leading-relaxed font-sans">
                Azure credentials (<code className="font-mono text-amber-200">MICROSOFT_CLIENT_ID</code>, <code className="font-mono text-amber-200">MICROSOFT_CLIENT_SECRET</code>, <code className="font-mono text-amber-200">MICROSOFT_TENANT_ID</code>) are pending configuration. The complete integration and OpenXML adapters are preserved and will reactivate once credentials are provided.
              </p>
            </div>
          </div>
        )}

        {handoffNotice && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>{handoffNotice}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Permitted OneDrive Resources</h3>
            <button
              onClick={loadStatus}
              className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-2">
            {items.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950/40 border border-white/5 text-center text-xs font-mono text-gray-400 space-y-2">
                <Folder className="w-8 h-8 text-gray-600 mx-auto" />
                <p>
                  {connection.enabled === false 
                    ? 'OneDrive remote synchronization is temporarily disabled awaiting Microsoft activation.' 
                    : 'No OneDrive documents discovered in current workspace.'}
                </p>
                <p className="text-[11px] text-gray-500 font-sans">
                  Local sovereign OpenXML generation engines (Word, Excel, PowerPoint) remain active and fully functional.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-white/5 hover:border-white/15 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      item.officeType === 'word' ? 'bg-blue-500/10 text-blue-400' :
                      item.officeType === 'excel' ? 'bg-emerald-500/10 text-emerald-400' :
                      item.officeType === 'powerpoint' ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400'
                    }`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-white">{item.name}</div>
                      <div className="text-[10px] font-mono text-gray-400">
                        {(item.size / 1024).toFixed(1)} KB • Modified {new Date(item.lastModifiedDateTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.officeType && item.officeType !== 'generic' && (
                      <button
                        onClick={() => handleLaunchProtocol(item)}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Direct desktop handoff via ms-protocol"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open in {item.officeType === 'word' ? 'Word' : item.officeType === 'excel' ? 'Excel' : 'PowerPoint'}</span>
                      </button>
                    )}
                    <a
                      href={item.webUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                      title="View in OneDrive Web"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Architecture Verification Footnote */}
          <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-white/10 text-xs space-y-2">
            <div className="flex items-center gap-2 font-mono text-brand-purple text-[11px] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>SOVEREIGN ARCHITECTURE & SECURITY GUARANTEE</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Microsoft Graph permissions are strictly scoped to user-authorized document read/write. 
              Desktop handoff adheres to registered URI schemes (<code className="text-gray-300">ms-word:</code>, <code className="text-gray-300">ms-excel:</code>, <code className="text-gray-300">ms-powerpoint:</code>) with automated web download fallback.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
