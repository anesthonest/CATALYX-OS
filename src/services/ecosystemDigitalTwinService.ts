import { EcosystemDigitalTwinScenario } from '../types';

const STORAGE_KEY = 'catalyx_v10_ecosystem_digital_twin_scenarios';

export class EcosystemDigitalTwinService {
  public static getScenarios(): EcosystemDigitalTwinScenario[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { console.error(e); }
    }

    const defaultScenarios: EcosystemDigitalTwinScenario[] = [
      {
        scenarioId: 'sim_east_africa_expansion',
        title: 'East African Cross-Border Expansion Simulation',
        scope: 'MARKET_EXPANSION',
        baselineFact: 'CATALYX is currently deployed in Uganda and Kenya with active Pesapal v3 IPN infrastructure.',
        simulationModel: 'Monte Carlo multi-currency liquidity model with mobile money settlement delay distributions (0.5s to 45s).',
        projectedOutcome: 'Expansion into Rwanda and Tanzania projected to increase transaction volume by 34% with 99.85% settlement reliability.',
        uncertaintyVariancePercent: 7.2,
        distinction: {
          fact: 'Verified historical transaction logs demonstrate 99.91% IPN delivery success in UGX and KES.',
          assumption: 'Mobile money regulatory capital requirements in Rwanda will mirror Kenya CBK guidelines.',
          simulation: '10,000 synthetic high-load spikes simulate peak Black Friday volume across 4 national telco carriers.',
          prediction: 'Projected monthly net platform commission revenue of $18,400 within 120 days post-launch.',
        },
      },
      {
        scenarioId: 'sim_autonomy_level4_rollout',
        title: 'Enterprise Autonomy Level 4 Transition Simulation',
        scope: 'TECH_ADOPTION',
        baselineFact: 'Current operations execute at Autonomy Level 3 (Human-in-the-Loop for disbursements >$500).',
        simulationModel: 'Markov decision process evaluating agent safety gate overrides vs. false-positive escalation delays.',
        projectedOutcome: 'Raising autonomous disbursement threshold to $2,500 reduces executive approval backlog by 62% without increasing risk exposure.',
        uncertaintyVariancePercent: 4.8,
        distinction: {
          fact: 'Zero financial reconciliation anomalies occurred across 28,900 Level 3 agent-prepared transactions.',
          assumption: 'Upstream vendor invoices will maintain existing cryptographic signature verification standards.',
          simulation: 'Simulated 500 adversarial prompt injections and altered invoice minor unit values against the 10-step gate.',
          prediction: 'Executive review time savings of 14.5 hours per week per department head.',
        },
      },
      {
        scenarioId: 'sim_marketplace_commission_shift',
        title: 'Marketplace Commission Elasticity Simulation',
        scope: 'PRICING_SHIFTS',
        baselineFact: 'Platform charges 15% standard commission on developer marketplace apps and agent runs.',
        simulationModel: 'Price elasticity of supply model examining external developer adoption curves under 10% vs 15% vs 20% tiers.',
        projectedOutcome: 'Introducing a tiered 10% rate for first $50k gross sales accelerates new third-party agent submissions by 45%.',
        uncertaintyVariancePercent: 6.1,
        distinction: {
          fact: 'Current marketplace ecosystem hosts 14 certified third-party developer teams.',
          assumption: 'Developer acquisition costs will decrease as network effects from knowledge graph queries mature.',
          simulation: 'Agent submission trajectory modeled across 50 regional developer guilds over 12 months.',
          prediction: 'Net ecosystem gross merchandise value (GMV) projected to reach $1.2M within 18 months.',
        },
      },
    ];

    this.saveScenarios(defaultScenarios);
    return defaultScenarios;
  }

  public static simulateCustomScenario(scenario: Omit<EcosystemDigitalTwinScenario, 'scenarioId'>): EcosystemDigitalTwinScenario {
    const list = this.getScenarios();
    const newSim: EcosystemDigitalTwinScenario = {
      ...scenario,
      scenarioId: `sim_${Date.now()}`,
    };
    list.unshift(newSim);
    this.saveScenarios(list);
    return newSim;
  }

  private static saveScenarios(list: EcosystemDigitalTwinScenario[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}
