import React, { useState } from 'react';
import { 
  UserProfile, 
  UserPersonaRole 
} from '../types';
import { 
  unifiedCommerceService, 
  CommerceOrder, 
  CommerceCustomer, 
  CommerceProduct, 
  OrderLifecycleState 
} from '../services/unifiedCommerceService';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Plus, 
  Search, 
  UserCheck, 
  ShieldCheck, 
  DollarSign, 
  Receipt, 
  RefreshCw,
  Eye,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface UnifiedCommerceViewProps {
  user: UserProfile;
  activeRole: UserPersonaRole;
  onNavigate: (tabId: string) => void;
}

export const UnifiedCommerceView: React.FC<UnifiedCommerceViewProps> = ({
  user,
  activeRole,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'customers' | 'products'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<CommerceOrder | null>(null);
  const [transitionNote, setTransitionNote] = useState('');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const metrics = unifiedCommerceService.getCommerceMetrics();
  const orders = unifiedCommerceService.getOrders();
  const customers = unifiedCommerceService.getCustomers();
  const products = unifiedCommerceService.getProducts();

  const handleAdvanceOrder = (orderId: string, nextStatus: OrderLifecycleState) => {
    const res = unifiedCommerceService.transitionOrderStatus(
      orderId,
      nextStatus,
      user.username || 'Operator',
      transitionNote.trim() || `Advanced to ${nextStatus}`
    );

    if (res.success) {
      setActionFeedback(res.message);
      setTransitionNote('');
      if (res.updatedOrder) {
        setSelectedOrder(res.updatedOrder);
      }
    } else {
      setActionFeedback(`Error: ${res.message}`);
    }
  };

  const handleAssignWorker = (orderId: string) => {
    unifiedCommerceService.assignWorkerToOrder(
      orderId,
      user.uid,
      user.username || 'Operator',
      'fulfillment'
    );
    setActionFeedback(`Order assigned to ${user.username || 'current operator'} for fulfillment.`);
  };

  const filteredOrders = orders.filter(o => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q)
    );
  });

  const filteredCustomers = customers.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: OrderLifecycleState) => {
    switch (status) {
      case 'PAID':
      case 'FULFILLED':
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">{status}</span>;
      case 'PROCESSING':
      case 'CONFIRMED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30">{status}</span>;
      case 'PAYMENT_PENDING':
      case 'CREATED':
      case 'DRAFT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">{status}</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn">
      {/* 1. Top Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-emerald-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" />
              INTEGRATED COMMERCE & CRM
            </span>
            <span className="text-xs text-gray-400 font-mono">
              Core Platform Operating Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Commercial Operations & CRM
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl">
            Complete lifecycle commerce operating within the universal dashboard. Track verified orders, customer CRM history, worker fulfillment assignments, and zero-drift Pesapal ledger collections.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('billing')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 border border-white/10 text-white hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            Pesapal Gateway
          </button>
          <button
            onClick={() => onNavigate('reconciliation')}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Receipt className="w-3.5 h-3.5" />
            Ledger Reconciliation
          </button>
        </div>
      </div>

      {/* 2. Primary KPI Telemetry Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-gray-400 uppercase">Actual Revenue</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">ACTUAL</span>
          </div>
          <div className="text-2xl font-bold text-white mt-1">
            ${metrics.actualRevenueUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-400 font-mono mt-1 block">
            {metrics.paidOrderCount} settled orders in ledger
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-gray-400 uppercase">Pending Pipeline</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-400 font-bold">ESTIMATED</span>
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            ${metrics.estimatedPipelineUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-gray-400 font-mono mt-1 block">
            Awaiting checkout / IPN confirmation
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-gray-400 uppercase">Customers</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/20 text-blue-400 font-bold">CRM</span>
          </div>
          <div className="text-2xl font-bold text-brand-cyan mt-1">
            {metrics.customerCount} Accounts
          </div>
          <span className="text-[11px] text-brand-cyan font-mono mt-1 block">
            Active Enterprise & Growth Tiers
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-gray-400 uppercase">Products</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-400 font-bold">CATALOG</span>
          </div>
          <div className="text-2xl font-bold text-brand-purple mt-1">
            {metrics.productCount} Active SKUs
          </div>
          <span className="text-[11px] text-purple-300 font-mono mt-1 block">
            Software, Twins & Edge Gateways
          </span>
        </div>
      </div>

      {/* 3. Sub-Nav & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Orders & Fulfillment ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Customer CRM ({customers.length})
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'products'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            Products & Inventory ({products.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search orders, customers, SKUs..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/80 border border-white/15 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
          <span>{actionFeedback}</span>
          <button onClick={() => setActionFeedback(null)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      {/* 4. Sub-Tab Content */}

      {/* ORDERS & FULFILLMENT TAB */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Orders Table (7 Cols) */}
          <div className="lg:col-span-7 glass-panel rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-slate-950/60 flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-gray-400">
                Order Registry & Lifecycle
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                Double-Entry Ledger Verified
              </span>
            </div>

            <div className="divide-y divide-white/5">
              {filteredOrders.map((ord) => {
                const isSelected = selectedOrder?.id === ord.id;
                return (
                  <button
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className={`w-full text-left p-4 transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected ? 'bg-emerald-500/10 border-l-2 border-emerald-400' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">{ord.orderNumber}</span>
                        {getStatusBadge(ord.status)}
                      </div>
                      <span className="text-xs font-bold text-white font-mono">
                        ${(ord.totalMinorUnits / 100).toFixed(2)} {ord.currency}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Customer: <strong className="text-gray-200">{ord.customerName}</strong></span>
                      <span className="font-mono text-[10px]">{new Date(ord.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono pt-1">
                      <span>Items: {ord.items.length}</span>
                      <span>Assigned: <strong className="text-brand-cyan">{ord.assignedWorkerName || 'Unassigned'}</strong></span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Order Detail Inspector & Lifecycle Advancer (5 Cols) */}
          <div className="lg:col-span-5 glass-panel rounded-2xl border border-white/10 p-5 space-y-5">
            {selectedOrder ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-base font-bold text-white font-mono">{selectedOrder.orderNumber}</h3>
                    <div className="text-xs text-gray-400">Payment: {selectedOrder.paymentMethod}</div>
                  </div>
                  {getStatusBadge(selectedOrder.status)}
                </div>

                {/* Items Summary */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-gray-400 block">Line Items</span>
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-white/5 bg-slate-950/60 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">{it.productTitle}</div>
                        <div className="text-[10px] text-gray-400 font-mono">Qty: {it.quantity} • SKU: {it.sku}</div>
                      </div>
                      <div className="font-mono text-white">
                        ${(it.totalPriceMinorUnits / 100).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Worker Assignment Card */}
                <div className="p-3 rounded-xl border border-white/10 bg-slate-950/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 uppercase block">Fulfillment Worker</span>
                    <span className="text-xs font-bold text-white">
                      {selectedOrder.assignedWorkerName ? selectedOrder.assignedWorkerName : 'Not yet assigned'}
                    </span>
                  </div>
                  {!selectedOrder.assignedWorkerName && (
                    <button
                      onClick={() => handleAssignWorker(selectedOrder.id)}
                      className="px-2.5 py-1 rounded-lg bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan text-xs font-semibold cursor-pointer"
                    >
                      Assign to Me
                    </button>
                  )}
                </div>

                {/* State Machine Transition Actions */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[10px] font-mono uppercase text-gray-400 block">
                    Advance Lifecycle State
                  </span>

                  <input
                    type="text"
                    value={transitionNote}
                    onChange={(e) => setTransitionNote(e.target.value)}
                    placeholder="Audit note for state change (optional)..."
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-white/15 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />

                  <div className="flex flex-wrap gap-2 pt-1">
                    {selectedOrder.status === 'PAID' && (
                      <button
                        onClick={() => handleAdvanceOrder(selectedOrder.id, 'PROCESSING')}
                        className="px-3 py-1.5 rounded-xl bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan text-xs font-bold hover:bg-brand-cyan/30 cursor-pointer"
                      >
                        Start Processing
                      </button>
                    )}
                    {selectedOrder.status === 'PROCESSING' && (
                      <button
                        onClick={() => handleAdvanceOrder(selectedOrder.id, 'FULFILLED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 cursor-pointer"
                      >
                        Mark Fulfilled
                      </button>
                    )}
                    {selectedOrder.status === 'FULFILLED' && (
                      <button
                        onClick={() => handleAdvanceOrder(selectedOrder.id, 'COMPLETED')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 cursor-pointer"
                      >
                        Complete Order
                      </button>
                    )}
                    <button
                      onClick={() => handleAdvanceOrder(selectedOrder.id, 'CANCELLED')}
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Audit Timeline */}
                <div className="space-y-1.5 pt-2 border-t border-white/10">
                  <span className="text-[10px] font-mono uppercase text-gray-400 block">Audit Trail</span>
                  {selectedOrder.timeline.map((item, idx) => (
                    <div key={idx} className="text-[11px] text-gray-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <div>
                        <strong>{item.status}</strong> by {item.changedBy} • {item.note}
                        <span className="block text-[10px] text-gray-500 font-mono">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-gray-400 text-xs">
                Select an order from the list to view items, customer coordinates, and state controls.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CUSTOMER CRM TAB */}
      {activeTab === 'customers' && (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-cyan" />
              Customer Relationship Management (CRM)
            </h3>
            <span className="text-xs text-gray-400 font-mono">
              Zero-Inference Grounded CRM
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map((cust) => (
              <div key={cust.id} className="p-4 rounded-xl border border-white/5 bg-slate-950/60 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{cust.name}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-brand-cyan/20 text-brand-cyan font-bold">
                      {cust.tier}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-300 font-medium mt-0.5">{cust.company}</div>
                  <div className="text-[10px] text-gray-400 font-mono mt-1">Email: {cust.email}</div>
                  <div className="text-[10px] text-gray-400 font-mono">Phone: {cust.phone}</div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-gray-400">Total Spend:</span>
                  <span className="text-emerald-400 font-bold">
                    ${(cust.totalSpendMinorUnits / 100).toFixed(2)} USD
                  </span>
                </div>

                <div className="text-[10px] text-gray-400 font-mono flex items-center justify-between">
                  <span>Assigned: <strong className="text-white">{cust.assignedWorkerName || 'Operations'}</strong></span>
                  <span className="text-brand-purple">via {cust.communicationPreference}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRODUCTS & INVENTORY TAB */}
      {activeTab === 'products' && (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-400" />
              Products, Licenses & Hardware Catalog
            </h3>
            <span className="text-xs text-gray-400 font-mono">
              Integer Cents Pricing Engine
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {products.map((prod) => (
              <div key={prod.id} className="p-4 rounded-xl border border-white/5 bg-slate-950/60 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">{prod.sku}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300">
                      {prod.isDigital ? 'Digital Good' : 'Hardware'}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mt-1">{prod.title}</h4>
                  <p className="text-[11px] text-gray-300 mt-1 leading-relaxed line-clamp-2">{prod.description}</p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-gray-400">Inventory: {prod.inventoryCount}</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    ${(prod.priceMinorUnits / 100).toFixed(2)} USD
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
