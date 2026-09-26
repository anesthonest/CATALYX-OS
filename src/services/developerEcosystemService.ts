import { DeveloperProject, ExtensionContract } from '../types';

const STORAGE_KEYS = {
  PROJECTS: 'catalyx_v10_developer_projects',
  CONTRACTS: 'catalyx_v10_extension_contracts',
};

export class DeveloperEcosystemService {
  public static getProjects(developerId: string): DeveloperProject[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { console.error(e); }
    }

    // Load webhook signing secrets dynamically from environment variables or internal token formats
    const prodWebhookSecret = (typeof process !== 'undefined' && process.env?.CATALYX_WEBHOOK_SECRET)
      ? process.env.CATALYX_WEBHOOK_SECRET
      : 'ctx_wh_sec_prod_enterprise';

    const sandboxWebhookSecret = (typeof process !== 'undefined' && process.env?.CATALYX_WEBHOOK_SECRET_SANDBOX)
      ? process.env.CATALYX_WEBHOOK_SECRET_SANDBOX
      : 'ctx_wh_sec_sandbox_ci';

    const defaultProjects: DeveloperProject[] = [
      {
        projectId: 'proj_dev_enterprise_sdk',
        developerId,
        name: 'Enterprise Core API Client Integration',
        environment: 'production',
        apiKeySnippet: 'cat_live_9f83...a72d',
        oauthClientId: 'client_vinexsah_prod_001',
        scopes: ['read:organization', 'write:workflows', 'execute:agents', 'read:knowledge'],
        rateLimitRpm: 1200,
        webhookUrl: 'https://api.vinexsah.com/v10/webhooks/listener',
        webhookSecret: prodWebhookSecret,
        monthlyUsageCredits: 500000,
        activeTokensCount: 42,
        registeredAppsCount: 3,
        createdAt: '2026-03-01T00:00:00Z',
      },
      {
        projectId: 'proj_dev_sandbox_testing',
        developerId,
        name: 'Automated CI/CD Sandbox Environment',
        environment: 'sandbox',
        apiKeySnippet: 'cat_test_4b2c...9e1f',
        oauthClientId: 'client_sandbox_ci_002',
        scopes: ['read:all', 'write:all', 'sandbox:simulate'],
        rateLimitRpm: 300,
        webhookUrl: 'https://sandbox.vinexsah.com/ci/webhooks',
        webhookSecret: sandboxWebhookSecret,
        monthlyUsageCredits: 100000,
        activeTokensCount: 5,
        registeredAppsCount: 1,
        createdAt: '2026-07-15T00:00:00Z',
      },
    ];

    this.saveProjects(defaultProjects);
    return defaultProjects;
  }

  public static getExtensionContracts(): ExtensionContract[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { console.error(e); }
    }

    const defaultContracts: ExtensionContract[] = [
      {
        contractId: 'contract_ext_agent_standard',
        name: 'Governed AI Agent Extension Contract v10',
        extensionType: 'agent',
        declaredCapabilities: ['natural_language_reasoning', 'structured_plan_generation', 'tool_execution', 'state_reflection'],
        requiredPermissions: ['READ_ORGANIZATION_METRICS', 'WRITE_WORKFLOW_STATE'],
        dependencies: ['@google/genai@^0.1.1', 'catalyx-core-sdk@^10.0'],
        supportedVersions: ['10.0.0', '10.1.0-alpha'],
        securityRequirements: ['SANDBOX_MEMORY_ENFORCEMENT', 'NO_UNSUPERVISED_NETWORK_EGRESS', 'TOKEN_USAGE_CEILING'],
        resourceQuotas: {
          maxMemoryMb: 512,
          maxTimeoutSec: 60,
        },
      },
      {
        contractId: 'contract_ext_connector_pesapal',
        name: 'FinTech Payment Gateway Standard Contract',
        extensionType: 'connector',
        declaredCapabilities: ['ipn_processing', 'payment_authorization', 'reconciliation_reporting'],
        requiredPermissions: ['PROCESS_PAYMENTS', 'MANAGE_FINANCIAL_LEDGER'],
        dependencies: ['pesapal-v3-spec@3.4.0'],
        supportedVersions: ['10.0.0'],
        securityRequirements: ['HMAC_SIGNATURE_VERIFICATION', 'IDEMPOTENCY_TOKEN_CHECK', 'PCI_DSS_LOG_REDACTION'],
        resourceQuotas: {
          maxMemoryMb: 256,
          maxTimeoutSec: 15,
        },
      },
      {
        contractId: 'contract_ext_workflow_template',
        name: 'Autonomous Multi-Stage Workflow Blueprint',
        extensionType: 'workflow',
        declaredCapabilities: ['dag_step_execution', 'checkpoint_resumption', 'compensating_transaction'],
        requiredPermissions: ['EXECUTE_CHILD_STEPS', 'NOTIFY_APPROVERS'],
        dependencies: ['catalyx-workflow-engine@^10.0'],
        supportedVersions: ['9.0.0', '10.0.0'],
        securityRequirements: ['SAFETY_GATE_COMPLIANCE', 'MAX_PARALLEL_BRANCHES_CAP_10'],
        resourceQuotas: {
          maxMemoryMb: 1024,
          maxTimeoutSec: 300,
        },
      },
    ];

    this.saveContracts(defaultContracts);
    return defaultContracts;
  }

  public static createProject(project: Omit<DeveloperProject, 'projectId' | 'createdAt'>): DeveloperProject {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    const list: DeveloperProject[] = raw ? JSON.parse(raw) : [];
    const newProj: DeveloperProject = {
      ...project,
      projectId: `proj_dev_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newProj);
    this.saveProjects(list);
    return newProj;
  }

  private static saveProjects(projects: DeveloperProject[]): void {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  private static saveContracts(contracts: ExtensionContract[]): void {
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
  }
}
