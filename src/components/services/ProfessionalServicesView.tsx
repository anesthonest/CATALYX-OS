import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Search, Star, ShieldCheck, CheckCircle2, Clock, 
  ArrowRight, UserCheck, DollarSign, Calendar, MessageSquare, 
  FileText, Check, AlertCircle, Layers, Users
} from 'lucide-react';
import { 
  professionalServicesService, ProfessionalProfile, ServiceTierPackage, 
  ServiceEngagementContract, ProfessionalCategory 
} from '../../services/services/professionalServicesService';
import { UserProfile, UserPersonaRole } from '../../types';

interface ProfessionalServicesViewProps {
  user: UserProfile;
  activeRole: UserPersonaRole;
  onNavigate: (tabId: string, itemId?: string) => void;
}

export const ProfessionalServicesView: React.FC<ProfessionalServicesViewProps> = ({
  user,
  activeRole,
  onNavigate
}) => {
  const [profiles, setProfiles] = useState<ProfessionalProfile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<ProfessionalProfile | null>(null);
  
  // Contract / Order Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ServiceTierPackage | null>(null);
  const [projectBrief, setProjectBrief] = useState('');
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);

  // Active Contracts
  const [userContracts, setUserContracts] = useState<ServiceEngagementContract[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const list = professionalServicesService.getAllProfiles();
    setProfiles(list);
    if (!selectedProfile && list.length > 0) {
      setSelectedProfile(list[0]);
    }
    const contracts = professionalServicesService.getContractsForUser(user.email);
    setUserContracts(contracts);
  };

  const filteredProfiles = profiles.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.primaryCategory === selectedCategory;
    const matchesSearch = !searchQuery.trim() || 
      p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.professionalTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleOpenOrder = (pkg: ServiceTierPackage) => {
    setSelectedPackage(pkg);
    setIsOrderModalOpen(true);
    setOrderSuccessMessage(null);
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile || !selectedPackage) return;

    try {
      const contract = professionalServicesService.createEngagementContract({
        serviceId: selectedProfile.id,
        packageId: selectedPackage.id,
        clientEmail: user.email,
        clientName: user.username || user.email,
        briefRequirements: projectBrief.trim() || 'Standard engagement based on package deliverables.'
      });

      setOrderSuccessMessage(`Milestone engagement contract #${contract.id.slice(-6)} created and funded in escrow!`);
      loadData();
      setIsOrderModalOpen(false);
      setProjectBrief('');
    } catch (err) {
      console.error('Failed to create contract:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono font-bold border border-blue-500/30 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5" /> Professional Services & Freelance
            </span>
            <span className="text-xs text-gray-400 font-mono">Verified Practitioners</span>
          </div>
          <h2 className="text-2xl font-bold text-white font-display mt-2">
            CATALYX Professional Services Marketplace
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Retain verified independent specialists, systems architects, legal consultants, researchers, designers, and educators. Contract with milestone protections and escrow guarantees.
          </p>
        </div>
      </div>

      {orderSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{orderSuccessMessage}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by practitioner name, title, or skills (e.g. Distributed Systems, Design Tokens, Tutoring)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/50 border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 placeholder-gray-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto bg-black/50 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 shrink-0"
        >
          <option value="ALL">All Disciplines</option>
          <option value="SOFTWARE_ENGINEERING">Software Engineering</option>
          <option value="AI_RESEARCH_DATA">AI & Data Systems</option>
          <option value="DESIGN_CREATIVE">Design & Identity</option>
          <option value="TUTORING_EDUCATION">Tutoring & Mentorship</option>
          <option value="FINANCE_ACCOUNTING">Finance & Accounting</option>
          <option value="LEGAL_COMPLIANCE">Legal & Compliance</option>
          <option value="STRATEGY_CONSULTING">Strategy Consulting</option>
        </select>
      </div>

      {/* Main Grid: Profiles + Selected Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Directory Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono uppercase text-gray-400 font-bold">
              Available Professionals ({filteredProfiles.length})
            </h3>
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> Escrow Protected
            </span>
          </div>

          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {filteredProfiles.map((prof) => {
              const isSelected = selectedProfile?.id === prof.id;
              const rateUsd = (prof.hourlyRateMinorUnits / 100).toFixed(0);

              return (
                <div
                  key={prof.id}
                  onClick={() => setSelectedProfile(prof)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-blue-950/30 border-blue-500/60 shadow-lg'
                      : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">
                        {prof.displayName}
                      </h4>
                      <p className="text-xs text-blue-300 font-medium mt-0.5">
                        {prof.professionalTitle}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-bold text-white">${rateUsd}</span>
                      <span className="text-[10px] text-gray-400 block font-mono">/ hour</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                    {prof.bio}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {prof.skills.slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/5"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[10px] font-mono text-gray-400">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3 h-3 fill-amber-400" /> {prof.rating.toFixed(2)} ({prof.completedProjectsCount} jobs)
                    </span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Available
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Profile Detail & Package Offerings */}
        <div className="lg:col-span-7">
          {selectedProfile ? (
            <div className="p-6 rounded-2xl catalyx-surface-card border border-white/10 shadow-2xl space-y-6">
              {/* Profile Header */}
              <div className="border-b border-white/10 pb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono font-bold border border-blue-500/30">
                    {selectedProfile.verifiedCredentialBadge}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    Avg Response: ~{selectedProfile.responseTimeHours} hrs
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white font-display">
                      {selectedProfile.displayName}
                    </h2>
                    <p className="text-xs text-blue-300 mt-0.5">
                      {selectedProfile.professionalTitle}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white font-mono">
                      ${(selectedProfile.hourlyRateMinorUnits / 100).toFixed(0)}
                    </span>
                    <span className="text-xs text-gray-400 block font-mono">USD / hour</span>
                  </div>
                </div>

                <p className="text-xs text-gray-200 leading-relaxed">
                  {selectedProfile.bio}
                </p>

                {/* Portfolio Links */}
                {selectedProfile.portfolioLinks.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-mono uppercase text-gray-400 block mb-1.5">Verified Work & Case Studies</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedProfile.portfolioLinks.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 border border-white/10 flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          <span>{link.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Service Packages / Tiers */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Service Packages & Fixed Milestones
                </h3>

                <div className="space-y-3">
                  {selectedProfile.packages.map((pkg) => {
                    const priceUsd = (pkg.priceMinorUnits / 100).toFixed(2);
                    return (
                      <div
                        key={pkg.id}
                        className="p-4 rounded-xl bg-slate-900/90 border border-white/10 space-y-3 hover:border-blue-500/40 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-bold text-white">
                              {pkg.name}
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {pkg.description}
                            </p>
                          </div>
                          <div className="text-left sm:text-right shrink-0">
                            <span className="text-lg font-bold text-emerald-400 font-mono">
                              ${priceUsd}
                            </span>
                            <span className="text-[10px] text-gray-400 block font-mono">
                              {pkg.deliveryTimeDays} days delivery • {pkg.revisionsAllowed} revisions
                            </span>
                          </div>
                        </div>

                        {/* Deliverables Checklist */}
                        <div className="bg-black/30 p-3 rounded-lg space-y-1.5 border border-white/5">
                          <span className="text-[10px] font-mono text-gray-400 uppercase block">What is Included:</span>
                          <ul className="space-y-1 text-xs text-gray-300">
                            {pkg.deliverablesIncluded.map((d, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{d}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleOpenOrder(pkg)}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Order Package (${priceUsd})</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 rounded-2xl catalyx-surface-card border border-white/10">
              <Users className="w-8 h-8 mx-auto text-gray-600 mb-2" />
              <p className="text-sm">Select a professional to view their full portfolio and package offerings.</p>
            </div>
          )}
        </div>
      </div>

      {/* Order / Fund Escrow Modal */}
      {isOrderModalOpen && selectedPackage && selectedProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl catalyx-surface-card border border-white/15 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-blue-400 font-bold">Escrow Protected Order</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedPackage.name}</h3>
                <p className="text-xs text-gray-400">Practitioner: {selectedProfile.displayName}</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-emerald-400 font-mono">
                  ${(selectedPackage.priceMinorUnits / 100).toFixed(2)}
                </span>
                <span className="text-[10px] text-gray-500 block font-mono">USD Total</span>
              </div>
            </div>

            <form onSubmit={handleConfirmOrder} className="space-y-4">
              <div>
                <label className="text-xs font-mono text-gray-300 block mb-1">Project Brief & Specific Requirements</label>
                <textarea
                  rows={4}
                  placeholder="Outline your objectives, timeline preferences, relevant URLs, or file attachments..."
                  value={projectBrief}
                  onChange={(e) => setProjectBrief(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200 space-y-1">
                <span className="font-bold block">Escrow Safeguards:</span>
                <p className="text-[11px] leading-relaxed text-gray-300">
                  Funds are held in secure escrow until you inspect and approve milestones. CATALYX platform fees are calculated at authoritative rates (0.25% - 0.50%).
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOrderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-md"
                >
                  Fund Escrow & Initiate (${(selectedPackage.priceMinorUnits / 100).toFixed(2)})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
