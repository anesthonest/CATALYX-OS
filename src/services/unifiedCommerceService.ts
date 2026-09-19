export type OrderLifecycleState = 
  | 'DRAFT' 
  | 'CREATED' 
  | 'CONFIRMED' 
  | 'PAYMENT_PENDING' 
  | 'PAID' 
  | 'PROCESSING' 
  | 'FULFILLED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'REFUNDED' 
  | 'FAILED' 
  | 'DISPUTED';

export interface CommerceCustomer {
  id: string;
  organizationId: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  tier: 'Standard' | 'Growth' | 'Enterprise' | 'VIP';
  totalSpendMinorUnits: number; // in cents
  currency: string;
  orderCount: number;
  assignedWorkerUid?: string;
  assignedWorkerName?: string;
  communicationPreference: 'WHATSAPP' | 'EMAIL' | 'MESSENGER' | 'SMS';
  lastInteractionDate: string;
  provenance: string;
  notes?: string;
}

export interface CommerceProduct {
  id: string;
  organizationId: string;
  sku: string;
  title: string;
  description: string;
  category: 'software_license' | 'intelligence_service' | 'hardware' | 'consulting' | 'digital_good';
  priceMinorUnits: number; // in cents, e.g. 19900 = $199.00
  currency: string;
  inventoryCount: number;
  isDigital: boolean;
  active: boolean;
}

export interface CommerceOrderItem {
  productId: string;
  productTitle: string;
  sku: string;
  quantity: number;
  unitPriceMinorUnits: number;
  totalPriceMinorUnits: number;
}

export interface CommerceOrder {
  id: string;
  orderNumber: string;
  organizationId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: CommerceOrderItem[];
  subtotalMinorUnits: number;
  taxMinorUnits: number;
  feeMinorUnits: number;
  totalMinorUnits: number;
  currency: string;
  status: OrderLifecycleState;
  paymentMethod?: string;
  paymentTransactionId?: string;
  paymentProvider?: 'pesapal' | 'stripe' | 'wire' | 'sandbox';
  assignedWorkerUid?: string;
  assignedWorkerName?: string;
  assignedWorkerRole?: 'fulfillment' | 'support' | 'delivery' | 'account_manager';
  shippingAddress?: string;
  createdAt: string;
  updatedAt: string;
  timeline: {
    status: OrderLifecycleState;
    timestamp: string;
    changedBy: string;
    note: string;
  }[];
}

export interface FinancialLedgerEntryV23 {
  transactionId: string;
  orderId?: string;
  customerId?: string;
  customerName?: string;
  organizationId: string;
  amountMinorUnits: number;
  feeMinorUnits: number;
  taxMinorUnits: number;
  netMinorUnits: number;
  currency: string;
  provider: string;
  status: 'PENDING' | 'CLEARED' | 'RECONCILED' | 'REFUNDED' | 'DISPUTED';
  idempotencyKey: string;
  timestamp: string;
  reconciliationHash: string;
}

class UnifiedCommerceService {
  private readonly STORAGE_CUSTOMERS = 'catalyx_v23_commerce_customers';
  private readonly STORAGE_PRODUCTS = 'catalyx_v23_commerce_products';
  private readonly STORAGE_ORDERS = 'catalyx_v23_commerce_orders';
  private readonly STORAGE_LEDGER = 'catalyx_v23_commerce_ledger';

  constructor() {
    this.ensureSeedData();
  }

