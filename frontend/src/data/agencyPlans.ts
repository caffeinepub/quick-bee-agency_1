export interface AgencyPlan {
  planId: string;
  planName: string;
  emoji: string;
  minPriceINR: number;
  maxPriceINR: number | null;
  targetAudience: string;
  description: string;
  features: string[];
  badgeColor: 'green' | 'blue' | 'purple';
}

export const agencyPlans: AgencyPlan[] = [
  {
    planId: 'spark',
    planName: 'Spark Plan',
    emoji: '🟢',
    minPriceINR: 4999,
    maxPriceINR: 25000,
    targetAudience: 'Student / Beginner / Idea Stage',
    description: 'Perfect for students, freelancers, and early-stage entrepreneurs who want to launch their first digital presence or automate basic workflows.',
    badgeColor: 'green',
    features: [
      'Basic Website or Landing Page',
      'Social Media Setup',
      'Basic SEO Configuration',
      'WhatsApp Business Setup',
      'Logo & Branding Kit',
      'Email Marketing Setup',
      'Basic Automation (1 workflow)',
      'Lead Capture Form',
      'Google Analytics Setup',
      '7-Day Support',
    ],
  },
  {
    planId: 'surge',
    planName: 'Surge Plan',
    emoji: '🔵',
    minPriceINR: 30000,
    maxPriceINR: 120000,
    targetAudience: 'Local & National Business Growth',
    description: 'Designed for local and national businesses ready to scale with advanced automation, AI tools, and comprehensive digital marketing systems.',
    badgeColor: 'blue',
    features: [
      'Custom Business Website',
      'Full Sales Funnel Setup',
      'AI Chatbot Integration',
      'WhatsApp Automation System',
      'CRM Setup & Configuration',
      'Email Marketing Automation',
      'Instagram Growth Strategy',
      'SEO Optimization',
      'Payment Gateway Integration',
      'Analytics Dashboard',
      'Monthly Performance Reports',
      '30-Day Support',
    ],
  },
  {
    planId: 'titan',
    planName: 'Titan Plan',
    emoji: '🟣',
    minPriceINR: 150000,
    maxPriceINR: null,
    targetAudience: 'National / Global / Enterprise Clients',
    description: 'The ultimate enterprise solution for national and global businesses requiring custom SaaS development, multi-agent AI systems, and full-scale digital transformation.',
    badgeColor: 'purple',
    features: [
      'Custom SaaS Application',
      'Multi-Agent AI System',
      'Enterprise CRM & Automation',
      'Advanced Analytics Platform',
      'Microservices Architecture',
      'DevOps & CI/CD Pipeline',
      'Multi-Channel Marketing System',
      'Enterprise Billing System',
      'Dedicated Project Manager',
      'Priority 24/7 Support',
      'Monthly Strategy Sessions',
      'Quarterly Business Reviews',
    ],
  },
];
