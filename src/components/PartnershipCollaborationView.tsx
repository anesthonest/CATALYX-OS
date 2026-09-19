import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Presentation, 
  Play, 
  Calendar, 
  Briefcase, 
  Users, 
  Award, 
  ArrowUpRight, 
  X, 
  Check, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Lock
} from 'lucide-react';
import { 
  PartnerProfile, 
  PartnerType, 
  PartnershipStatus, 
  PartnerDeliverable 
} from '../types';
import { partnershipService } from '../services/partnershipService';
import { universalWorkService } from '../services/universalWorkService';
import { presentationsService } from '../services/presentationsService';
import { demosService } from '../services/demosService';
import { meetingsService } from '../services/meetingsService';
import { filesVaultService } from '../services/filesVaultService';

interface PartnershipCollaborationViewProps {
  user: { uid: string; email: string; username: string };
  activeRole: string;
  onNavigate: (tabId: string, itemId?: string) => void;
}

export const PartnershipCollaborationView: React.FC<PartnershipCollaborationViewProps> = ({
  user,
  onNavigate
}) => {
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PartnerType | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<PartnershipStatus | 'ALL'>('ALL');

  const [selectedPartner, setSelectedPartner] = useState<PartnerProfile | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'overview' | 'deliverables' | 'agreements' | 'artifacts'>('overview');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // New Partner Form State
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<PartnerType>('STRATEGIC_PARTNER');
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [newTerms, setNewTerms] = useState('');
  const [newObjective, setNewObjective] = useState('');

  // Quick Action in Inspector
  const [newDeliverableName, setNewDeliverableName] = useState('');
  const [newDeliverableDesc, setNewDeliverableDesc] = useState('');
  const [quickActionTitle, setQuickActionTitle] = useState('');
  const [quickApprovalTopic, setQuickApprovalTopic] = useState('');

  const refreshPartners = () => {
    const list = partnershipService.getAllPartners({
      type: typeFilter,
      status: statusFilter,
      search: searchQuery
    });
    setPartners(list);
    if (selectedPartner) {
      const updated = partnershipService.getPartnerById(selectedPartner.id);
      if (updated) setSelectedPartner(updated);
    }
  };

  useEffect(() => {
    refreshPartners();
  }, [typeFilter, statusFilter, searchQuery]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreatePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const created = partnershipService.createPartnerProfile({
      name: newName.trim(),
      partnerType: newType,
      primaryContact: {
        name: newContactName.trim() || 'Partner Lead',
        email: newContactEmail.trim() || 'lead@partner.org',
        role: newContactRole.trim() || 'Alliance Director'
      },
      status: 'PROPOSAL',
      agreedTermsSummary: newTerms.trim(),
      sharedObjectives: newObjective.trim() ? [newObjective.trim()] : []
    }, user.email);

    setIsCreateModalOpen(false);
    setNewName('');
    setNewContactName('');
    setNewContactEmail('');
    setNewContactRole('');
    setNewTerms('');
    setNewObjective('');
    refreshPartners();
    setSelectedPartner(created);
    showNotification(`Registered partnership proposal: "${created.name}"`);
  };

  const handleAddDeliverable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner || !newDeliverableName.trim()) return;

    partnershipService.addDeliverable(selectedPartner.id, {
      name: newDeliverableName.trim(),
      description: newDeliverableDesc.trim(),
      dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      owner: user.email,
      status: 'PENDING'
    }, user.email);

    setNewDeliverableName('');
    setNewDeliverableDesc('');
    refreshPartners();
    showNotification('Deliverable registered for joint review');
  };

  const handleUpdateDeliverable = (deliverableId: string, status: PartnerDeliverable['status']) => {
    if (!selectedPartner) return;
    partnershipService.updateDeliverableStatus(selectedPartner.id, deliverableId, status, user.email);
    refreshPartners();
    showNotification(`Deliverable status updated to ${status}`);
  };

  const handleSignAgreement = (agreementId: string) => {
    if (!selectedPartner) return;
    partnershipService.signAgreement(selectedPartner.id, agreementId, user.email);
    refreshPartners();
    showNotification('Agreement digitally signed and recorded in audit log');
  };

  const handleAddActionItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner || !quickActionTitle.trim()) return;

    partnershipService.addActionItem(
      selectedPartner.id,
      quickActionTitle.trim(),
      selectedPartner.primaryContact.name,
      new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      user.email
    );
    setQuickActionTitle('');
    refreshPartners();
    showNotification('Action item assigned to partner');
  };

  const handleToggleActionItem = (actionId: string) => {
    if (!selectedPartner) return;
    partnershipService.toggleActionItem(selectedPartner.id, actionId, user.email);
    refreshPartners();
    showNotification('Action item status toggled');
  };

  const handleAddApproval = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner || !quickApprovalTopic.trim()) return;

    partnershipService.addJointApproval(
      selectedPartner.id,
      quickApprovalTopic.trim(),
      'APPROVED',
      user.email
    );
    setQuickApprovalTopic('');
    refreshPartners();
    showNotification('Bilateral approval ratified and logged');
  };

  // Stats
  const activeAlliances = partners.filter(p => p.status === 'ACTIVE').length;
  const proposalAlliances = partners.filter(p => p.status === 'PROPOSAL').length;
  const totalAgreements = partners.reduce((sum, p) => sum + p.agreements.filter(a => a.signed).length, 0);
  const totalDeliverables = partners.reduce((sum, p) => sum + p.deliverables.length, 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-cyan/20 border border-brand-cyan/50 text-brand-cyan px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-[#0f172a]/80 border border-gray-800 p-6 rounded-2xl relative overflow-hidden backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                V25 INSTITUTIONAL FEDERATION
              </span>
              <span className="text-xs text-gray-400">Cross-Organization & Strategic Alliances</span>
            </div>
            <h1 className="text-2xl font-display font-semibold text-white tracking-tight">
              Partnership & Alliances Workspace
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-2xl">
              Collaborative hub for bilateral partnerships, shared deliverables, joint governance, signed agreements, and cross-organization projects with strict tenant isolation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('universal-work')}
              className="px-4 py-2.5 rounded-xl border border-gray-700 bg-gray-800/80 hover:bg-gray-800 text-gray-200 text-xs font-medium transition flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-brand-purple" />
              <span>Universal Work Hub</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-cyan hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-brand-purple/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Register Partner / Proposal</span>
            </button>
          </div>
        </div>

        {/* Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-800/80">
          <div className="bg-gray-900/60 border border-gray-800 p-3 rounded-xl">
            <div className="text-xs text-gray-400">Active Alliances</div>
            <div className="text-xl font-display font-semibold text-brand-cyan mt-1">{activeAlliances}</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 p-3 rounded-xl">
            <div className="text-xs text-gray-400">Proposals Under Review</div>
            <div className="text-xl font-display font-semibold text-amber-400 mt-1">{proposalAlliances}</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 p-3 rounded-xl">
            <div className="text-xs text-gray-400">Signed Master Agreements</div>
            <div className="text-xl font-display font-semibold text-emerald-400 mt-1">{totalAgreements}</div>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 p-3 rounded-xl">
            <div className="text-xs text-gray-400">Audited Deliverables</div>
            <div className="text-xl font-display font-semibold text-purple-400 mt-1">{totalDeliverables}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a]/60 border border-gray-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search partners, contacts, terms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-900/80 border border-gray-700/80 rounded-lg text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-cyan transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-gray-900/80 border border-gray-700/80 text-xs text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-cyan"
            >
              <option value="ALL">All Types</option>
              <option value="STRATEGIC_PARTNER">Strategic Partner</option>
              <option value="INSTITUTION">Institution</option>
              <option value="INVESTOR">Investor</option>
              <option value="SUPPLIER">Supplier</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-gray-900/80 border border-gray-700/80 text-xs text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-brand-cyan"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PROPOSAL">Proposal</option>
              <option value="NEGOTIATION">Negotiation</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Partner Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {partners.map(p => {
          const acceptedDelivs = p.deliverables.filter(d => d.status === 'ACCEPTED').length;
          const totalDelivs = p.deliverables.length;

          return (
            <div 
              key={p.id}
              className="bg-[#0f172a]/70 border border-gray-800 hover:border-gray-700 p-5 rounded-2xl flex flex-col justify-between transition group shadow-sm"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-gray-800 text-brand-purple border border-brand-purple/20">
                    {p.partnerType.replace(/_/g, ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    p.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    p.status === 'PROPOSAL' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {p.status}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white group-hover:text-brand-cyan transition">
                  {p.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {p.agreedTermsSummary}
                </p>

                {/* Primary Contact */}
                <div className="mt-4 p-3 rounded-xl bg-gray-900/60 border border-gray-800 text-xs">
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider">Primary Alliance Contact</div>
                  <div className="text-gray-200 font-semibold mt-0.5">{p.primaryContact.name}</div>
                  <div className="text-gray-400 text-[11px] truncate">{p.primaryContact.email} • {p.primaryContact.role}</div>
                </div>

                {/* Deliverables summary */}
                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <span>Deliverables Audited</span>
                  <span className="font-mono text-gray-200">{acceptedDelivs} of {totalDelivs} accepted</span>
                </div>

                {/* Shared Artifact Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-gray-800/80">
                  {p.sharedWorkObjectIds.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px] text-gray-300 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-brand-purple" />
                      <span>{p.sharedWorkObjectIds.length} Work</span>
                    </span>
                  )}
                  {p.sharedPresentationIds.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px] text-gray-300 flex items-center gap-1">
                      <Presentation className="w-3 h-3 text-purple-400" />
                      <span>{p.sharedPresentationIds.length} Deck</span>
                    </span>
                  )}
                  {p.sharedMeetingIds.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px] text-gray-300 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-brand-cyan" />
                      <span>{p.sharedMeetingIds.length} Meet</span>
                    </span>
                  )}
                  {p.agreements.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/50 text-[10px] text-emerald-300 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{p.agreements.length} Agreement</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-gray-800/80 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono">
                  Since {new Date(p.startDate).toLocaleDateString()}
                </span>
                <button
                  onClick={() => {
                    setSelectedPartner(p);
                    setInspectorTab('overview');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium transition flex items-center gap-1"
                >
                  <span>Dossier</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* INSPECTOR DOSSIER MODAL */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-2xl bg-[#0b1120] border-l border-gray-800 h-full flex flex-col justify-between overflow-hidden shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">
                    {selectedPartner.partnerType}
                  </span>
                  <span className="text-xs text-gray-400">Tenant: {selectedPartner.tenantId}</span>
                </div>
                <h2 className="text-xl font-display font-semibold text-white">
                  {selectedPartner.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedPartner(null)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Nav */}
            <div className="flex items-center border-b border-gray-800 px-6 gap-2 overflow-x-auto bg-gray-900/40">
              {[
                { id: 'overview', label: 'Overview & Objectives' },
                { id: 'deliverables', label: `Deliverables (${selectedPartner.deliverables.length})` },
                { id: 'agreements', label: `Agreements & Approvals (${selectedPartner.agreements.length})` },
                { id: 'artifacts', label: 'Shared Work & Artifacts' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setInspectorTab(tab.id as any)}
                  className={`py-3 px-3 text-xs font-medium border-b-2 transition whitespace-nowrap ${
                    inspectorTab === tab.id
                      ? 'border-brand-purple text-brand-purple'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {inspectorTab === 'overview' && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Terms of Strategic Alliance</h4>
                    <p className="text-sm text-gray-200 leading-relaxed bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                      {selectedPartner.agreedTermsSummary}
                    </p>
                  </div>

                  {/* Shared Objectives */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Bilateral Strategic Objectives</h4>
                    <div className="space-y-2">
                      {selectedPartner.sharedObjectives.map((obj, i) => (
                        <div key={i} className="p-3 rounded-xl bg-gray-900/40 border border-gray-800 flex items-center gap-3 text-xs text-gray-200">
                          <CheckCircle2 className="w-4 h-4 text-brand-cyan flex-shrink-0" />
                          <span>{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Responsibilities */}
                  {selectedPartner.responsibilities.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Division of Responsibilities</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedPartner.responsibilities.map((r, i) => (
                          <div key={i} className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 space-y-2">
                            <div className="text-xs font-semibold text-brand-purple">{r.partnerName}</div>
                            <ul className="space-y-1">
                              {r.items.map((item, j) => (
                                <li key={j} className="text-[11px] text-gray-300 flex items-start gap-1.5">
                                  <span className="text-brand-cyan">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Items */}
                  <div className="pt-4 border-t border-gray-800">
                    <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Assigned Partner Action Items</h4>
                    <div className="space-y-2">
                      {selectedPartner.actionItems.map(act => (
                        <div
                          key={act.id}
                          onClick={() => handleToggleActionItem(act.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                            act.completed
                              ? 'bg-gray-900/30 border-gray-800/50 text-gray-400 line-through'
                              : 'bg-gray-900/60 border-gray-800 text-gray-200 hover:border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                              act.completed ? 'bg-brand-cyan border-brand-cyan text-black' : 'border-gray-600'
                            }`}>
                              {act.completed && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs">{act.title}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">{act.assignee}</span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddActionItem} className="flex gap-2 mt-3">
                      <input
                        type="text"
                        placeholder="Assign partner action item..."
                        value={quickActionTitle}
                        onChange={(e) => setQuickActionTitle(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-purple"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-brand-purple text-white text-xs font-semibold rounded-xl hover:bg-brand-purple/90 transition"
                      >
                        Assign Action
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {inspectorTab === 'deliverables' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Audited Deliverables</h4>
                    <div className="space-y-3">
                      {selectedPartner.deliverables.map(d => (
                        <div key={d.id} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-white">{d.name}</div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              d.status === 'ACCEPTED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              d.status === 'IN_REVIEW' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                              'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {d.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{d.description}</p>
                          {d.verificationEvidence && (
                            <div className="text-[11px] text-brand-cyan font-mono bg-brand-cyan/5 p-2 rounded border border-brand-cyan/20">
                              {d.verificationEvidence}
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-[11px] text-gray-400">
                            <span>Owner: {d.owner}</span>
                            <div className="flex items-center gap-2">
                              {d.status !== 'ACCEPTED' && (
                                <button
                                  onClick={() => handleUpdateDeliverable(d.id, 'ACCEPTED')}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold transition"
                                >
                                  Accept & Certify
                                </button>
                              )}
                              {d.status === 'PENDING' && (
                                <button
                                  onClick={() => handleUpdateDeliverable(d.id, 'IN_REVIEW')}
                                  className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-[10px] transition"
                                >
                                  Mark In Review
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Deliverable Form */}
                    <form onSubmit={handleAddDeliverable} className="mt-4 p-4 rounded-xl bg-gray-900/40 border border-gray-800 space-y-3">
                      <h5 className="text-xs font-semibold text-gray-300">Submit New Partnership Deliverable</h5>
                      <input
                        type="text"
                        placeholder="Deliverable title (e.g. Audit report, API interface spec)..."
                        value={newDeliverableName}
                        onChange={(e) => setNewDeliverableName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-purple"
                      />
                      <input
                        type="text"
                        placeholder="Detailed deliverable specification and verification criteria..."
                        value={newDeliverableDesc}
                        onChange={(e) => setNewDeliverableDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-purple"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-brand-cyan text-black text-xs font-semibold rounded-xl hover:opacity-90 transition"
                      >
                        Register Deliverable
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {inspectorTab === 'agreements' && (
                <div className="space-y-6">
                  {/* Agreements */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Legal Agreements & Covenants</h4>
                    <div className="space-y-3">
                      {selectedPartner.agreements.map(agr => (
                        <div key={agr.id} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-white">{agr.title}</div>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              agr.signed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {agr.signed ? 'Digitally Signed' : 'Pending Signature'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{agr.termsSummary}</p>
                          <div className="text-[11px] text-gray-400 pt-2 border-t border-gray-800 flex items-center justify-between">
                            <span>Signed by: {agr.signedBy.join(', ') || 'Awaiting counterparty'}</span>
                            {!agr.signed && (
                              <button
                                onClick={() => handleSignAgreement(agr.id)}
                                className="px-3 py-1 rounded bg-brand-purple hover:bg-brand-purple/90 text-white text-xs font-semibold transition"
                              >
                                Sign Agreement
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Joint Approvals */}
                  <div className="pt-4 border-t border-gray-800">
                    <h4 className="text-sm font-semibold text-white mb-2">Ratified Bilateral Approvals</h4>
                    <div className="space-y-2">
                      {selectedPartner.approvals.map(app => (
                        <div key={app.id} className="p-3 rounded-xl bg-gray-900/40 border border-gray-800 text-xs flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white">{app.topic}</div>
                            <div className="text-[11px] text-gray-400">Requested: {app.requestedBy}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleAddApproval} className="flex gap-2 mt-3">
                      <input
                        type="text"
                        placeholder="Ratify new joint approval topic..."
                        value={quickApprovalTopic}
                        onChange={(e) => setQuickApprovalTopic(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brand-purple"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-brand-purple text-white text-xs font-semibold rounded-xl hover:bg-brand-purple/90 transition"
                      >
                        Ratify Approval
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {inspectorTab === 'artifacts' && (
                <div className="space-y-4">
                  <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                    Shared Federated Work Objects & Artifacts
                  </h4>

                  {/* Shared Work Objects */}
                  {selectedPartner.sharedWorkObjectIds.map(wid => {
                    const work = universalWorkService.getWorkById(wid);
                    return (
                      <div key={wid} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-5 h-5 text-brand-purple" />
                          <div>
                            <div className="text-sm font-semibold text-white">{work?.title || wid}</div>
                            <div className="text-xs text-gray-400">{work?.workType} • Priority {work?.priority}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => onNavigate('universal-work', wid)}
                          className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium flex items-center gap-1 transition"
                        >
                          <span>Open Work</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Shared Presentations */}
                  {selectedPartner.sharedPresentationIds.map(pid => {
                    const pres = presentationsService.getPresentationById(pid);
                    return (
                      <div key={pid} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Presentation className="w-5 h-5 text-purple-400" />
                          <div>
                            <div className="text-sm font-semibold text-white">{pres?.title || pid}</div>
                            <div className="text-xs text-gray-400">{pres?.slides.length || 0} Slides</div>
                          </div>
                        </div>
                        <button
                          onClick={() => onNavigate('presentations', pid)}
                          className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium flex items-center gap-1 transition"
                        >
                          <span>Deck</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  {/* Shared Meetings */}
                  {selectedPartner.sharedMeetingIds.map(mid => {
                    const meet = meetingsService.getMeetingById(mid);
                    return (
                      <div key={mid} className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-brand-cyan" />
                          <div>
                            <div className="text-sm font-semibold text-white">{meet?.title || mid}</div>
                            <div className="text-xs text-gray-400">{meet?.attendees.length || 0} Attendees</div>
                          </div>
                        </div>
                        <button
                          onClick={() => onNavigate('meetings', mid)}
                          className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium flex items-center gap-1 transition"
                        >
                          <span>Meeting</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-800 bg-gray-900/80 flex items-center justify-end">
              <button
                onClick={() => setSelectedPartner(null)}
                className="px-4 py-2 rounded-xl bg-brand-purple text-white text-xs font-semibold hover:opacity-90 transition"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PARTNER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0f172a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-display font-semibold text-white">Register Strategic Alliance / Proposal</h3>
                <p className="text-xs text-gray-400">Establish institutional partnership with cryptographic tenant isolation.</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePartner} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Partner Organization Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nordic Quantum Computing Consortium"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Partner Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-brand-cyan"
                  >
                    <option value="STRATEGIC_PARTNER">Strategic Partner</option>
                    <option value="INSTITUTION">Institution / Consortium</option>
                    <option value="INVESTOR">Investor</option>
                    <option value="SUPPLIER">Supplier / Infrastructure</option>
                    <option value="DEVELOPER">Developer Ecosystem</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Primary Contact Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Astrid Lindgren"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Contact Email</label>
                  <input
                    type="email"
                    placeholder="astrid@nordic-quantum.org"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">Contact Role</label>
                  <input
                    type="text"
                    placeholder="Director of Research Partnerships"
                    value={newContactRole}
                    onChange={(e) => setNewContactRole(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Agreed Terms / Proposal Summary</label>
                <textarea
                  rows={2}
                  placeholder="Summary of mutual covenants, SLA commitments, and data sharing boundaries..."
                  value={newTerms}
                  onChange={(e) => setNewTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">Primary Strategic Objective</label>
                <input
                  type="text"
                  placeholder="e.g. Bilateral validation of quantum-resistant cryptographic key exchange"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-800 text-gray-300 text-xs font-medium hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-purple text-white text-xs font-semibold shadow-lg shadow-brand-cyan/20 transition"
                >
                  Create Partnership Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
