/**
 * CATALYX Universal Application Footer
 * Features accessible navigation links to all legal covenants and mandatory business disclosures.
 */

import React from 'react';
import { Scale, ShieldCheck, Heart } from 'lucide-react';
import { LegalPolicyService } from '../../services/legal/legalPolicyService';

interface AppFooterProps {
  onNavigateToLegal?: (slug: string) => void;
  className?: string;
}

export const AppFooter: React.FC<AppFooterProps> = ({
  onNavigateToLegal,
  className = ''
}) => {
  const currentVersion = LegalPolicyService.CURRENT_VERSION;

  const handleLinkClick = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigateToLegal) {
      onNavigateToLegal(slug);
    } else {
      window.location.hash = `#legal/${slug}`;
    }
  };

  return (
    <footer id="catalyx-application-footer" className={`border-t border-slate-800/80 bg-slate-950/80 text-slate-400 text-xs py-8 px-6 ${className}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Tier: Brand, Status, and Legal Covenants Links */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-white tracking-tight text-sm">CATALYX</span>
              <span className="text-[11px] text-slate-500">Autonomous OS</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-indigo-400 font-mono">
                {currentVersion}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Enterprise execution operating system & economic intelligence framework.
            </p>
          </div>

          {/* Quick Legal Links */}
          <nav aria-label="Legal and Regulatory Documents" className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <button
              onClick={e => handleLinkClick('terms', e)}
              className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={e => handleLinkClick('privacy', e)}
              className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={e => handleLinkClick('intellectual-property', e)}
              className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              IP & Rights
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={e => handleLinkClick('refunds', e)}
              className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Refund Policy
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={e => handleLinkClick('payments', e)}
              className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Payments & Billing
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={e => handleLinkClick('payouts', e)}
              className="text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Creator Payouts
            </button>
            <span className="text-slate-700">•</span>
            <button
              onClick={e => handleLinkClick('legal', e)}
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1 cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Legal Hub</span>
            </button>
          </nav>
        </div>

        {/* Bottom Tier: Mandatory Statutory Notice & IP Guarantee */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-slate-400">
          <div className="space-y-1">
            <div className="font-medium text-slate-300 flex items-center space-x-1.5">
              <span>Operational Entity Notice</span>
            </div>
            <p className="leading-relaxed">
              CATALYX is developed and operated under the <span className="text-slate-300 font-semibold">VINEXSAH TECHNOLOGIES</span> project.
            </p>
          </div>

          <div className="space-y-1 md:text-right">
            <div className="font-medium text-slate-300 flex items-center md:justify-end space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Creator IP Preservation Guarantee</span>
            </div>
            <p className="leading-relaxed">
              Users retain 100% intellectual property ownership of their uploaded workflows, models, and prompts. Platform fees: 0.25% individual / 0.27% group / 0.50% organizational.
            </p>
          </div>
        </div>

        {/* Copyright strip */}
        <div className="pt-2 text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-900/60">
          <div>
            © {new Date().getFullYear()} CATALYX (VINEXSAH TECHNOLOGIES project). All rights reserved.
          </div>
          <div className="flex items-center space-x-2">
            <span>Contact & Inquiries:</span>
            <span className="text-slate-400 font-mono">anesthonest81@gmail.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
