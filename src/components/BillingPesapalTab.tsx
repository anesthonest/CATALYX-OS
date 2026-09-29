import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Check, ShieldCheck, ArrowRight, DollarSign, 
  Clock, FileText, AlertCircle, RefreshCw, ExternalLink, Globe, Sparkles,
  CheckCircle2, AlertTriangle, Lock, HelpCircle, Building, Landmark,
  Receipt, Send, Users, Scale, Copy, ArrowUpRight, ChevronRight
} from 'lucide-react';
import { BillingPlan, BillingTier, CurrencyCode, Subscription, Invoice } from '../types';
import { BillingService } from '../services/billingService';
import { revenuePolicyEngine, SellerAccountType, RevenueSplitBreakdown } from '../services/payment/revenuePolicyEngine';

interface Props {
  orgId: string;
  userEmail: string;
}

const ALL_CURRENCIES: CurrencyCode[] = ['USD', 'KES', 'UGX', 'TZS', 'RWF', 'NGN', 'GHS', 'ZAR', 'EUR', 'GBP'];

export const BillingPesapalTab: React.FC<Props> = ({ orgId, userEmail }) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'wire_transfers' | 'invoices' | 'payouts' | 'ledger' | 'revenue_policy'>('plans');
  const [subscription, setSubscription] = useState<Subscription>(() => 
    BillingService.getSubscription(orgId)
  );
  const [currency, setCurrency] = useState<CurrencyCode>(subscription.currency || 'USD');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [plans] = useState<BillingPlan[]>(() => BillingService.getPlans());
  const [invoices, setInvoices] = useState<Invoice[]>(() => BillingService.getInvoices(orgId));
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [checkoutModalPlan, setCheckoutModalPlan] = useState<BillingPlan | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<'pesapal' | 'bank_transfer'>('pesapal');
  const [notification, setNotification] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Revenue Split Policy Calculator State
  const [calcAmount, setCalcAmount] = useState<number>(100);
  const [calcSellerType, setCalcSellerType] = useState<SellerAccountType>('INDIVIDUAL');
  const [calcCurrency, setCalcCurrency] = useState<CurrencyCode>('USD');
  const [calcChannel, setCalcChannel] = useState<'pesapal' | 'bank_transfer'>('pesapal');
  const [calcTaxPercent, setCalcTaxPercent] = useState<number>(0);
  const [calcAdjustment, setCalcAdjustment] = useState<number>(0);
  const [calcResult, setCalcResult] = useState<RevenueSplitBreakdown | null>(() =>
    revenuePolicyEngine.calculateRevenueSplit({
      grossAmountMinorUnits: 10000,
      currency: 'USD',
      sellerAccountType: 'INDIVIDUAL',
      paymentChannel: 'pesapal'
    })
  );

  // Gateway & Economic Telemetry State
  const [gatewayHealth, setGatewayHealth] = useState<{
    configured: boolean;
    environment: string;
    authHealthy?: boolean;
    authErrorMessage?: string;
    supportedCurrencies?: string[];
  } | null>(null);

  const [channels, setChannels] = useState<any[]>([]);
  const [receivingAccounts, setReceivingAccounts] = useState<any[]>([]);
  const [bankSubmissions, setBankSubmissions] = useState<any[]>([]);
  const [v29Invoices, setV29Invoices] = useState<any[]>([]);
  const [v29Receipts, setV29Receipts] = useState<any[]>([]);
  const [creatorReport, setCreatorReport] = useState<any>(null);
  const [payoutAccount, setPayoutAccount] = useState<any>(null);
  const [ledgerSummary, setLedgerSummary] = useState<any>(null);

  // Active Pending Intent
  const [activePaymentIntent, setActivePaymentIntent] = useState<{
    orderId: string;
    orderTrackingId?: string;
    merchantReference: string;
    redirectUrl?: string;
    channel: 'pesapal' | 'bank_transfer';
    isConfigured: boolean;
    notice?: string;
  } | null>(null);

  // Wire Submission Form State
  const [wireTransferRef, setWireTransferRef] = useState('');
  const [wireSenderBank, setWireSenderBank] = useState('');
  const [wireSenderName, setWireSenderName] = useState('');
  const [wireProofUrl, setWireProofUrl] = useState('');

  // Manual verification inputs
  const [manualTrackingId, setManualTrackingId] = useState('');
  const [manualMerchantRef, setManualMerchantRef] = useState('');
  const [isVerifyingManual, setIsVerifyingManual] = useState(false);

  // Payout Registration Form State
  const [payoutBankName, setPayoutBankName] = useState('');
  const [payoutAccountNumber, setPayoutAccountNumber] = useState('');
  const [payoutAccountName, setPayoutAccountName] = useState('');
  const [payoutRoutingSwift, setPayoutRoutingSwift] = useState('');
  const [isRegisteringPayout, setIsRegisteringPayout] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchGatewayHealth();
    fetchChannels();
    fetchReceivingAccounts();
    fetchBankSubmissions();
    fetchInvoicesAndReceipts();
    fetchCreatorEconomics();
  }, [userEmail, orgId]);

  useEffect(() => {
    const grossMinor = Math.round(calcAmount * 100);
    const split = revenuePolicyEngine.calculateRevenueSplit({
      grossAmountMinorUnits: grossMinor,
      currency: calcCurrency as any,
      sellerAccountType: calcSellerType,
      taxRatePercent: calcTaxPercent,
      adjustmentMinorUnits: Math.round(calcAdjustment * 100),
      paymentChannel: calcChannel
    });
    setCalcResult(split);
  }, [calcAmount, calcSellerType, calcCurrency, calcChannel, calcTaxPercent, calcAdjustment]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchGatewayHealth = async () => {
    try {
      const res = await fetch('/api/payments/health');
      if (res.ok) {
        const data = await res.json();
        setGatewayHealth(data);
      }
    } catch (e) {
      console.warn('Could not query payment gateway health:', e);
    }
  };

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/payments/channels');
      if (res.ok) {
        const data = await res.json();
        setChannels(data.channels || []);
      }
    } catch (e) {
      console.warn('Failed to fetch channels:', e);
    }
  };

  const fetchReceivingAccounts = async () => {
    try {
      const res = await fetch('/api/payments/bank-accounts/receiving');
      if (res.ok) {
        const data = await res.json();
        setReceivingAccounts(data.accounts || []);
      }
    } catch (e) {
      console.warn('Failed to fetch receiving bank accounts:', e);
    }
  };

  const fetchBankSubmissions = async () => {
    try {
      const res = await fetch('/api/payments/bank-transfer/submissions');
      if (res.ok) {
        const data = await res.json();
        setBankSubmissions(data.submissions || []);
      }
    } catch (e) {
      console.warn('Failed to fetch bank submissions:', e);
    }
  };

  const fetchInvoicesAndReceipts = async () => {
    try {
      const [invRes, recRes] = await Promise.all([
        fetch('/api/payments/invoices'),
        fetch('/api/payments/receipts')
      ]);
      if (invRes.ok) {
        const data = await invRes.json();
        setV29Invoices(data.invoices || []);
      }
      if (recRes.ok) {
        const data = await recRes.json();
        setV29Receipts(data.receipts || []);
      }
    } catch (e) {
      console.warn('Failed to fetch invoices/receipts:', e);
    }
  };

  const fetchCreatorEconomics = async () => {
    try {
      const [repRes, accRes] = await Promise.all([
        fetch(`/api/payments/payouts/eligibility/${encodeURIComponent(userEmail)}`),
        fetch(`/api/payments/bank-accounts/payout/${encodeURIComponent(userEmail)}`)
      ]);
      if (repRes.ok) {
        const data = await repRes.json();
        setCreatorReport(data.report || null);
      }
      if (accRes.ok) {
        const data = await accRes.json();
        setPayoutAccount(data.account || null);
      }
    } catch (e) {
      console.warn('Failed to fetch creator economics:', e);
    }
  };

  const currentPlan = plans.find(p => p.tier === subscription.tier) || plans[1];

  const calculatePlanPrice = (plan: BillingPlan): number => {
    const baseMinor = plan.pricesMinorUnits[currency] ?? plan.pricesMinorUnits.USD ?? 0;
    const majorUnits = baseMinor / 100;
    if (billingPeriod === 'annual') {
      return Math.round(majorUnits * 12 * 0.8);
    }
    return majorUnits;
  };

  const handleOpenCheckout = (plan: BillingPlan) => {
    setCheckoutModalPlan(plan);
    setActivePaymentIntent(null);
    setSelectedChannel('pesapal');
    setNotification(null);
  };

  const handleInitiateOrder = async () => {
    if (!checkoutModalPlan) return;
    setIsProcessing(true);
    setNotification(null);

    try {
      const res = await fetch('/api/payments/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: checkoutModalPlan.id,
          tier: checkoutModalPlan.tier,
          currency,
          billingPeriod,
          customerEmail: userEmail,
          organizationId: orgId,
          channel: selectedChannel,
          idempotencyKey: `idemp_cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
        }),
      });

      const data = await res.json();

      if (!res.ok && data.status !== 'NOT_CONFIGURED') {
        throw new Error(data.error || 'Failed to initiate order.');
      }

      setActivePaymentIntent({
        orderId: data.orderId,
        orderTrackingId: data.orderTrackingId,
        merchantReference: data.merchantReference,
        redirectUrl: data.redirectUrl,
        channel: selectedChannel,
        isConfigured: data.isConfigured !== false,
        notice: data.notice
      });

      if (selectedChannel === 'bank_transfer') {
        setNotification({
          type: 'info',
          message: `Order ${data.merchantReference} created. Wire funds using the instructions below and submit your transfer reference.`
        });
      } else {
        setNotification({
          type: 'info',
          message: data.notice || `Order ${data.merchantReference} submitted to Pesapal API. Complete checkout in the gateway window.`
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Payment initiation error.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyPendingPayment = async (orderTrackingId?: string, merchantRef?: string) => {
    const trackingId = orderTrackingId || activePaymentIntent?.orderTrackingId;
    const ref = merchantRef || activePaymentIntent?.merchantReference;

    if (!trackingId && !ref) {
      setNotification({
        type: 'error',
        message: 'Order Tracking ID or Merchant Reference is required to verify payment.'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const verifyRes = await fetch('/api/billing/pesapal/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: orgId,
          orderTrackingId: trackingId,
          merchantReference: ref,
          planId: checkoutModalPlan?.id || subscription.planId,
          currency,
        }),
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.verified && verifyData.subscription) {
        BillingService.saveSubscription(verifyData.subscription);
        setSubscription(verifyData.subscription);
        setInvoices(BillingService.getInvoices(orgId));
        fetchInvoicesAndReceipts();
        fetchCreatorEconomics();
        setNotification({
          type: 'success',
          message: `Payment authoritatively verified via Pesapal! Plan upgraded to ${verifyData.subscription.tier.toUpperCase()}.`,
        });
        setCheckoutModalPlan(null);
        setActivePaymentIntent(null);
      } else {
        throw new Error(verifyData.error || 'Payment status could not be verified with the gateway.');
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Verification failed. Entitlements were not modified.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitWireRemittance = async () => {
    if (!activePaymentIntent?.merchantReference || !wireTransferRef) {
      setNotification({
        type: 'error',
        message: 'Please provide a valid Bank Wire / Transfer Reference Number.'
      });
      return;
    }

    setIsProcessing(true);
    try {
      const planPriceMajor = calculatePlanPrice(checkoutModalPlan!);
      const amountMinor = Math.round(planPriceMajor * 100);

      const res = await fetch('/api/payments/bank-transfer/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activePaymentIntent.orderId,
          merchantReference: activePaymentIntent.merchantReference,
          amountMinorUnits: amountMinor,
          currency,
          senderName: wireSenderName || userEmail,
          senderBank: wireSenderBank || 'Customer Financial Institution',
          bankTransferReference: wireTransferRef,
          proofFileUrl: wireProofUrl || undefined,
          receivingBankAccountId: receivingAccounts[0]?.id || 'cx_bank_usd_chase'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setNotification({
        type: 'success',
        message: `Wire remittance recorded (Ref: ${wireTransferRef}). Awaiting statement reconciliation.`
      });
      setCheckoutModalPlan(null);
      setActivePaymentIntent(null);
      setWireTransferRef('');
      setWireSenderBank('');
      fetchBankSubmissions();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAdminConfirmBankTransfer = async (merchantReference: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/payments/bank-transfer/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantReference,
          verifiedBy: 'Senior Financial Controller',
          verificationNotes: 'Matched exact transaction on corporate bank ledger statement.'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to reconcile transfer');

      setNotification({
        type: 'success',
        message: `Bank transfer ${merchantReference} reconciled and settled! Order marked PAID, ledger entries posted, and entitlements granted.`
      });
      fetchBankSubmissions();
      fetchInvoicesAndReceipts();
      fetchCreatorEconomics();
      // Reload subscription
      const sub = BillingService.getSubscription(orgId);
      setSubscription(sub);
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegisterPayoutAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutBankName || !payoutAccountNumber) return;
    setIsRegisteringPayout(true);
    try {
      const res = await fetch('/api/payments/bank-accounts/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorEmail: userEmail,
          creatorName: payoutAccountName || userEmail.split('@')[0],
          bankName: payoutBankName,
          accountNumber: payoutAccountNumber,
          accountHolderName: payoutAccountName || userEmail.split('@')[0],
          routingOrSortCode: payoutRoutingSwift,
          currency
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register account');

      setNotification({
        type: 'success',
        message: 'Payout bank account registered. 24-hour security cooling-off window activated.'
      });
      fetchCreatorEconomics();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setIsRegisteringPayout(false);
    }
  };

  const handleCreatePayoutBatch = async () => {
    if (!creatorReport?.eligibleBalanceMinor || creatorReport.eligibleBalanceMinor <= 0) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/payments/payouts/create-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorEmail: userEmail,
          amountMinorUnits: creatorReport.eligibleBalanceMinor,
          currency,
          paymentChannel: 'bank_transfer',
          authorizedBy: 'Automated Settlement Engine'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Batch creation failed');

      setNotification({
        type: 'success',
        message: `Payout Batch created for ${(creatorReport.eligibleBalanceMinor / 100).toFixed(2)} ${currency}. Transferred to disbursement queue.`
      });
      fetchCreatorEconomics();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Universal V29 Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider rounded bg-brand-purple/20 text-purple-300 border border-brand-purple/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-brand-cyan" />
              CATALYX V29 Economic Engine
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Dual-Channel: Pesapal v3 & Direct Bank Wire
            </span>
            <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${
              gatewayHealth?.configured
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
            }`}>
              {gatewayHealth?.configured ? `Pesapal: ${gatewayHealth.environment.toUpperCase()}` : 'Pesapal: Sandbox/Dev Mode'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1.5 tracking-tight">Revenue, Payments & Economic Engine</h2>
          <p className="text-sm text-gray-400">
            Authoritative order pricing, double-entry financial ledgers, Pesapal API v3 settlement, bank transfer reconciliation, and automated creator disbursements.
          </p>
        </div>

        {/* Currency & Billing Period Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm">
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={currency}
              onChange={(e: any) => setCurrency(e.target.value)}
              className="bg-transparent text-white focus:outline-none cursor-pointer"
            >
              {ALL_CURRENCIES.map(c => (
                <option key={c} value={c} className="bg-slate-950 text-white">{c}</option>
              ))}
            </select>
          </div>

          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                billingPeriod === 'monthly' ? 'bg-brand-purple text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 cursor-pointer ${
                billingPeriod === 'annual' ? 'bg-brand-purple text-white shadow-md' : 'text-gray-400 hover:text-white'
              }`}
            >
              Annual <span className="text-[10px] text-emerald-400 font-bold">-20%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-0.5 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition cursor-pointer ${
            activeTab === 'plans'
              ? 'border-brand-purple text-purple-300 font-bold'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Plans & Checkout</span>
        </button>
        <button
          onClick={() => setActiveTab('wire_transfers')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition relative cursor-pointer ${
            activeTab === 'wire_transfers'
              ? 'border-brand-purple text-purple-300 font-bold'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Bank Wire Transfers</span>
          {bankSubmissions.filter(s => s.status === 'PENDING_VERIFICATION').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition cursor-pointer ${
            activeTab === 'invoices'
              ? 'border-brand-purple text-purple-300 font-bold'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Invoices & Receipts</span>
          <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-mono text-gray-300">
            {v29Invoices.length + invoices.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition cursor-pointer ${
            activeTab === 'payouts'
              ? 'border-brand-purple text-purple-300 font-bold'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Creator Payouts & Economics</span>
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition cursor-pointer ${
            activeTab === 'ledger'
              ? 'border-brand-purple text-purple-300 font-bold'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Double-Entry Ledger</span>
        </button>
        <button
          onClick={() => setActiveTab('revenue_policy')}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition cursor-pointer ${
            activeTab === 'revenue_policy'
              ? 'border-brand-purple text-purple-300 font-bold'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Marketplace Revenue Splits (0.25% - 0.50%)</span>
        </button>
      </div>

      {/* Notifications */}
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-md border ${
          notification.type === 'success' 
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
            : notification.type === 'error'
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        }`}>
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: PLANS & CHECKOUT */}
      {/* ========================================================================= */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Active Tenant Subscription Overview Card */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Tenant Tier</span>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black text-white capitalize">{subscription.tier} Plan</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase ${
                  subscription.status === 'trial'
                    ? 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/30'
                    : subscription.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {subscription.status === 'trial' ? `Active 1-Month Trial (${BillingService.getTrialDaysRemaining(subscription)} Days Left)` : subscription.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Payment Channel: <strong className="text-purple-300 font-mono">Pesapal v3 / Wire Clearing</strong> • Renewal / Expiry:{' '}
                <strong className="text-white">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</strong>
                {subscription.status === 'trial' && (
                  <span className="text-emerald-400 ml-2 font-mono">
                    (Zero upfront charge • 1-month trial active)
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="p-3 bg-slate-950/70 rounded-xl border border-white/10">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Authoritative Order Ref</span>
                <span className="font-mono font-bold text-brand-cyan">{subscription.pesapalMerchantReference || 'CX-ORD-001'}</span>
              </div>

              <div className="p-3 bg-slate-950/70 rounded-xl border border-white/10">
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Billing Cycle Rate</span>
                <span className="font-bold text-white text-sm">
                  {currency} {calculatePlanPrice(currentPlan).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {plans.map(plan => {
              const isCurrent = plan.tier === subscription.tier;
              const price = calculatePlanPrice(plan);

              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between transition backdrop-blur-md ${
                    isCurrent
                      ? 'bg-slate-900 border-brand-purple ring-2 ring-brand-purple/50 shadow-xl'
                      : 'bg-slate-900/60 border-white/10 hover:border-white/20 shadow-lg'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white text-base">{plan.name}</h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-purple text-white uppercase">
                          Current
                        </span>
                      )}
                    </div>

                    <div className="pt-1">
                      <div className="text-2xl font-black text-white">
                        {currency} {price.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium">per {billingPeriod === 'monthly' ? 'month' : 'year'}</div>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">{plan.description}</p>

                    <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
                      <div className="font-semibold text-gray-200 text-[11px] uppercase tracking-wider">Included Capabilities:</div>
                      <ul className="space-y-1.5 text-gray-400">
                        {plan.features.slice(0, 4).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-brand-cyan shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-white/10">
                    <button
                      onClick={() => handleOpenCheckout(plan)}
                      disabled={isCurrent}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-white/5 text-gray-500 cursor-default border border-white/10'
                          : 'bg-brand-purple text-white hover:bg-brand-purple/90 shadow-md'
                      }`}
                    >
                      {isCurrent ? 'Current Tier' : 'Upgrade Plan'}
                      {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Direct Authoritative Verification Tool */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-cyan" />
                <h3 className="font-bold text-white text-sm">Authoritative Gateway Verification & Reconciliation Tool</h3>
              </div>
              <span className="text-xs text-gray-400 font-mono">Pesapal v3 API / Direct Bank Statement</span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              If you completed payment via an external Pesapal mobile money prompt or bank wire, provide your tracking ID or merchant reference to verify directly against the gateway and reconcile ledger balances.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Pesapal Order Tracking ID (UUID)"
                value={manualTrackingId}
                onChange={e => setManualTrackingId(e.target.value)}
                className="px-3 py-2 border border-white/10 bg-slate-950/80 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan font-mono"
              />
              <input
                type="text"
                placeholder="Merchant Reference (e.g. CX-ORD-...)"
                value={manualMerchantRef}
                onChange={e => setManualMerchantRef(e.target.value)}
                className="px-3 py-2 border border-white/10 bg-slate-950/80 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan font-mono"
              />
              <button
                onClick={() => {
                  if (!manualTrackingId && !manualMerchantRef) return;
                  setIsVerifyingManual(true);
                  handleVerifyPendingPayment(manualTrackingId, manualMerchantRef).finally(() => setIsVerifyingManual(false));
                }}
                disabled={isVerifyingManual || (!manualTrackingId && !manualMerchantRef)}
                className="px-4 py-2 bg-brand-purple text-white rounded-xl text-xs font-bold hover:bg-brand-purple/90 transition disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                {isVerifyingManual ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying with Gateway...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify & Settle Entitlement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BANK WIRE TRANSFERS */}
      {/* ========================================================================= */}
      {activeTab === 'wire_transfers' && (
        <div className="space-y-6">
          {/* Corporate Receiving Accounts */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-brand-cyan" />
                <h3 className="font-bold text-white text-sm">Official Corporate Receiving Bank Accounts (Client-Safe)</h3>
              </div>
              <span className="text-xs text-gray-400 font-mono">Mode B Manual Statement Reconciliation</span>
            </div>

            <p className="text-xs text-gray-400">
              Payments submitted via Bank Transfer are credited to CATALYX corporate escrow clearing accounts. Once funds clear on our banking statement, our finance controllers authoritatively verify and activate your subscription.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {receivingAccounts.map(acc => (
                <div key={acc.id} className="p-4 rounded-xl border border-white/10 bg-slate-950/60 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{acc.bankName}</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                      {acc.currency}
                    </span>
                  </div>
                  <div className="space-y-1 text-gray-300">
                    <div>Beneficiary: <strong className="text-white">{acc.accountName}</strong></div>
                    <div className="flex items-center justify-between">
                      <span>Account: <strong className="font-mono text-white">{acc.accountNumberMasked}</strong></span>
                      <button
                        onClick={() => copyToClipboard(acc.accountNumberMasked, acc.id)}
                        className="text-[10px] text-brand-cyan font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedKey === acc.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    {acc.swiftCode && (
                      <div>SWIFT / BIC: <strong className="font-mono text-white">{acc.swiftCode}</strong></div>
                    )}
                    {acc.routingNumber && (
                      <div>Routing / Sort: <strong className="font-mono text-white">{acc.routingNumber}</strong></div>
                    )}
                  </div>
                  <div className="pt-2 border-t border-white/10 text-[11px] text-gray-400 italic">
                    {acc.instructions}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending & Verified Wire Submissions Table */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-cyan" />
                <h3 className="font-bold text-white text-sm">Customer Wire Submissions & Reconciliation Queue</h3>
              </div>
              <span className="text-xs text-gray-400 font-semibold">{bankSubmissions.length} Submissions Logged</span>
            </div>

            {bankSubmissions.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                No bank transfer submissions currently pending. Initiate a bank transfer through checkout to generate a wire order.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-300">
                  <thead className="text-gray-400 border-b border-white/10 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5">Merchant Ref</th>
                      <th className="py-2.5">Wire Ref</th>
                      <th className="py-2.5">Sender / Bank</th>
                      <th className="py-2.5">Amount</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5">Submitted</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {bankSubmissions.map(sub => (
                      <tr key={sub.id} className="hover:bg-white/5 transition">
                        <td className="py-2.5 font-mono font-bold text-white">{sub.merchantReference}</td>
                        <td className="py-2.5 font-mono text-purple-300 font-semibold">{sub.bankTransferReference}</td>
                        <td className="py-2.5">
                          <div className="font-medium text-white">{sub.senderName}</div>
                          <div className="text-[10px] text-gray-400">{sub.senderBank}</div>
                        </td>
                        <td className="py-2.5 font-bold text-white">
                          {sub.currency} {(sub.amountMinorUnits / 100).toFixed(2)}
                        </td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            sub.status === 'CONFIRMED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : sub.status === 'PENDING_VERIFICATION'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-white/10 text-gray-300 border border-white/15'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-gray-400">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                        <td className="py-2.5 text-right">
                          {sub.status === 'PENDING_VERIFICATION' ? (
                            <button
                              onClick={() => handleAdminConfirmBankTransfer(sub.merchantReference)}
                              disabled={isProcessing}
                              className="px-3 py-1 bg-brand-purple text-white rounded-lg text-[11px] font-bold hover:bg-brand-purple/90 transition shadow-md disabled:opacity-40 cursor-pointer"
                            >
                              Reconcile Statement
                            </button>
                          ) : (
                            <span className="text-[11px] text-emerald-300 font-semibold flex items-center justify-end gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Reconciled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INVOICES & RECEIPTS */}
      {/* ========================================================================= */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-cyan" />
                <h3 className="font-bold text-white text-sm">Universal Itemized Tax Invoices</h3>
              </div>
              <span className="text-xs text-gray-400 font-mono">CATALYX V29 Invoicing Engine</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-300">
                <thead className="text-gray-400 border-b border-white/10 uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5">Invoice #</th>
                    <th className="py-2.5">Customer</th>
                    <th className="py-2.5">Order Ref</th>
                    <th className="py-2.5">Subtotal</th>
                    <th className="py-2.5">Tax (VAT)</th>
                    <th className="py-2.5">Total</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5">Issued Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {v29Invoices.map(inv => (
                    <tr key={inv.invoiceId} className="hover:bg-white/5 transition">
                      <td className="py-2.5 font-mono font-bold text-white">{inv.invoiceNumber}</td>
                      <td className="py-2.5">
                        <div className="font-semibold text-white">{inv.customerName}</div>
                        <div className="text-[10px] text-gray-400">{inv.customerEmail}</div>
                      </td>
                      <td className="py-2.5 font-mono text-gray-400">{inv.orderId}</td>
                      <td className="py-2.5">{inv.currency} {(inv.subtotalMinorUnits / 100).toFixed(2)}</td>
                      <td className="py-2.5">{inv.currency} {(inv.taxMinorUnits / 100).toFixed(2)}</td>
                      <td className="py-2.5 font-bold text-white">
                        {inv.currency} {(inv.totalMinorUnits / 100).toFixed(2)}
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-400">{new Date(inv.issuedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-white/5 transition">
                      <td className="py-2.5 font-mono font-bold text-white">{inv.id}</td>
                      <td className="py-2.5 font-semibold text-white">{userEmail}</td>
                      <td className="py-2.5 font-mono text-gray-400">{inv.pesapalMerchantReference || '-'}</td>
                      <td className="py-2.5">{inv.currency} {(inv.amountMinorUnits / 100).toFixed(2)}</td>
                      <td className="py-2.5">{inv.currency} 0.00</td>
                      <td className="py-2.5 font-bold text-white">
                        {inv.currency} {(inv.amountMinorUnits / 100).toFixed(2)}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-gray-400">{new Date(inv.issuedAt || inv.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CREATOR PAYOUTS & ECONOMICS */}
      {/* ========================================================================= */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          {/* Creator Balances Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-5 shadow-lg space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Net Earnings</span>
              <div className="text-2xl font-black text-white">
                {currency} {creatorReport ? (creatorReport.netEarnedMinor / 100).toFixed(2) : '0.00'}
              </div>
              <div className="text-[11px] text-gray-400">Gross sales minus platform fee</div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-5 shadow-lg space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Pending Hold (14-Day)</span>
              <div className="text-2xl font-black text-amber-400">
                {currency} {creatorReport ? (creatorReport.pendingPayoutsMinor / 100).toFixed(2) : '0.00'}
              </div>
              <div className="text-[11px] text-amber-300/80 font-medium">Refund / Dispute protection buffer</div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-5 shadow-lg space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Eligible For Immediate Payout</span>
              <div className="text-2xl font-black text-emerald-400">
                {currency} {creatorReport ? (creatorReport.eligibleBalanceMinor / 100).toFixed(2) : '0.00'}
              </div>
              <div className="text-[11px] text-emerald-300/80 font-medium">Cleared and ready for wire transfer</div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-5 shadow-lg space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Already Paid Out</span>
              <div className="text-2xl font-black text-purple-300">
                {currency} {creatorReport ? (creatorReport.settledPayoutsMinor / 100).toFixed(2) : '0.00'}
              </div>
              <div className="text-[11px] text-gray-400">Disbursed to verified bank account</div>
            </div>
          </div>

          {/* Security & Eligibility Status Banner */}
          {creatorReport && (
            <div className={`p-4 rounded-xl border text-xs ${
              creatorReport.isEligibleNow
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-200'
                : 'bg-amber-500/20 border-amber-500/30 text-amber-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-4 h-4 ${creatorReport.isEligibleNow ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <strong className="font-bold">
                    {creatorReport.isEligibleNow ? 'Creator Account Fully Verified & Eligible for Payout' : 'Payout Prerequisites Pending'}
                  </strong>
                </div>
                {creatorReport.isEligibleNow && (
                  <button
                    onClick={handleCreatePayoutBatch}
                    disabled={isProcessing || creatorReport.eligibleBalanceMinor <= 0}
                    className="px-4 py-1.5 bg-brand-purple text-white rounded-lg text-xs font-bold hover:bg-brand-purple/90 transition shadow-md disabled:opacity-40 cursor-pointer"
                  >
                    Request Payout Transfer
                  </button>
                )}
              </div>
              {!creatorReport.isEligibleNow && creatorReport.ineligibilityReasons.length > 0 && (
                <ul className="mt-2 list-disc list-inside space-y-1 text-amber-300">
                  {creatorReport.ineligibilityReasons.map((reason: string, i: number) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Creator Payout Bank Account (with 24-hr cooling-off protection) */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-brand-cyan" />
                <h3 className="font-bold text-white text-sm">Disbursement Bank Account</h3>
              </div>
              <span className="text-xs text-gray-400 font-mono">24-Hour Cooling-Off Fraud Lock</span>
            </div>

            {payoutAccount ? (
              <div className="p-4 rounded-xl border border-white/10 bg-slate-950/60 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-white">{payoutAccount.bankName}</span>
                    <div className="text-gray-400 font-mono">Acct: {payoutAccount.accountNumberMasked}</div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                      payoutAccount.isEligibleForPayout
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {payoutAccount.isEligibleForPayout ? 'Active for Transfers' : 'In Cooling-Off Period'}
                    </span>
                  </div>
                </div>

                {!payoutAccount.isEligibleForPayout && (
                  <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-200 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Security Lock:</strong> Payouts to this bank account will unlock on{' '}
                      <strong className="text-white">{new Date(payoutAccount.coolingOffEndsAt).toLocaleString()}</strong> (24 hours after account addition to prevent unauthorized diversion).
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleRegisterPayoutAccount} className="space-y-4">
                <p className="text-xs text-gray-400">
                  Add your primary commercial bank account to receive automatic earnings disbursements. Bank details are cryptographic-tokenized and protected by mandatory 24-hour cooling-off periods.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. JPMorgan Chase / Barclays / Standard Chartered"
                      value={payoutBankName}
                      onChange={e => setPayoutBankName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-white/10 bg-slate-950/80 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="Full Name as listed on Bank Statement"
                      value={payoutAccountName}
                      onChange={e => setPayoutAccountName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-white/10 bg-slate-950/80 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Account Number / IBAN</label>
                    <input
                      type="text"
                      placeholder="Account Number or IBAN"
                      value={payoutAccountNumber}
                      onChange={e => setPayoutAccountNumber(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-white/10 bg-slate-950/80 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">SWIFT / BIC / Routing Code</label>
                    <input
                      type="text"
                      placeholder="SWIFT / Sort / Routing"
                      value={payoutRoutingSwift}
                      onChange={e => setPayoutRoutingSwift(e.target.value)}
                      className="w-full px-3 py-2 border border-white/10 bg-slate-950/80 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegisteringPayout}
                  className="px-5 py-2 bg-brand-purple text-white rounded-xl text-xs font-bold hover:bg-brand-purple/90 transition shadow-md disabled:opacity-40 flex items-center gap-2 cursor-pointer"
                >
                  {isRegisteringPayout ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>Register Secure Payout Account</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DOUBLE-ENTRY LEDGER & RECONCILIATION */}
      {/* ========================================================================= */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-brand-cyan" />
                <h3 className="font-bold text-white text-sm">Double-Entry Financial Ledger Architecture</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Mathematical Integrity Verified: Debits === Credits
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Every financial event in CATALYX generates immutable double-entry journal entries using integer minor units. No floating point math is permitted. Funds settle from gateway clearing accounts into earned revenue and creator payables.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
              <div className="p-4 bg-slate-950/70 border border-white/10 rounded-xl space-y-2">
                <span className="font-bold text-white block">Pesapal Clearing Account</span>
                <div className="font-mono text-xs text-gray-400">Account: 1010-CASH-PESAPAL</div>
                <div className="text-emerald-400 font-bold">Status: Active & Reconciled</div>
              </div>

              <div className="p-4 bg-slate-950/70 border border-white/10 rounded-xl space-y-2">
                <span className="font-bold text-white block">Bank Wire Clearing Account</span>
                <div className="font-mono text-xs text-gray-400">Account: 1020-CASH-BANK-TRANSFER</div>
                <div className="text-brand-cyan font-bold">Status: Mode B Statement Verification</div>
              </div>

              <div className="p-4 bg-slate-950/70 border border-white/10 rounded-xl space-y-2">
                <span className="font-bold text-white block">Creator Payable Clearing</span>
                <div className="font-mono text-xs text-gray-400">Account: 2020-LIABILITY-CREATOR-PAYABLE</div>
                <div className="text-purple-300 font-bold">Status: 14-Day Hold Enforcement</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: CENTRALIZED REVENUE POLICY & SPLIT CALCULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'revenue_policy' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Statutory Disclosure Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-900/40 text-xs text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white block">Statutory Operating Notice</span>
              <p>
                CATALYX is developed and operated under the <strong className="text-white">VINEXSAH TECHNOLOGIES</strong> project.
              </p>
            </div>
          </div>

          {/* Core Authoritative Platform Fee Rules (0.25% / 0.27% / 0.50%) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Individual Account</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                  {revenuePolicyEngine.getActiveConfig().individualFeePercent}% Platform Fee
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {revenuePolicyEngine.getActiveConfig().individualFeePercent}% <span className="text-xs text-gray-400 font-normal">CATALYX share</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Standard users and independent creators retain <strong className="text-emerald-400 font-bold">{(100 - revenuePolicyEngine.getActiveConfig().individualFeePercent).toFixed(2)}%</strong> of eligible gross platform earnings
                prior to applicable third-party gateway deductions.
              </p>
              <div className="pt-2 border-t border-white/10 flex justify-between text-[11px] text-gray-400 font-mono">
                <span>Gross: 100%</span>
                <span className="text-amber-300">Platform: {revenuePolicyEngine.getActiveConfig().individualFeePercent}%</span>
                <span className="text-emerald-400">Creator: {(100 - revenuePolicyEngine.getActiveConfig().individualFeePercent).toFixed(2)}%</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Group / Syndicate</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold">
                  {revenuePolicyEngine.getActiveConfig().groupFeePercent}% Platform Fee
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {revenuePolicyEngine.getActiveConfig().groupFeePercent}% <span className="text-xs text-gray-400 font-normal">CATALYX share</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Collaborative teams and multi-seat guilds contribute a <strong className="text-blue-400 font-bold">{revenuePolicyEngine.getActiveConfig().groupFeePercent}%</strong> platform fee,
                retaining <strong className="text-emerald-400 font-bold">{(100 - revenuePolicyEngine.getActiveConfig().groupFeePercent).toFixed(2)}%</strong> of gross earnings.
              </p>
              <div className="pt-2 border-t border-white/10 flex justify-between text-[11px] text-gray-400 font-mono">
                <span>Gross: 100%</span>
                <span className="text-blue-300">Platform: {revenuePolicyEngine.getActiveConfig().groupFeePercent}%</span>
                <span className="text-emerald-400">Team: {(100 - revenuePolicyEngine.getActiveConfig().groupFeePercent).toFixed(2)}%</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-300">Organization / Enterprise</span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
                  {revenuePolicyEngine.getActiveConfig().organizationFeePercent}% Platform Fee
                </span>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {revenuePolicyEngine.getActiveConfig().organizationFeePercent}% <span className="text-xs text-gray-400 font-normal">CATALYX share</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                Institutional, enterprise, and corporate workspaces contribute a <strong className="text-purple-400 font-bold">{revenuePolicyEngine.getActiveConfig().organizationFeePercent}%</strong> platform fee,
                retaining <strong className="text-emerald-400 font-bold">{(100 - revenuePolicyEngine.getActiveConfig().organizationFeePercent).toFixed(2)}%</strong> of gross earnings.
              </p>
              <div className="pt-2 border-t border-white/10 flex justify-between text-[11px] text-gray-400 font-mono">
                <span>Gross: 100%</span>
                <span className="text-purple-300">Platform: {revenuePolicyEngine.getActiveConfig().organizationFeePercent}%</span>
                <span className="text-emerald-400">Org: {(100 - revenuePolicyEngine.getActiveConfig().organizationFeePercent).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Interactive Split Calculator */}
          <div className="p-6 rounded-2xl bg-slate-900/95 border border-white/10 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-brand-cyan" />
                  <span>Interactive Revenue Share & Net Earnings Simulator</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Itemized pre-payout calculation showing exact platform fee deductions and estimated seller earnings.
                </p>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded bg-slate-800 text-gray-300 font-mono border border-white/10">
                Server-Authoritative Engine v2026.3
              </span>
            </div>

            {/* Calculator Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Sale Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={calcAmount}
                    onChange={e => setCalcAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-brand-purple"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Currency</label>
                <select
                  value={calcCurrency}
                  onChange={e => setCalcCurrency(e.target.value as any)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-brand-purple cursor-pointer"
                >
                  {ALL_CURRENCIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Seller Account Classification</label>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-white/15">
                  <button
                    type="button"
                    onClick={() => setCalcSellerType('INDIVIDUAL')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                      calcSellerType === 'INDIVIDUAL'
                        ? 'bg-brand-purple text-white shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Individual (0.25%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcSellerType('GROUP')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                      calcSellerType === 'GROUP'
                        ? 'bg-brand-purple text-white shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Group (0.27%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcSellerType('ORGANIZATION')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                      calcSellerType === 'ORGANIZATION'
                        ? 'bg-brand-purple text-white shadow'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Org (0.50%)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">Payment Rail</label>
                <select
                  value={calcChannel}
                  onChange={e => setCalcChannel(e.target.value as any)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-sm text-white font-medium focus:outline-none focus:border-brand-purple cursor-pointer"
                >
                  <option value="pesapal">Pesapal v3 (Card & Mobile Money)</option>
                  <option value="bank_transfer">Direct Bank Transfer (Mode B Wire)</option>
                </select>
              </div>
            </div>

            {/* Itemized Calculation Breakdown Table */}
            {calcResult && (
              <div className="rounded-xl border border-white/10 bg-slate-950/80 overflow-hidden space-y-0">
                <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs font-semibold text-white">
                  <span>Authoritative Split Breakdown</span>
                  <span className="font-mono text-gray-400">Policy: {calcResult.platformPolicyVersion}</span>
                </div>

                <div className="divide-y divide-white/5 text-xs text-gray-300">
                  <div className="p-3.5 flex justify-between items-center">
                    <span className="text-gray-400">Gross Sale Amount:</span>
                    <strong className="font-mono text-white text-sm">
                      {calcResult.currency} {(calcResult.grossSaleAmountMinorUnits / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>

                  <div className="p-3.5 flex justify-between items-center bg-purple-950/10">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-purple" />
                      <span className="text-purple-300 font-medium">
                        CATALYX Platform Fee ({calcResult.catalyxFeePercent}%):
                      </span>
                    </div>
                    <span className="font-mono text-purple-300 font-bold">
                      - {calcResult.currency} {(calcResult.catalyxFeeMinorUnits / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3.5 flex justify-between items-center">
                    <span className="text-gray-400">Estimated Gateway Processing Fee (Pesapal / Bank):</span>
                    <span className="font-mono text-gray-300">
                      - {calcResult.currency} {(calcResult.estimatedGatewayFeeMinorUnits / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3.5 flex justify-between items-center">
                    <span className="text-gray-400">Applicable Taxes (Pre-payout withholding):</span>
                    <span className="font-mono text-gray-300">
                      - {calcResult.currency} {(calcResult.taxMinorUnits / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-3.5 flex justify-between items-center">
                    <span className="text-gray-400">Refund / Chargeback Adjustments:</span>
                    <span className="font-mono text-gray-300">
                      - {calcResult.currency} {(calcResult.refundAdjustmentMinorUnits / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-4 flex justify-between items-center bg-emerald-950/20 border-t border-emerald-500/30">
                    <div>
                      <span className="text-sm font-bold text-emerald-300 block">
                        Estimated Net Seller Earnings:
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {calcResult.sellerAccountType === 'ORGANIZATION' ? '99.50% Organization Share' : (calcResult.sellerAccountType === 'GROUP' ? '99.73% Group Share' : '99.75% Individual Creator Share')} (post-deductions)
                      </span>
                    </div>
                    <strong className="font-mono text-xl font-extrabold text-emerald-400">
                      {calcResult.currency} {(calcResult.sellerEstimatedNetEarningsMinorUnits / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>
                </div>

                {/* Pre-payout Disclaimer Box */}
                <div className="p-4 bg-slate-900 text-[11px] text-gray-400 border-t border-white/10 leading-relaxed">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{calcResult.legalDisclaimer}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHECKOUT MODAL WITH DUAL CHANNEL SELECTION */}
      {/* ========================================================================= */}
      {checkoutModalPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-white/15 space-y-5 animate-in fade-in duration-150 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-brand-cyan" />
                <h3 className="text-base font-bold text-white">CATALYX V29 Secure Checkout</h3>
              </div>
              <button onClick={() => setCheckoutModalPlan(null)} className="text-gray-400 hover:text-white cursor-pointer">✕</button>
            </div>

            {/* Selected Plan Details */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Selected Tier:</span>
                <strong className="text-white">{checkoutModalPlan.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Billing Cycle:</span>
                <strong className="text-white capitalize">{billingPeriod}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Server-Authoritative Price:</span>
                <strong className="text-brand-cyan text-sm">
                  {currency} {calculatePlanPrice(checkoutModalPlan).toLocaleString()}
                </strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10">
                <span className="text-gray-400">Customer Account:</span>
                <strong className="text-white truncate">{userEmail}</strong>
              </div>
            </div>

            {/* Channel Selector (Pesapal vs Bank Transfer) */}
            {!activePaymentIntent && (
              <div className="space-y-2 text-xs">
                <label className="block text-gray-300 font-bold uppercase text-[10px] tracking-wider">
                  Select Payment Channel:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedChannel('pesapal')}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      selectedChannel === 'pesapal'
                        ? 'bg-brand-purple/20 border-brand-purple ring-2 ring-brand-purple/30'
                        : 'bg-slate-950/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Pesapal API v3</span>
                      <CreditCard className="w-4 h-4 text-brand-cyan" />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1">
                      Cards, M-Pesa, Airtel Money, Mobile Wallets
                    </span>
                  </div>

                  <div
                    onClick={() => setSelectedChannel('bank_transfer')}
                    className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      selectedChannel === 'bank_transfer'
                        ? 'bg-brand-purple/20 border-brand-purple ring-2 ring-brand-purple/30'
                        : 'bg-slate-950/60 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Bank Wire / Transfer</span>
                      <Landmark className="w-4 h-4 text-purple-300" />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1">
                      Direct ACH / RTGS / SWIFT wire clearing
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Active Payment Intent Awaiting Completion */}
            {activePaymentIntent && (
              <div className="p-4 bg-slate-950/80 border border-brand-purple/30 rounded-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Authoritative Order Generated</span>
                  <span className="font-mono text-[11px] text-brand-cyan font-bold">{activePaymentIntent.merchantReference}</span>
                </div>

                {activePaymentIntent.channel === 'pesapal' && activePaymentIntent.redirectUrl && (
                  <div className="pt-2">
                    <a
                      href={activePaymentIntent.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-purple text-white rounded-xl font-bold hover:bg-brand-purple/90 transition shadow-md"
                    >
                      <span>Proceed to Pesapal Gateway</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {activePaymentIntent.channel === 'bank_transfer' && (
                  <div className="space-y-3 pt-2">
                    <div className="p-3 bg-slate-900 rounded-xl border border-white/10 text-gray-300 space-y-1">
                      <div className="font-bold text-white">Wire Remittance Instructions:</div>
                      <div>Beneficiary: <strong className="text-white">CATALYX Enterprise Technologies Escrow</strong></div>
                      <div>Bank: <strong className="text-white">{receivingAccounts[0]?.bankName || 'JPMorgan Chase'}</strong></div>
                      <div>Account: <strong className="text-white">{receivingAccounts[0]?.accountNumberMasked || '****9876'}</strong></div>
                      <div>Payment Reference / Memo: <strong className="font-mono text-brand-cyan">{activePaymentIntent.merchantReference}</strong></div>
                    </div>

                    {/* Customer Bank Transfer Slip Submission Form */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <div className="font-bold text-white">Submit Transfer Verification Reference:</div>
                      <input
                        type="text"
                        placeholder="Wire / Transfer Confirmation Number"
                        value={wireTransferRef}
                        onChange={e => setWireTransferRef(e.target.value)}
                        className="w-full px-3 py-1.5 border border-white/10 bg-slate-950/80 rounded-xl text-xs text-white placeholder-gray-500 font-mono focus:outline-none focus:border-brand-cyan"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Your Remitting Bank Name"
                          value={wireSenderBank}
                          onChange={e => setWireSenderBank(e.target.value)}
                          className="px-3 py-1.5 border border-white/10 bg-slate-950/80 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                        />
                        <input
                          type="text"
                          placeholder="Account Holder Name"
                          value={wireSenderName}
                          onChange={e => setWireSenderName(e.target.value)}
                          className="px-3 py-1.5 border border-white/10 bg-slate-950/80 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan"
                        />
                      </div>
                      <button
                        onClick={handleSubmitWireRemittance}
                        disabled={isProcessing || !wireTransferRef}
                        className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-500 transition disabled:opacity-40 cursor-pointer shadow-md"
                      >
                        Submit Wire Slip For Statement Verification
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutModalPlan(null)}
                disabled={isProcessing}
                className="px-4 py-2 border border-white/10 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                Close
              </button>
              
              {!activePaymentIntent ? (
                <button
                  type="button"
                  onClick={handleInitiateOrder}
                  disabled={isProcessing}
                  className="px-5 py-2 bg-brand-purple text-white rounded-xl text-xs font-bold hover:bg-brand-purple/90 transition flex items-center gap-2 shadow-md disabled:opacity-40 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate {selectedChannel === 'bank_transfer' ? 'Wire Order' : 'Pesapal Checkout'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              ) : activePaymentIntent.channel === 'pesapal' ? (
                <button
                  type="button"
                  onClick={() => handleVerifyPendingPayment()}
                  disabled={isProcessing}
                  className="px-5 py-2 bg-white/10 text-white border border-white/15 rounded-xl text-xs font-bold hover:bg-white/20 transition flex items-center gap-2 shadow-md disabled:opacity-40 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Verifying with Pesapal...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan" />
                      <span>Verify & Unlock Plan</span>
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
