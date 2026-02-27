import formatINR from '../utils/formatCurrency';

export interface MaintenancePlanTier {
  tierName: string;
  minPriceINR: number;
  maxPriceINR: number;
  description: string;
  features: string[];
}

export interface MaintenancePlanCategory {
  categoryId: string;
  categoryName: string;
  icon: string;
  tiers: MaintenancePlanTier[];
}

export function formatPriceRange(min: number, max: number): string {
  return `${formatINR(min)}–${formatINR(max)}/mo`;
}

export const maintenancePlans: MaintenancePlanCategory[] = [
  {
    categoryId: 'website-maintenance',
    categoryName: 'Website Maintenance',
    icon: '💻',
    tiers: [
      {
        tierName: 'Basic / Student Websites',
        minPriceINR: 999,
        maxPriceINR: 2999,
        description: 'For Portfolio, Landing Page, WordPress Basic',
        features: ['Monthly plugin & theme updates', 'Basic security monitoring', '1–2 minor content edits', 'Speed check', 'Backup (monthly)', 'Email support'],
      },
      {
        tierName: 'Business Websites',
        minPriceINR: 3999,
        maxPriceINR: 7999,
        description: 'For Custom Website, No-Code, E-commerce Basic',
        features: ['Weekly updates', 'Security monitoring', 'Payment gateway monitoring', '4–6 content updates', 'Monthly performance optimization', 'Backup (weekly)', 'Technical support'],
      },
      {
        tierName: 'Premium / AI / 3D / Enterprise',
        minPriceINR: 10000,
        maxPriceINR: 35000,
        description: 'For AI-powered, 3D animated, and enterprise websites',
        features: ['Real-time monitoring', 'AI feature monitoring', 'Advanced speed optimization', 'Conversion tracking', 'Security firewall management', 'Server performance check', 'Priority support', 'Monthly growth report'],
      },
    ],
  },
  {
    categoryId: 'app-maintenance',
    categoryName: 'App Maintenance',
    icon: '📱',
    tiers: [
      {
        tierName: 'Basic App Support',
        minPriceINR: 2999,
        maxPriceINR: 6999,
        description: 'For No-Code App, APK, Web-to-App',
        features: ['Bug fixes', 'Minor UI updates', 'Firebase monitoring', 'Monthly performance check', 'Store compliance support'],
      },
      {
        tierName: 'Growth App Support',
        minPriceINR: 8000,
        maxPriceINR: 20000,
        description: 'For AI Apps, SaaS Basic, Business Apps',
        features: ['Feature updates', 'Database optimization', 'API monitoring', 'Crash analytics review', 'Payment system monitoring', 'Performance upgrades'],
      },
      {
        tierName: 'Enterprise App Support',
        minPriceINR: 25000,
        maxPriceINR: 75000,
        description: 'For large-scale enterprise applications',
        features: ['Dedicated tech support', 'Server scaling assistance', 'AI optimization', 'DevOps monitoring', 'Security audits', 'Monthly performance analytics'],
      },
    ],
  },
  {
    categoryId: 'ai-automation-maintenance',
    categoryName: 'AI Automation Maintenance',
    icon: '🤖',
    tiers: [
      {
        tierName: 'Basic Automation Support',
        minPriceINR: 2999,
        maxPriceINR: 7999,
        description: 'For Chatbot, WhatsApp Basic, Email Automation',
        features: ['Bot training updates', 'Flow adjustments', 'Lead tracking check', 'API reconnection support'],
      },
      {
        tierName: 'Advanced Automation Management',
        minPriceINR: 10000,
        maxPriceINR: 30000,
        description: 'For Sales Funnel AI, Multi-Agent Systems',
        features: ['Funnel optimization', 'AI retraining', 'Workflow expansion', 'CRM sync monitoring', 'Automation performance reports'],
      },
    ],
  },
  {
    categoryId: 'marketing-growth-retainer',
    categoryName: 'Marketing & Growth Retainer',
    icon: '📊',
    tiers: [
      {
        tierName: 'Starter Growth',
        minPriceINR: 4999,
        maxPriceINR: 12000,
        description: 'For startups and small businesses',
        features: ['SEO tracking', '4–8 social creatives', 'Funnel monitoring', 'Basic analytics report'],
      },
      {
        tierName: 'Growth Retainer',
        minPriceINR: 15000,
        maxPriceINR: 40000,
        description: 'For growing businesses',
        features: ['Conversion optimization', 'Content strategy updates', 'Automation monitoring', 'Paid campaign consultation'],
      },
      {
        tierName: 'Premium Growth Partner',
        minPriceINR: 50000,
        maxPriceINR: 150000,
        description: 'For established businesses seeking aggressive growth',
        features: ['Full growth strategy', 'Funnel rebuilds', 'AI optimization', 'Dedicated strategist', 'Monthly performance meeting'],
      },
    ],
  },
  {
    categoryId: 'saas-backend-retainer',
    categoryName: 'SaaS & Backend Retainer',
    icon: '💼',
    tiers: [
      {
        tierName: 'Business Level',
        minPriceINR: 15000,
        maxPriceINR: 35000,
        description: 'For business-level SaaS applications',
        features: ['Security monitoring', 'Architecture scaling', 'Database optimization', 'DevOps supervision', 'Payment & billing monitoring'],
      },
      {
        tierName: 'Enterprise Level',
        minPriceINR: 40000,
        maxPriceINR: 120000,
        description: 'For enterprise-grade SaaS platforms',
        features: ['Security monitoring', 'Architecture scaling', 'Database optimization', 'DevOps supervision', 'Payment & billing monitoring', 'Dedicated support team', 'SLA guarantee', 'Monthly architecture review'],
      },
    ],
  },
];