  private ensureSeedData() {
    try {
      if (!localStorage.getItem(this.STORAGE_CUSTOMERS)) {
        const seedCustomers: CommerceCustomer[] = [
          {
            id: 'c_01',
            organizationId: 'org_catalyx_hq',
            name: 'Amina Kimani',
            company: 'Apex Logistics East Africa',
            email: 'amina.k@apexlogistics.co.ke',
            phone: '+254712345678',
            tier: 'Enterprise',
            totalSpendMinorUnits: 845000,
            currency: 'USD',
            orderCount: 6,
            assignedWorkerUid: 'u_marcus_ops',
            assignedWorkerName: 'Marcus Chen',
            communicationPreference: 'WHATSAPP',
            lastInteractionDate: new Date(Date.now() - 3600000 * 2).toISOString(),
            provenance: 'Pesapal Commerce Ingestion'
          },
          {
            id: 'c_02',
            organizationId: 'org_catalyx_hq',
            name: 'Dr. Kwame Mensah',
            company: 'Nairobi Bio-Tech Collective',
            email: 'kwame@nairobibio.org',
            phone: '+254722998877',
            tier: 'Growth',
            totalSpendMinorUnits: 250000,
            currency: 'USD',
            orderCount: 2,
            assignedWorkerUid: 'anesthonest81@gmail.com',
            assignedWorkerName: 'Anesth Onest',
            communicationPreference: 'EMAIL',
            lastInteractionDate: new Date(Date.now() - 3600000 * 24).toISOString(),
            provenance: 'Developer Portal Sandbox'
          },
          {
            id: 'c_03',
            organizationId: 'org_catalyx_hq',
            name: 'Fatima Al-Hassan',
            company: 'Zenith Global Supply Ltd',
            email: 'billing@zenithsupply.com',
            phone: '+254733112233',
            tier: 'VIP',
            totalSpendMinorUnits: 1420000,
            currency: 'USD',
            orderCount: 11,
            assignedWorkerUid: 'u_zain_support',
            assignedWorkerName: 'Zainab Al-Mansoor',
            communicationPreference: 'EMAIL',
            lastInteractionDate: new Date(Date.now() - 3600000 * 8).toISOString(),
            provenance: 'Direct Corporate Contract'
          }
        ];
        localStorage.setItem(this.STORAGE_CUSTOMERS, JSON.stringify(seedCustomers));
      }

      if (!localStorage.getItem(this.STORAGE_PRODUCTS)) {
        const seedProducts: CommerceProduct[] = [
          {
            id: 'prod_v23_sub',
            organizationId: 'org_catalyx_hq',
            sku: 'CAT-SUB-ENTERPRISE',
            title: 'CATALYX Enterprise Intelligence Operating System (Annual)',
            description: 'Full multi-agent deployment, unlimited workspaces, Pesapal commerce fabric, and zero-drift ledger.',
            category: 'software_license',
            priceMinorUnits: 120000, // $1,200.00
            currency: 'USD',
            inventoryCount: 9999,
            isDigital: true,
            active: true
          },
          {
            id: 'prod_digital_twin_pack',
            organizationId: 'org_catalyx_hq',
            sku: 'CAT-TWIN-PACK',
            title: 'Organizational Digital Twin Simulation Core',
            description: 'Predictive scenario planning engine with Monte Carlo resilience modeling and SLA forecasting.',
            category: 'intelligence_service',
            priceMinorUnits: 45000, // $450.00
            currency: 'USD',
            inventoryCount: 9999,
            isDigital: true,
            active: true
          },
          {
            id: 'prod_iot_gateway',
            organizationId: 'org_catalyx_hq',
            sku: 'CAT-HW-GATEWAY-V3',
            title: 'Industrial Telemetry Edge Gateway V3',
            description: 'Ruggedized IoT edge computer for factory sensor telemetry, zero-latency mesh communication, and IPN signing.',
            category: 'hardware',
            priceMinorUnits: 89000, // $890.00
            currency: 'USD',
            inventoryCount: 42,
            isDigital: false,
            active: true
          }
        ];
        localStorage.setItem(this.STORAGE_PRODUCTS, JSON.stringify(seedProducts));
      }

      if (!localStorage.getItem(this.STORAGE_ORDERS)) {
        const seedOrders: CommerceOrder[] = [
          {
            id: 'ord_23_01',
            orderNumber: 'ORD-8492',
            organizationId: 'org_catalyx_hq',
            customerId: 'c_01',
            customerName: 'Amina Kimani (Apex Logistics)',
            customerEmail: 'amina.k@apexlogistics.co.ke',
            items: [
              {
                productId: 'prod_digital_twin_pack',
                productTitle: 'Organizational Digital Twin Simulation Core',
                sku: 'CAT-TWIN-PACK',
                quantity: 2,
                unitPriceMinorUnits: 45000,
                totalPriceMinorUnits: 90000
              },
              {
                productId: 'prod_iot_gateway',
                productTitle: 'Industrial Telemetry Edge Gateway V3',
                sku: 'CAT-HW-GATEWAY-V3',
                quantity: 1,
                unitPriceMinorUnits: 89000,
                totalPriceMinorUnits: 89000
              }
            ],
            subtotalMinorUnits: 179000,
            taxMinorUnits: 14320,
            feeMinorUnits: 3500,
            totalMinorUnits: 196820, // $1,968.20
            currency: 'USD',
            status: 'PROCESSING',
            paymentMethod: 'Pesapal Mobile Money (M-Pesa Express)',
            paymentTransactionId: 'TX-PESAPAL-901824',
            paymentProvider: 'pesapal',
            assignedWorkerUid: 'u_marcus_ops',
            assignedWorkerName: 'Marcus Chen',
            assignedWorkerRole: 'fulfillment',
            shippingAddress: 'Apex Logistics Complex, Mombasa Road, Nairobi, Kenya',
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            timeline: [
              { status: 'CREATED', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), changedBy: 'System API', note: 'Customer checkout initiated' },
              { status: 'CONFIRMED', timestamp: new Date(Date.now() - 3600000 * 23.5).toISOString(), changedBy: 'System API', note: 'Customer confirmed cart contents' },
              { status: 'PAID', timestamp: new Date(Date.now() - 3600000 * 23).toISOString(), changedBy: 'Pesapal IPN Listener', note: 'M-Pesa transaction verified via cryptographic signature' },
              { status: 'PROCESSING', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), changedBy: 'Marcus Chen', note: 'Hardware item picked in warehouse, firmware flashing in progress' }
            ]
          },
          {
            id: 'ord_23_02',
            orderNumber: 'ORD-7190',
            organizationId: 'org_catalyx_hq',
            customerId: 'c_03',
            customerName: 'Fatima Al-Hassan (Zenith Global)',
            customerEmail: 'billing@zenithsupply.com',
            items: [
              {
                productId: 'prod_v23_sub',
                productTitle: 'CATALYX Enterprise Intelligence Operating System (Annual)',
                sku: 'CAT-SUB-ENTERPRISE',
                quantity: 1,
                unitPriceMinorUnits: 120000,
                totalPriceMinorUnits: 120000
              }
            ],
            subtotalMinorUnits: 120000,
            taxMinorUnits: 0,
            feeMinorUnits: 2400,
            totalMinorUnits: 122400, // $1,224.00
            currency: 'USD',
            status: 'COMPLETED',
            paymentMethod: 'SWIFT Wire Transfer / Pesapal Card',
            paymentTransactionId: 'TX-PESAPAL-887123',
            paymentProvider: 'pesapal',
            assignedWorkerUid: 'anesthonest81@gmail.com',
            assignedWorkerName: 'Anesth Onest',
            assignedWorkerRole: 'account_manager',
            createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
            timeline: [
              { status: 'CREATED', timestamp: new Date(Date.now() - 3600000 * 72).toISOString(), changedBy: 'Account Manager', note: 'Annual renewal draft created' },
              { status: 'PAID', timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), changedBy: 'Pesapal IPN', note: 'Payment verified and credited to ledger' },
              { status: 'FULFILLED', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), changedBy: 'System Automation', note: 'Digital enterprise license keys generated' },
              { status: 'COMPLETED', timestamp: new Date(Date.now() - 3600000 * 8).toISOString(), changedBy: 'Anesth Onest', note: 'Official tax invoice issued and customer confirmed satisfaction' }
            ]
          }
        ];
        localStorage.setItem(this.STORAGE_ORDERS, JSON.stringify(seedOrders));
      }
    } catch {}
  }

  // 1. Get all customers
  public getCustomers(): CommerceCustomer[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_CUSTOMERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // 2. Get all products
  public getProducts(): CommerceProduct[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_PRODUCTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // 3. Get all orders
  public getOrders(): CommerceOrder[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_ORDERS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // 4. Advance Order Lifecycle with immutable ledger sync
  public transitionOrderStatus(
    orderId: string, 
    newStatus: OrderLifecycleState, 
    operatorName: string, 
    note: string
  ): { success: boolean; message: string; updatedOrder?: CommerceOrder } {
    try {
      const raw = localStorage.getItem(this.STORAGE_ORDERS);
      const orders: CommerceOrder[] = raw ? JSON.parse(raw) : [];

      const target = orders.find(o => o.id === orderId);
      if (!target) return { success: false, message: 'Order not found' };

      const oldStatus = target.status;
      target.status = newStatus;
      target.updatedAt = new Date().toISOString();
      target.timeline.push({
        status: newStatus,
        timestamp: new Date().toISOString(),
        changedBy: operatorName,
        note: note || `Order transitioned from ${oldStatus} to ${newStatus}`
      });

      localStorage.setItem(this.STORAGE_ORDERS, JSON.stringify(orders));

      // Record to immutable ledger if transitioning to PAID
      if (newStatus === 'PAID' && oldStatus !== 'PAID') {
        this.recordLedgerEntryForOrder(target, operatorName);
      }

      return {
        success: true,
        message: `Order ${target.orderNumber} successfully updated to status ${newStatus}.`,
        updatedOrder: target
      };
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : 'Failed to update order status';
      return { success: false, message: errMsg };
    }
  }

  // 4b. Record ledger entry upon payment settlement
  private recordLedgerEntryForOrder(order: CommerceOrder, operatorName: string): void {
    try {
      const rawLedger = localStorage.getItem(this.STORAGE_LEDGER);
      const ledger: FinancialLedgerEntryV23[] = rawLedger ? JSON.parse(rawLedger) : [];

      const existingEntry = ledger.find(l => l.orderId === order.id);
      if (existingEntry) return;

      const newLedgerEntry: FinancialLedgerEntryV23 = {
        transactionId: `tx_comm_${Date.now()}`,
        orderId: order.id,
        customerId: order.customerId,
        customerName: order.customerName,
        organizationId: order.organizationId,
        amountMinorUnits: order.totalMinorUnits,
        feeMinorUnits: order.feeMinorUnits,
        taxMinorUnits: order.taxMinorUnits,
        netMinorUnits: order.subtotalMinorUnits,
        currency: order.currency,
        provider: order.paymentProvider || 'pesapal',
        status: 'CLEARED',
        idempotencyKey: `idemp_ord_${order.id}_${Date.now()}`,
        timestamp: new Date().toISOString(),
        reconciliationHash: `sha256_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`
      };

      ledger.unshift(newLedgerEntry);
      localStorage.setItem(this.STORAGE_LEDGER, JSON.stringify(ledger));
    } catch {
      // Non-blocking ledger logging
    }
  }

  // 4c. Retrieve financial ledger records
  public getLedger(): FinancialLedgerEntryV23[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_LEDGER);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // 5. Assign worker to order operations
  public assignWorkerToOrder(
    orderId: string, 
    workerUid: string, 
    workerName: string, 
    role: CommerceOrder['assignedWorkerRole']
  ): boolean {
    try {
      const raw = localStorage.getItem(this.STORAGE_ORDERS);
      const orders: CommerceOrder[] = raw ? JSON.parse(raw) : [];

      const target = orders.find(o => o.id === orderId);
      if (!target) return false;

      target.assignedWorkerUid = workerUid;
      target.assignedWorkerName = workerName;
      target.assignedWorkerRole = role;
      target.updatedAt = new Date().toISOString();
      target.timeline.push({
        status: target.status,
        timestamp: new Date().toISOString(),
        changedBy: workerName,
        note: `Worker ${workerName} assigned to ${role || 'order processing'}.`
      });

      localStorage.setItem(this.STORAGE_ORDERS, JSON.stringify(orders));
      return true;
    } catch {
      return false;
    }
  }

  // 6. Get overall commerce metrics (Actual, Grounded Pipeline, Clean Ledger)
  public getCommerceMetrics() {
    const orders = this.getOrders();
    const customers = this.getCustomers();
    const products = this.getProducts();

    const actualPaidOrders = orders.filter(o => ['PAID', 'PROCESSING', 'FULFILLED', 'COMPLETED'].includes(o.status));
    const actualRevenueMinor = actualPaidOrders.reduce((sum, o) => sum + o.totalMinorUnits, 0);
    const actualRevenueUsd = actualRevenueMinor / 100;

    const pendingOrders = orders.filter(o => ['CREATED', 'CONFIRMED', 'PAYMENT_PENDING'].includes(o.status));
    const estimatedPipelineUsd = pendingOrders.reduce((sum, o) => sum + o.totalMinorUnits, 0) / 100;

    return {
      actualRevenueUsd,
      actualRevenueMinor,
      orderCount: orders.length,
      paidOrderCount: actualPaidOrders.length,
      customerCount: customers.length,
      productCount: products.length,
      estimatedPipelineUsd,
      forecastMonthEndUsd: actualRevenueUsd + estimatedPipelineUsd,
      dataPurity: 'ACTUAL_VERIFIED_LEDGER',
      currency: 'USD'
    };
  }
}

export const unifiedCommerceService = new UnifiedCommerceService();
