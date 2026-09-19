import React, { useState } from 'react';
import { 
  FileText, CheckCircle2, AlertTriangle, RefreshCw, 
  ArrowDownToLine, DollarSign, ShieldAlert, Check, X 
} from 'lucide-react';
import { BillingService } from '../services/billingService';
import { ReconciliationService } from '../services/reconciliationService';
import { RevenueLedgerEntry, ReconciliationReport, Invoice, Subscription } from '../types';

interface FinancialReconciliationTabProps {
  organizationId: string;
  currentUserEmail: string;
}

export const FinancialReconciliationTab: React.FC<FinancialReconciliationTabProps> = ({ 
  organizationId, 
  currentUserEmail 
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isReconciling, setIsReconciling] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceLineItem, setInvoiceLineItem] = useState('Enterprise Tier Seat Expansion');
  const [invoiceAmountUsd, setInvoiceAmountUsd] = useState(79.00);

  const ledger: RevenueLedgerEntry[] = BillingService.getRevenueLedger(organizationId);
  const invoices: Invoice[] = BillingService.getInvoices(organizationId);
  const subscription: Subscription = BillingService.getSubscription(organizationId);
  const report: ReconciliationReport = ReconciliationService.getLatestReport(organizationId);

  const handleRunReconciliation = () => {
    setIsReconciling(true);
    setTimeout(() => {
      ReconciliationService.runReconciliation(organizationId);
      setIsReconciling(false);
      setRefreshKey(k => k + 1);
    }, 800);
  };

  const handleResolveDiscrepancy = (discId: string) => {
    ReconciliationService.resolveDiscrepancy(
      organizationId,
      discId,
      'Manually verified with Pesapal support settlement batch',
      currentUserEmail.split('@')[0] || 'Finance Manager'
    );
    setRefreshKey(k => k + 1);
  };

  const handleGenerateInvoice = () => {
    ReconciliationService.generateItemizedInvoice({
      organizationId,
      subscriptionId: subscription.id,
      planName: invoiceLineItem,
      tier: subscription.tier,
      amountMinorUnits: Math.round(invoiceAmountUsd * 100),
      currency: subscription.currency || 'USD',
      paymentMethod: 'Pesapal Card / Mobile Money',
    });
    setShowInvoiceModal(false);
    setRefreshKey(k => k + 1);
  };

  return (
    <div key={refreshKey} className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Financial Ledger & Pesapal Reconciliation Hub</h1>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              Immutable Ledger
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">
            Automated bidirectional reconciliation between CATALYX internal revenue ledger and Pesapal v3 gateway settlement batches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm font-medium text-gray-200 shadow-sm hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
          >
            <FileText className="h-4 w-4" />
            Generate Invoice
          </button>
          <button
            onClick={handleRunReconciliation}
            disabled={isReconciling}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-purple px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-brand-purple/90 disabled:opacity-50 transition-colors cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isReconciling ? 'animate-spin' : ''}`} />
            {isReconciling ? 'Reconciling Gateway...' : 'Run Reconciliation Check'}
          </button>
        </div>
      </div>

      {/* Reconciliation Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Reconciliation Health</span>
          <div className="mt-3 flex items-center gap-2">
            {report.status === 'reconciled' ? (
              <span className="inline-flex items-center gap-1.5 text-lg font-bold text-emerald-400">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                100% RECONCILED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-lg font-bold text-amber-400">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                {report.status.toUpperCase()}
              </span>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Last audited: {new Date(report.generatedAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Internal Ledger Tx</span>
          <div className="mt-3 text-2xl font-bold text-white">
            {report.totalLedgerTransactions}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Zero float drift via integer minor units
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Matched Gateway Batches</span>
          <div className="mt-3 text-2xl font-bold text-emerald-400">
            {report.matchedTransactions}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Verified across Pesapal API endpoints
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Discrepancies</span>
          <div className={`mt-3 text-2xl font-bold ${report.discrepanciesCount > 0 ? 'text-amber-400' : 'text-white'}`}>
            {report.discrepanciesCount}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Automated discrepancy alerts
          </p>
        </div>
      </div>

      {/* Discrepancies List (if any) */}
      {report.discrepancies.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-6 shadow-lg">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-400" />
              <h2 className="text-sm font-bold text-amber-300">Detected Reconciliation Discrepancies</h2>
            </div>
            <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30">
              Action Required
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {report.discrepancies.map((disc) => (
              <div key={disc.id} className="rounded-lg border border-amber-500/30 bg-slate-950/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-amber-300">{disc.type.replace('_', ' ')}</span>
                    <span className={`rounded px-1.5 py-0.2 text-[10px] font-semibold ${disc.severity === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                      {disc.severity}
                    </span>
                    {disc.resolved && (
                      <span className="rounded bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30">
                        Resolved
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 mt-1">{disc.details}</p>
                  {disc.resolutionAction && (
                    <p className="text-[11px] text-emerald-400 font-medium mt-1">Resolution: {disc.resolutionAction}</p>
                  )}
                </div>

                {!disc.resolved && (
                  <button
                    onClick={() => handleResolveDiscrepancy(disc.id)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 shrink-0 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Verify & Resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Persistent Revenue Ledger Table */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-6 shadow-lg">
        <h2 className="text-base font-semibold text-white">Immutable Financial Revenue Ledger</h2>
        <p className="text-xs text-gray-400 mt-0.5">Every financial event is recorded with an immutable identifier and exact minor units.</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-950/60 text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Transaction Ref</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Provider</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ledger.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-brand-cyan">{entry.transactionReference}</td>
                  <td className="py-3 px-3 capitalize text-gray-300">{entry.type}</td>
                  <td className="py-3 px-3 font-bold text-white">
                    ${(entry.amountMinorUnits / 100).toFixed(2)} {entry.currency}
                  </td>
                  <td className="py-3 px-3 uppercase text-gray-400">{entry.provider}</td>
                  <td className="py-3 px-3 text-gray-300">{entry.customerEmail}</td>
                  <td className="py-3 px-3">
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                      {entry.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-400 font-mono text-[11px]">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoices List */}
      <div className="rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-md p-6 shadow-lg">
        <h2 className="text-base font-semibold text-white">Itemized Commercial Invoices</h2>
        <p className="text-xs text-gray-400 mt-0.5">Formal tax-compliant invoices with line items and receipt verification.</p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-950/60 text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Invoice Number</th>
                <th className="py-2.5 px-3">Billing Period</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Payment Method</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 font-mono font-medium text-brand-cyan">{inv.invoiceNumber}</td>
                  <td className="py-3 px-3 text-gray-300">
                    {new Date(inv.periodStart).toLocaleDateString()} - {new Date(inv.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-3 font-bold text-white">
                    ${(inv.amountMinorUnits / 100).toFixed(2)} {inv.currency}
                  </td>
                  <td className="py-3 px-3 text-gray-300">{inv.paymentMethod}</td>
                  <td className="py-3 px-3">
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-400">{new Date(inv.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Generator Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-slate-900 p-6 shadow-2xl border border-white/15">
            <h3 className="text-lg font-bold text-white">Generate Commercial Invoice</h3>
            <p className="mt-1 text-xs text-gray-400">
              Create an itemized tax invoice linked to the verified revenue ledger.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-300">Line Item Description</label>
                <input
                  type="text"
                  value={invoiceLineItem}
                  onChange={(e) => setInvoiceLineItem(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300">Amount (USD)</label>
                <input
                  type="number"
                  value={invoiceAmountUsd}
                  onChange={(e) => setInvoiceAmountUsd(Number(e.target.value))}
                  className="mt-1 block w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateInvoice}
                className="rounded-lg bg-brand-purple px-4 py-2 text-xs font-semibold text-white hover:bg-brand-purple/90 cursor-pointer shadow-md"
              >
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
