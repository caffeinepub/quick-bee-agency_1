export interface PricingTierInfo {
  tierName: string;
  priceINR: number;
}

export interface MasterService {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  subcategory: string;
  tiers: PricingTierInfo[];
  features: string[];
}

export interface ServiceCategoryMeta {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const SERVICE_CATEGORIES: ServiceCategoryMeta[] = [
  { id: 'web-dev', name: 'Web Development', emoji: '💻', description: 'Custom websites, landing pages, e-commerce & more' },
  { id: 'app-dev', name: 'App Development', emoji: '📱', description: 'Mobile apps, SaaS, no-code solutions' },
  { id: 'ai-automation', name: 'AI Automation', emoji: '🤖', description: 'Chatbots, WhatsApp automation, AI workflows' },
  { id: 'digital-marketing', name: 'Digital Marketing', emoji: '📊', description: 'SEO, funnels, Instagram growth & more' },
  { id: 'branding', name: 'Branding & Creative', emoji: '🎨', description: 'Logo, branding kits, social media design' },
  { id: 'saas-tech', name: 'SaaS & Advanced Tech', emoji: '💼', description: 'SaaS architecture, DevOps, microservices' },
  { id: 'business-setup', name: 'Business Setup', emoji: '🛠', description: 'CRM, funnels, booking systems & more' },
];

export const webDevelopmentServices: MasterService[] = [
  {
    id: 'web-1', name: 'Custom Business Website', category: 'Web Development', categoryId: 'web-dev', subcategory: 'Business Website',
    tiers: [{ tierName: 'Student', priceINR: 4999 }, { tierName: 'Business', priceINR: 18999 }, { tierName: 'Premium', priceINR: 65000 }],
    features: ['Custom UI/UX Design', 'Mobile Responsive Layout', 'Modern Hero Section', 'Up to 5 Pages', 'Contact Form Integration', 'WhatsApp Chat Button', 'SEO-Friendly Structure', 'Fast Loading Optimization', 'SSL Setup', 'Basic Security Setup', 'Domain Connection', 'Hosting Setup Guidance', 'Social Media Integration', 'Google Map Integration', 'Basic On-Page SEO', '7 Days Support'],
  },
  {
    id: 'web-2', name: 'AI-Powered Website', category: 'Web Development', categoryId: 'web-dev', subcategory: 'AI Website',
    tiers: [{ tierName: 'Student', priceINR: 8999 }, { tierName: 'Business', priceINR: 35000 }, { tierName: 'Premium', priceINR: 120000 }],
    features: ['AI Chatbot Integration', 'Smart Content Generation', 'Personalization Engine', 'AI Search Functionality', 'Dynamic Content Blocks', 'Machine Learning Recommendations', 'Automated SEO Optimization', 'AI Analytics Dashboard', 'Smart Form Handling', 'Predictive User Behavior', 'API Integration', 'Custom AI Training', 'Performance Monitoring', 'Security Hardening', 'Mobile Optimization', '14 Days Support'],
  },
  {
    id: 'web-3', name: '3D Animated Website', category: 'Web Development', categoryId: 'web-dev', subcategory: '3D/Animation',
    tiers: [{ tierName: 'Student', priceINR: 12999 }, { tierName: 'Business', priceINR: 55000 }, { tierName: 'Premium', priceINR: 200000 }],
    features: ['Three.js / WebGL Integration', '3D Model Integration', 'Scroll-Based Animations', 'Particle Effects', 'Interactive 3D Elements', 'GSAP Animations', 'Cinematic Transitions', 'Custom Shader Effects', 'Performance Optimization', 'Mobile Fallback Design', 'Cross-Browser Compatibility', 'Loading Screen Animation', 'Sound Integration', 'VR-Ready Structure', 'Custom 3D Assets', '21 Days Support'],
  },
  {
    id: 'web-4', name: 'Landing Page', category: 'Web Development', categoryId: 'web-dev', subcategory: 'Conversion Pages',
    tiers: [{ tierName: 'Student', priceINR: 1999 }, { tierName: 'Business', priceINR: 9999 }, { tierName: 'Premium', priceINR: 35000 }],
    features: ['High-Converting Design', 'Conversion Copywriting', 'Mobile Optimization', 'Lead Form Setup', 'CTA Strategy', 'Social Proof Section', 'Testimonials Section', 'Countdown Timer', 'Pricing Table', 'Payment Integration', 'Email Integration', 'Pixel Tracking', 'SEO Meta Setup', 'Fast Load Speed', 'A/B Testing Ready', 'Analytics Integration'],
  },
  {
    id: 'web-5', name: 'Portfolio Website', category: 'Web Development', categoryId: 'web-dev', subcategory: 'Portfolio',
    tiers: [{ tierName: 'Student', priceINR: 2999 }, { tierName: 'Business', priceINR: 12000 }, { tierName: 'Premium', priceINR: 40000 }],
    features: ['Custom Design', 'Project Showcase Gallery', 'About Section', 'Skills Display', 'Contact Form', 'Resume/CV Download', 'Blog Integration', 'Social Media Links', 'SEO Optimization', 'Mobile Responsive', 'Fast Loading', 'SSL Setup', 'Domain Connection', 'Analytics Setup', 'Dark/Light Mode', '7 Days Support'],
  },
  {
    id: 'web-6', name: 'E-commerce Website', category: 'Web Development', categoryId: 'web-dev', subcategory: 'E-commerce',
    tiers: [{ tierName: 'Student', priceINR: 9999 }, { tierName: 'Business', priceINR: 45000 }, { tierName: 'Premium', priceINR: 180000 }],
    features: ['Store Platform Setup', 'Premium Theme Installation', 'Mobile Optimization', 'Product Upload (Up to 20)', 'Payment Gateway Integration', 'Shipping Configuration', 'Tax Setup', 'Product Category Structure', 'SEO Optimization', 'Conversion-Focused Design', 'Cart & Checkout Setup', 'Abandoned Cart Automation', 'Email Integration', 'Analytics Setup', 'Security Optimization', '14-Day Support'],
  },
  {
    id: 'web-7', name: 'WordPress Website', category: 'Web Development', categoryId: 'web-dev', subcategory: 'WordPress',
    tiers: [{ tierName: 'Student', priceINR: 3999 }, { tierName: 'Business', priceINR: 15000 }, { tierName: 'Premium', priceINR: 55000 }],
    features: ['WordPress Installation', 'Premium Theme Setup', 'Plugin Configuration', 'Custom Page Builder', 'Contact Forms', 'SEO Plugin Setup', 'Security Plugin', 'Backup System', 'Speed Optimization', 'Mobile Responsive', 'Social Media Integration', 'Blog Setup', 'WooCommerce Ready', 'Admin Training', 'Content Migration', '14 Days Support'],
  },
  {
    id: 'web-8', name: 'No-Code Website', category: 'Web Development', categoryId: 'web-dev', subcategory: 'No-Code',
    tiers: [{ tierName: 'Student', priceINR: 4999 }, { tierName: 'Business', priceINR: 20000 }, { tierName: 'Premium', priceINR: 70000 }],
    features: ['Platform Selection', 'Custom Design', 'CMS Integration', 'Form Builder', 'Animation Setup', 'SEO Configuration', 'Domain Connection', 'Payment Integration', 'Member Area Setup', 'Blog/News Section', 'Analytics Integration', 'Social Media Links', 'Speed Optimization', 'Mobile Optimization', 'Training Session', '14 Days Support'],
  },
  {
    id: 'web-9', name: 'Website Redesign', category: 'Web Development', categoryId: 'web-dev', subcategory: 'Redesign',
    tiers: [{ tierName: 'Student', priceINR: 3999 }, { tierName: 'Business', priceINR: 18000 }, { tierName: 'Premium', priceINR: 60000 }],
    features: ['Current Site Audit', 'UX/UI Overhaul', 'Modern Design System', 'Content Migration', 'SEO Preservation', 'Performance Improvement', 'Mobile Optimization', 'New Feature Integration', 'Brand Alignment', 'Speed Optimization', 'Security Update', 'Analytics Setup', 'Conversion Optimization', 'A/B Testing Setup', 'Training Session', '14 Days Support'],
  },
  {
    id: 'web-10', name: 'Website Speed Optimization', category: 'Web Development', categoryId: 'web-dev', subcategory: 'Performance',
    tiers: [{ tierName: 'Student', priceINR: 1999 }, { tierName: 'Business', priceINR: 8000 }, { tierName: 'Premium', priceINR: 25000 }],
    features: ['Performance Audit', 'Image Optimization', 'Code Minification', 'Caching Setup', 'CDN Integration', 'Database Optimization', 'Lazy Loading', 'Critical CSS', 'Server Response Time', 'Core Web Vitals Fix', 'Mobile Speed Fix', 'Plugin Cleanup', 'Render Blocking Fix', 'Font Optimization', 'Before/After Report', '7 Days Monitoring'],
  },
  {
    id: 'web-11', name: 'SEO Structure Setup', category: 'Web Development', categoryId: 'web-dev', subcategory: 'SEO',
    tiers: [{ tierName: 'Student', priceINR: 2999 }, { tierName: 'Business', priceINR: 15000 }, { tierName: 'Premium', priceINR: 45000 }],
    features: ['Technical SEO Audit', 'Site Architecture Planning', 'URL Structure Optimization', 'Schema Markup', 'Sitemap Creation', 'Robots.txt Setup', 'Canonical Tags', 'Internal Linking Strategy', 'Meta Tag Optimization', 'Page Speed Optimization', 'Mobile SEO', 'Google Search Console', 'Google Analytics', 'Keyword Mapping', 'Competitor Analysis', '30-Day Monitoring'],
  },
  {
    id: 'web-12', name: 'Domain & Hosting Setup', category: 'Web Development', categoryId: 'web-dev', subcategory: 'Infrastructure',
    tiers: [{ tierName: 'Student', priceINR: 999 }, { tierName: 'Business', priceINR: 3999 }, { tierName: 'Premium', priceINR: 12000 }],
    features: ['Domain Registration Guidance', 'Hosting Plan Selection', 'DNS Configuration', 'SSL Certificate Setup', 'Email Hosting Setup', 'cPanel/Dashboard Training', 'Backup Configuration', 'Security Hardening', 'CDN Setup', 'Uptime Monitoring', 'FTP Access Setup', 'Database Setup', 'Staging Environment', 'Migration Assistance', 'Documentation', '7 Days Support'],
  },
];

export const appDevelopmentServices: MasterService[] = [
  {
    id: 'app-1', name: 'No-Code Mobile App', category: 'App Development', categoryId: 'app-dev', subcategory: 'No-Code Solutions',
    tiers: [{ tierName: 'Student', priceINR: 9999 }, { tierName: 'Business', priceINR: 45000 }, { tierName: 'Premium', priceINR: 150000 }],
    features: ['App Strategy Planning', 'UI/UX Design', 'Drag-and-Drop Development', 'Firebase Integration', 'Login/Signup System', 'Database Setup', 'Push Notifications', 'API Integration', 'Payment Integration', 'Admin Dashboard', 'APK Export', 'Basic Testing', 'App Icon Design', 'Splash Screen Design', 'Play Store Guidance', 'Maintenance Guide'],
  },
  {
    id: 'app-2', name: 'Android APK Development', category: 'App Development', categoryId: 'app-dev', subcategory: 'Native Android',
    tiers: [{ tierName: 'Student', priceINR: 6999 }, { tierName: 'Business', priceINR: 30000 }, { tierName: 'Premium', priceINR: 110000 }],
    features: ['Requirements Analysis', 'UI/UX Design', 'Native Android Development', 'Firebase Integration', 'Authentication System', 'Database Integration', 'Push Notifications', 'Payment Gateway', 'API Integration', 'Testing & QA', 'APK Build', 'Play Store Submission', 'App Icon & Assets', 'Performance Optimization', 'Bug Fixes', '30 Days Support'],
  },
  {
    id: 'app-3', name: 'Web-to-App Conversion', category: 'App Development', categoryId: 'app-dev', subcategory: 'Conversion',
    tiers: [{ tierName: 'Student', priceINR: 4999 }, { tierName: 'Business', priceINR: 20000 }, { tierName: 'Premium', priceINR: 70000 }],
    features: ['Website Analysis', 'PWA Setup', 'App Wrapper Development', 'Push Notifications', 'Offline Mode', 'App Icon Design', 'Splash Screen', 'Performance Optimization', 'APK Generation', 'iOS Build Guidance', 'Play Store Submission', 'App Store Guidance', 'Deep Linking', 'Analytics Integration', 'Testing', '14 Days Support'],
  },
  {
    id: 'app-4', name: 'SaaS App Development', category: 'App Development', categoryId: 'app-dev', subcategory: 'SaaS',
    tiers: [{ tierName: 'Student', priceINR: 15000 }, { tierName: 'Business', priceINR: 75000 }, { tierName: 'Premium', priceINR: 300000 }],
    features: ['SaaS Architecture Design', 'Multi-Tenant Setup', 'Authentication System', 'Subscription Billing', 'Admin Dashboard', 'User Management', 'API Development', 'Database Design', 'Payment Integration', 'Email Notifications', 'Analytics Dashboard', 'Security Implementation', 'Performance Optimization', 'Documentation', 'Deployment Setup', '30 Days Support'],
  },
  {
    id: 'app-5', name: 'AI Integrated App', category: 'App Development', categoryId: 'app-dev', subcategory: 'AI Apps',
    tiers: [{ tierName: 'Student', priceINR: 12999 }, { tierName: 'Business', priceINR: 65000 }, { tierName: 'Premium', priceINR: 250000 }],
    features: ['AI Feature Planning', 'ML Model Integration', 'NLP Implementation', 'Computer Vision Setup', 'Recommendation Engine', 'Chatbot Integration', 'Predictive Analytics', 'Data Pipeline Setup', 'API Integration', 'Training Data Setup', 'Model Optimization', 'Performance Monitoring', 'Security Implementation', 'Documentation', 'Testing & QA', '30 Days Support'],
  },
  {
    id: 'app-6', name: 'Firebase Integrated App', category: 'App Development', categoryId: 'app-dev', subcategory: 'Firebase',
    tiers: [{ tierName: 'Student', priceINR: 7999 }, { tierName: 'Business', priceINR: 35000 }, { tierName: 'Premium', priceINR: 120000 }],
    features: ['Firebase Project Setup', 'Authentication Setup', 'Firestore Database', 'Realtime Database', 'Cloud Storage', 'Cloud Functions', 'Push Notifications (FCM)', 'Analytics Integration', 'Crashlytics Setup', 'Remote Config', 'A/B Testing', 'Performance Monitoring', 'Security Rules', 'Hosting Setup', 'CI/CD Pipeline', '14 Days Support'],
  },
  {
    id: 'app-7', name: 'App UI/UX Design', category: 'App Development', categoryId: 'app-dev', subcategory: 'Design',
    tiers: [{ tierName: 'Student', priceINR: 3999 }, { tierName: 'Business', priceINR: 18000 }, { tierName: 'Premium', priceINR: 65000 }],
    features: ['User Research', 'Wireframing', 'Prototype Creation', 'Visual Design', 'Design System', 'Component Library', 'Interaction Design', 'Micro-animations', 'Accessibility Design', 'Dark/Light Mode', 'Responsive Design', 'Icon Design', 'Illustration Style', 'Handoff Documentation', 'Usability Testing', 'Revision Rounds'],
  },
  {
    id: 'app-8', name: 'App Deployment Guidance', category: 'App Development', categoryId: 'app-dev', subcategory: 'Deployment',
    tiers: [{ tierName: 'Student', priceINR: 2999 }, { tierName: 'Business', priceINR: 10000 }, { tierName: 'Premium', priceINR: 35000 }],
    features: ['Store Account Setup', 'App Store Optimization', 'Screenshots & Assets', 'Description Writing', 'Keyword Research', 'Privacy Policy Setup', 'Review Guidelines', 'Submission Process', 'Rejection Handling', 'Update Strategy', 'Rating Strategy', 'Analytics Setup', 'Crash Monitoring', 'Update Automation', 'Documentation', '14 Days Support'],
  },
];

export const aiAutomationServices: MasterService[] = [
  {
    id: 'ai-1', name: 'AI Chatbot Setup', category: 'AI Automation', categoryId: 'ai-automation', subcategory: 'Chatbot Development',
    tiers: [{ tierName: 'Starter', priceINR: 4999 }, { tierName: 'Growth', priceINR: 25000 }, { tierName: 'Enterprise', priceINR: 100000 }],
    features: ['AI Chatbot Design', 'Website Integration', 'WhatsApp Integration', 'Custom Training Data', 'FAQ Automation', 'Lead Qualification Bot', 'Appointment Booking', 'Multi-Language Support', 'CRM Sync', 'Payment Integration', 'Smart Escalation', 'Knowledge Base Setup', '24/7 Automation', 'Conversation Analytics', 'Prompt Optimization', '14 Days Fine-Tuning'],
  },
  {
    id: 'ai-2', name: 'WhatsApp Automation', category: 'AI Automation', categoryId: 'ai-automation', subcategory: 'Messaging Automation',
    tiers: [{ tierName: 'Starter', priceINR: 3999 }, { tierName: 'Growth', priceINR: 20000 }, { tierName: 'Enterprise', priceINR: 85000 }],
    features: ['WhatsApp Business API Setup', 'Auto Welcome Message', 'FAQ Auto Replies', 'Lead Capture Automation', 'Keyword Trigger Setup', 'Broadcast System', 'Catalog Setup', 'Order Confirmation Automation', 'Payment Link Integration', 'CRM Integration', 'Customer Tagging', 'Follow-Up Sequences', 'Chat Flow Design', 'Multi-Agent Setup', 'Analytics Tracking', 'Compliance Setup'],
  },
  {
    id: 'ai-3', name: 'AI Sales Funnel Automation', category: 'AI Automation', categoryId: 'ai-automation', subcategory: 'Sales Automation',
    tiers: [{ tierName: 'Starter', priceINR: 6999 }, { tierName: 'Growth', priceINR: 35000 }, { tierName: 'Enterprise', priceINR: 150000 }],
    features: ['Funnel Strategy Planning', 'AI Lead Scoring', 'Automated Follow-Ups', 'Email Sequence Automation', 'WhatsApp Sequence', 'CRM Integration', 'Conversion Tracking', 'A/B Testing Setup', 'Retargeting Automation', 'Payment Automation', 'Upsell Automation', 'Analytics Dashboard', 'ROI Tracking', 'Performance Reports', 'Optimization Cycles', '30 Days Support'],
  },
  {
    id: 'ai-4', name: 'Lead Capture Automation', category: 'AI Automation', categoryId: 'ai-automation', subcategory: 'Lead Generation',
    tiers: [{ tierName: 'Starter', priceINR: 2999 }, { tierName: 'Growth', priceINR: 15000 }, { tierName: 'Enterprise', priceINR: 55000 }],
    features: ['Lead Funnel Setup', 'Lead Magnet Creation', 'Landing Page', 'Email Capture', 'CRM Integration', 'Lead Scoring', 'WhatsApp Integration', 'Auto Follow-Ups', 'Ad Structure Setup', 'Pixel Setup', 'Retargeting Setup', 'Qualification Automation', 'Appointment Scheduler', 'Lead Dashboard', 'Analytics Setup', '30-Day Support'],
  },
  {
    id: 'ai-5', name: 'Email Marketing Automation', category: 'AI Automation', categoryId: 'ai-automation', subcategory: 'Email Systems',
    tiers: [{ tierName: 'Starter', priceINR: 3999 }, { tierName: 'Growth', priceINR: 18000 }, { tierName: 'Enterprise', priceINR: 60000 }],
    features: ['Email Platform Setup', 'Domain Authentication (SPF, DKIM)', 'Welcome Sequence Setup', 'Lead Nurture Sequence', 'Sales Sequence Setup', 'Abandoned Cart Emails', 'Newsletter Template Design', 'Automation Workflow Creation', 'Segmentation Strategy', 'Tag-Based Automation', 'Email Copywriting', 'CTA Optimization', 'Landing Page Integration', 'Analytics & Tracking Setup', 'A/B Testing Structure', '30-Day Monitoring Support'],
  },
  {
    id: 'ai-6', name: 'Multi-Agent AI System', category: 'AI Automation', categoryId: 'ai-automation', subcategory: 'Advanced AI',
    tiers: [{ tierName: 'Starter', priceINR: 15000 }, { tierName: 'Growth', priceINR: 85000 }, { tierName: 'Enterprise', priceINR: 350000 }],
    features: ['System Architecture Design', 'Agent Role Definition', 'Inter-Agent Communication', 'Task Orchestration', 'Knowledge Base Setup', 'Tool Integration', 'Memory Management', 'Error Handling', 'Monitoring Dashboard', 'Performance Optimization', 'Security Implementation', 'API Integration', 'Testing & QA', 'Documentation', 'Training Session', '30 Days Support'],
  },
  {
    id: 'ai-7', name: 'AI Content Automation', category: 'AI Automation', categoryId: 'ai-automation', subcategory: 'Content Automation',
    tiers: [{ tierName: 'Starter', priceINR: 4999 }, { tierName: 'Growth', priceINR: 22000 }, { tierName: 'Enterprise', priceINR: 90000 }],
    features: ['AI Content Strategy Planning', 'Blog Post Generation', 'Social Media Captions', 'Ad Copy Creation', 'Website Copywriting', 'Product Descriptions', 'Email Copywriting', 'Reel Script Writing', 'SEO Optimized Content', 'Keyword Integration', 'Brand Voice Customization', 'Content Calendar Creation', 'Hashtag Research', 'Content Repurposing Strategy', 'AI Tool Setup', '30-Day Content Plan'],
  },
  {
    id: 'ai-8', name: 'AI Workflow Automation', category: 'AI Automation', categoryId: 'ai-automation', subcategory: 'Process Automation',
    tiers: [{ tierName: 'Starter', priceINR: 5999 }, { tierName: 'Growth', priceINR: 30000 }, { tierName: 'Enterprise', priceINR: 125000 }],
    features: ['Workflow Analysis', 'Automation Mapping', 'CRM Integration', 'Email Automation', 'WhatsApp Automation', 'Lead Routing Automation', 'Task Automation', 'Zapier/Make Setup', 'Webhook Integration', 'Payment Automation', 'Client Onboarding Automation', 'Reporting Automation', 'AI Workflow Integration', 'Multi-App Integration', 'Dashboard Setup', '30-Day Optimization Support'],
  },
];

export const digitalMarketingServices: MasterService[] = [
  {
    id: 'dm-1', name: 'Sales Funnel Setup', category: 'Digital Marketing', categoryId: 'digital-marketing', subcategory: 'Funnel Building',
    tiers: [{ tierName: 'Student', priceINR: 5999 }, { tierName: 'Business', priceINR: 30000 }, { tierName: 'Premium', priceINR: 120000 }],
    features: ['Funnel Strategy Planning', 'Landing Page Setup', 'Lead Capture Form', 'Thank You Page', 'Email Capture Integration', 'Offer Page Design', 'Upsell Page Setup', 'CTA Optimization', 'Funnel Flow Automation', 'Payment Gateway Setup', 'Conversion Tracking', 'Copywriting Assistance', 'Funnel Analytics Setup', 'A/B Testing Structure', 'Retargeting Pixel Setup', '14 Days Optimization Support'],
  },
  {
    id: 'dm-2', name: 'High-Converting Landing Page', category: 'Digital Marketing', categoryId: 'digital-marketing', subcategory: 'Conversion Pages',
    tiers: [{ tierName: 'Student', priceINR: 2999 }, { tierName: 'Business', priceINR: 12000 }, { tierName: 'Premium', priceINR: 40000 }],
    features: ['High-Converting Design', 'Conversion Copywriting', 'Mobile Optimization', 'Lead Form Setup', 'CTA Strategy', 'Social Proof Section', 'Testimonials Section', 'Countdown Timer', 'Pricing Table', 'Payment Integration', 'Email Integration', 'Pixel Tracking', 'SEO Meta Setup', 'Fast Load Speed', 'A/B Testing Ready', 'Analytics Integration'],
  },
  {
    id: 'dm-3', name: 'Instagram Growth Strategy', category: 'Digital Marketing', categoryId: 'digital-marketing', subcategory: 'Instagram Automation',
    tiers: [{ tierName: 'Student', priceINR: 3999 }, { tierName: 'Business', priceINR: 20000 }, { tierName: 'Premium', priceINR: 75000 }],
    features: ['Profile Audit', 'Niche Strategy', 'Content Blueprint', 'Reel Hook Scripts', 'Growth Funnel Setup', 'Engagement Automation', 'Hashtag Sets', 'Viral Format Templates', 'Lead Magnet Strategy', 'DM Automation', 'Bio Funnel Setup', 'Collab Strategy', 'Analytics Tracking', 'Conversion Strategy', 'Weekly Optimization', '30-Day Growth Plan'],
  },
  {
    id: 'dm-4', name: 'Pinterest Automation', category: 'Digital Marketing', categoryId: 'digital-marketing', subcategory: 'Pinterest',
    tiers: [{ tierName: 'Student', priceINR: 3999 }, { tierName: 'Business', priceINR: 18000 }, { tierName: 'Premium', priceINR: 65000 }],
    features: ['Pinterest Business Account Setup', 'Board Strategy', 'Pin Design Templates', 'Keyword Research', 'SEO Optimization', 'Scheduling Automation', 'Rich Pins Setup', 'Analytics Setup', 'Traffic Funnel', 'Affiliate Integration', 'Content Calendar', 'Competitor Analysis', 'Viral Pin Strategy', 'Group Board Strategy', 'Monthly Reports', '30-Day Monitoring'],
  },
  {
    id: 'dm-5', name: 'Amazon Affiliate Automation', category: 'Digital Marketing', categoryId: 'digital-marketing', subcategory: 'Affiliate Systems',
    tiers: [{ tierName: 'Student', priceINR: 5999 }, { tierName: 'Business', priceINR: 28000 }, { tierName: 'Premium', priceINR: 100000 }],
    features: ['Niche Selection Strategy', 'Affiliate Platform Setup', 'Website/Blog Setup', 'Product Research', 'SEO Content Plan', 'Funnel Setup', 'Email Automation', 'Tracking Links Setup', 'Conversion Optimization', 'Review Content Framework', 'Pinterest/Instagram Strategy', 'Analytics Setup', 'Ad Strategy Blueprint', 'Scaling Plan', 'Passive Income Model Setup', '30-Day Action Plan'],
  },
  {
    id: 'dm-6', name: 'Content Strategy', category: 'Digital Marketing', categoryId: 'digital-marketing', subcategory: 'Content Marketing',
    tiers: [{ tierName: 'Student', priceINR: 2999 }, { tierName: 'Business', priceINR: 15000 }, { tierName: 'Premium', priceINR: 55000 }],
    features: ['Brand Voice Development', 'Content Audit', 'Audience Research', 'Content Pillars Setup', 'Editorial Calendar', 'SEO Content Plan', 'Social Media Strategy', 'Blog Strategy', 'Video Content Plan', 'Email Content Plan', 'Repurposing Strategy', 'Competitor Analysis', 'KPI Setup', 'Distribution Strategy', 'Performance Tracking', '30-Day Review'],
  },
  {
    id: 'dm-7', name: 'SEO Optimization', category: 'Digital Marketing', categoryId: 'digital-marketing', subcategory: 'SEO Optimization',
    tiers: [{ tierName: 'Student', priceINR: 4999 }, { tierName: 'Business', priceINR: 25000 }, { tierName: 'Premium', priceINR: 110000 }],
    features: ['Keyword Research', 'Competitor Analysis', 'On-Page SEO', 'Meta Tag Optimization', 'Schema Markup', 'Image Optimization', 'Internal Linking', 'Sitemap Creation', 'Robots.txt Setup', 'Google Search Console Setup', 'Google Analytics Setup', 'Page Speed Optimization', 'Content SEO Suggestions', 'Backlink Strategy Plan', 'Local SEO Setup', '30-Day Monitoring'],
  },
  {
    id: 'dm-8', name: 'Conversion Optimization', category: 'Digital Marketing', categoryId: 'digital-marketing', subcategory: 'CRO',
    tiers: [{ tierName: 'Student', priceINR: 3999 }, { tierName: 'Business', priceINR: 20000 }, { tierName: 'Premium', priceINR: 80000 }],
    features: ['Conversion Audit', 'Heatmap Analysis', 'User Journey Mapping', 'CTA Optimization', 'Landing Page Improvements', 'Checkout Optimization', 'Form Optimization', 'Trust Signal Addition', 'Social Proof Setup', 'Speed Optimization', 'Mobile UX Fix', 'A/B Testing Setup', 'Analytics Setup', 'Funnel Visualization', 'Monthly Reports', '30-Day Monitoring'],
  },
];

export const brandingCreativeServices: MasterService[] = [
  {
    id: 'brand-1', name: 'Logo Design', category: 'Branding & Creative', categoryId: 'branding', subcategory: 'Logo Creation',
    tiers: [{ tierName: 'Starter', priceINR: 999 }, { tierName: 'Business', priceINR: 4999 }, { tierName: 'Premium', priceINR: 18000 }],
    features: ['Brand Discovery Session', '3 Initial Logo Concepts', 'Modern & Minimal Design', 'Typography-Based Logo', 'Icon-Based Logo Option', 'Monogram Option', 'High-Resolution Files', 'Transparent PNG', 'Vector Files (AI, SVG)', 'Social Media Versions', 'Black & White Version', 'Favicon Version', 'Mockup Presentation', 'Unlimited Revisions (Limited Time)', 'Brand Color Guidance', 'Commercial Usage Rights'],
  },
  {
    id: 'brand-2', name: 'Business Card Design', category: 'Branding & Creative', categoryId: 'branding', subcategory: 'Print Design',
    tiers: [{ tierName: 'Starter', priceINR: 999 }, { tierName: 'Business', priceINR: 3999 }, { tierName: 'Premium', priceINR: 12000 }],
    features: ['Custom Design', 'Front & Back Design', 'Brand Alignment', 'Typography Selection', 'Color Scheme', 'QR Code Integration', 'Social Media Icons', 'Print-Ready Files', 'Digital Version', 'Multiple Formats', 'Bleed & Crop Marks', 'CMYK Color Mode', 'High Resolution', 'Revision Rounds', 'Source Files', 'Print Guidance'],
  },
  {
    id: 'brand-3', name: 'Social Media Post Design', category: 'Branding & Creative', categoryId: 'branding', subcategory: 'Social Media Design',
    tiers: [{ tierName: 'Starter', priceINR: 999 }, { tierName: 'Business', priceINR: 3000 }, { tierName: 'Premium', priceINR: 15000 }],
    features: ['Custom Template Design', 'Brand Consistency', 'Multiple Formats', 'Instagram Posts', 'Facebook Posts', 'Twitter/X Posts', 'LinkedIn Posts', 'Story Templates', 'Highlight Covers', 'Caption Templates', 'Hashtag Sets', 'Color Palette', 'Font Selection', 'Icon Pack', 'Editable Files', 'Monthly Pack'],
  },
  {
    id: 'brand-4', name: 'Instagram Carousel Design', category: 'Branding & Creative', categoryId: 'branding', subcategory: 'Carousel Design',
    tiers: [{ tierName: 'Starter', priceINR: 1499 }, { tierName: 'Business', priceINR: 5999 }, { tierName: 'Premium', priceINR: 20000 }],
    features: ['Carousel Strategy', 'Hook Slide Design', 'Content Flow Design', 'Brand Alignment', 'Typography System', 'Color Consistency', 'Icon Integration', 'CTA Slide Design', 'Multiple Topics', 'Editable Templates', 'Caption Writing', 'Hashtag Research', 'Posting Strategy', 'Engagement Optimization', 'Analytics Setup', 'Monthly Pack'],
  },
  {
    id: 'brand-5', name: 'AI-Generated Images', category: 'Branding & Creative', categoryId: 'branding', subcategory: 'AI Visuals',
    tiers: [{ tierName: 'Starter', priceINR: 999 }, { tierName: 'Business', priceINR: 4999 }, { tierName: 'Premium', priceINR: 18000 }],
    features: ['Custom AI Image Prompts', 'Brand-Aligned Visual Style', 'Product Mockups', 'Social Media Graphics', 'Ad Creative Images', 'Website Hero Images', 'Thumbnail Designs', 'Background Removal', 'Image Upscaling', 'Color Enhancement', 'Style Transfer Options', 'Commercial License Guidance', 'Batch Image Creation', 'PNG/JPEG Export', 'High-Resolution Files', '7-Day Revision Support'],
  },
  {
    id: 'brand-6', name: 'T-Shirt Design', category: 'Branding & Creative', categoryId: 'branding', subcategory: 'Apparel Design',
    tiers: [{ tierName: 'Starter', priceINR: 999 }, { tierName: 'Business', priceINR: 3999 }, { tierName: 'Premium', priceINR: 15000 }],
    features: ['Design Concept', 'Front & Back Design', 'Multiple Color Variants', 'Print-Ready Files', 'Vector Format', 'Mockup Presentation', 'Size Guide', 'Color Separation', 'DTG Print Ready', 'Screen Print Ready', 'Embroidery Ready', 'Commercial Rights', 'Source Files', 'Revision Rounds', 'Brand Alignment', 'POD Platform Ready'],
  },
  {
    id: 'brand-7', name: 'Print-on-Demand Setup', category: 'Branding & Creative', categoryId: 'branding', subcategory: 'POD Business',
    tiers: [{ tierName: 'Starter', priceINR: 4999 }, { tierName: 'Business', priceINR: 18000 }, { tierName: 'Premium', priceINR: 60000 }],
    features: ['Niche Research', 'Store Platform Setup', 'POD Supplier Integration', 'Product Mockup Creation', 'AI Design Assistance', '10 Initial Designs', 'Product Descriptions', 'Pricing Strategy', 'Payment Gateway Setup', 'Shipping Configuration', 'Brand Logo Setup', 'Social Media Setup', 'Basic Ad Strategy', 'Etsy/Shopify Integration Option', 'Automation Setup', 'Launch Checklist'],
  },
];

export const saasAdvancedTechServices: MasterService[] = [
  {
    id: 'saas-1', name: 'SaaS Architecture Planning', category: 'SaaS & Advanced Tech', categoryId: 'saas-tech', subcategory: 'Architecture',
    tiers: [{ tierName: 'Business', priceINR: 25000 }, { tierName: 'Advanced', priceINR: 85000 }, { tierName: 'Enterprise', priceINR: 250000 }],
    features: ['Requirements Analysis', 'System Architecture Design', 'Database Schema Design', 'API Design', 'Microservices Planning', 'Scalability Planning', 'Security Architecture', 'Multi-Tenant Design', 'Integration Planning', 'Tech Stack Selection', 'Cost Optimization', 'Documentation', 'Proof of Concept', 'Team Guidance', 'Review Sessions', '30 Days Consultation'],
  },
  {
    id: 'saas-2', name: 'Tenant Isolation Setup', category: 'SaaS & Advanced Tech', categoryId: 'saas-tech', subcategory: 'Multi-Tenancy',
    tiers: [{ tierName: 'Business', priceINR: 20000 }, { tierName: 'Advanced', priceINR: 75000 }, { tierName: 'Enterprise', priceINR: 200000 }],
    features: ['Isolation Strategy Design', 'Database Isolation', 'Schema-per-Tenant Setup', 'Row-Level Security', 'API Isolation', 'Authentication Isolation', 'Storage Isolation', 'Billing Isolation', 'Monitoring per Tenant', 'Data Migration Plan', 'Security Testing', 'Performance Testing', 'Documentation', 'Team Training', 'Compliance Review', '30 Days Support'],
  },
  {
    id: 'saas-3', name: 'Firestore Security Rules', category: 'SaaS & Advanced Tech', categoryId: 'saas-tech', subcategory: 'Firebase Security',
    tiers: [{ tierName: 'Business', priceINR: 8999 }, { tierName: 'Advanced', priceINR: 35000 }, { tierName: 'Enterprise', priceINR: 110000 }],
    features: ['Security Audit', 'Rules Architecture Design', 'Authentication Rules', 'Role-Based Access', 'Data Validation Rules', 'Rate Limiting', 'Collection Group Rules', 'Subcollection Rules', 'Custom Claims Setup', 'Testing Suite', 'Emulator Testing', 'Production Deployment', 'Monitoring Setup', 'Documentation', 'Team Training', '14 Days Support'],
  },
  {
    id: 'saas-4', name: 'Razorpay Integration', category: 'SaaS & Advanced Tech', categoryId: 'saas-tech', subcategory: 'Payment Integration',
    tiers: [{ tierName: 'Business', priceINR: 3999 }, { tierName: 'Advanced', priceINR: 12000 }, { tierName: 'Enterprise', priceINR: 40000 }],
    features: ['Razorpay Account Setup', 'API Integration', 'Payment Gateway Setup', 'Webhook Configuration', 'Order Management', 'Refund Handling', 'Subscription Setup', 'Payment Links', 'QR Code Payments', 'UPI Integration', 'EMI Options', 'International Payments', 'Security Implementation', 'Testing', 'Documentation', '14 Days Support'],
  },
  {
    id: 'saas-5', name: 'Enterprise Billing System', category: 'SaaS & Advanced Tech', categoryId: 'saas-tech', subcategory: 'Billing',
    tiers: [{ tierName: 'Business', priceINR: 15000 }, { tierName: 'Advanced', priceINR: 65000 }, { tierName: 'Enterprise', priceINR: 200000 }],
    features: ['Billing Architecture', 'Subscription Management', 'Usage-Based Billing', 'Invoice Generation', 'Tax Calculation', 'Multi-Currency Support', 'Payment Gateway Integration', 'Dunning Management', 'Revenue Recognition', 'Analytics Dashboard', 'Reporting System', 'API Development', 'Security Implementation', 'Testing', 'Documentation', '30 Days Support'],
  },
  {
    id: 'saas-6', name: 'Backend Structure Planning', category: 'SaaS & Advanced Tech', categoryId: 'saas-tech', subcategory: 'Backend Architecture',
    tiers: [{ tierName: 'Business', priceINR: 18000 }, { tierName: 'Advanced', priceINR: 70000 }, { tierName: 'Enterprise', priceINR: 250000 }],
    features: ['Requirements Analysis', 'API Design', 'Database Design', 'Authentication System', 'Authorization Framework', 'Caching Strategy', 'Queue System Design', 'File Storage Design', 'Logging Strategy', 'Monitoring Setup', 'Security Planning', 'Scalability Design', 'Documentation', 'Code Review', 'Team Guidance', '30 Days Consultation'],
  },
  {
    id: 'saas-7', name: 'DevOps Deployment Plan', category: 'SaaS & Advanced Tech', categoryId: 'saas-tech', subcategory: 'DevOps',
    tiers: [{ tierName: 'Business', priceINR: 20000 }, { tierName: 'Advanced', priceINR: 80000 }, { tierName: 'Enterprise', priceINR: 300000 }],
    features: ['Infrastructure Design', 'CI/CD Pipeline Setup', 'Container Strategy', 'Kubernetes Setup', 'Auto-Scaling Config', 'Load Balancer Setup', 'Database Clustering', 'Backup Strategy', 'Monitoring & Alerting', 'Log Management', 'Security Hardening', 'Cost Optimization', 'Disaster Recovery', 'Documentation', 'Team Training', '30 Days Support'],
  },
  {
    id: 'saas-8', name: 'Microservices Architecture', category: 'SaaS & Advanced Tech', categoryId: 'saas-tech', subcategory: 'Microservices',
    tiers: [{ tierName: 'Business', priceINR: 30000 }, { tierName: 'Advanced', priceINR: 120000 }, { tierName: 'Enterprise', priceINR: 400000 }],
    features: ['Service Decomposition', 'API Gateway Setup', 'Service Discovery', 'Inter-Service Communication', 'Event-Driven Architecture', 'Message Queue Setup', 'Data Management Strategy', 'Security Implementation', 'Monitoring & Tracing', 'Circuit Breaker Pattern', 'Load Balancing', 'Container Orchestration', 'CI/CD per Service', 'Documentation', 'Team Training', '30 Days Support'],
  },
];

export const businessSetupServices: MasterService[] = [
  {
    id: 'biz-1', name: 'Agency Funnel Kit', category: 'Business Setup & Systems', categoryId: 'business-setup', subcategory: 'Agency Systems',
    tiers: [{ tierName: 'Starter', priceINR: 7999 }, { tierName: 'Growth', priceINR: 35000 }, { tierName: 'Premium', priceINR: 120000 }],
    features: ['Funnel Strategy', 'Lead Capture System', 'Proposal Templates', 'Pricing Calculator', 'Client Onboarding Flow', 'Contract Templates', 'Invoice System', 'Payment Gateway', 'CRM Integration', 'Email Sequences', 'WhatsApp Automation', 'Analytics Dashboard', 'Reporting System', 'Team Access Setup', 'Training Session', '30 Days Support'],
  },
  {
    id: 'biz-2', name: 'Client Tracking Dashboard', category: 'Business Setup & Systems', categoryId: 'business-setup', subcategory: 'Project Management',
    tiers: [{ tierName: 'Starter', priceINR: 3999 }, { tierName: 'Growth', priceINR: 15000 }, { tierName: 'Premium', priceINR: 50000 }],
    features: ['Dashboard Design', 'Client Portal Setup', 'Project Tracking', 'Task Management', 'Milestone Tracking', 'Invoice Tracking', 'Communication Log', 'File Sharing', 'Status Updates', 'Automated Reminders', 'Analytics Reports', 'Team Collaboration', 'Mobile Access', 'Integration Setup', 'Training Session', '14 Days Support'],
  },
  {
    id: 'biz-3', name: 'CRM Setup', category: 'Business Setup & Systems', categoryId: 'business-setup', subcategory: 'Customer Management',
    tiers: [{ tierName: 'Starter', priceINR: 4999 }, { tierName: 'Growth', priceINR: 22000 }, { tierName: 'Premium', priceINR: 85000 }],
    features: ['CRM Platform Selection Guidance', 'CRM Installation & Setup', 'Custom Pipeline Creation', 'Lead Stage Configuration', 'Contact Segmentation', 'Automation Workflow Setup', 'Email Integration', 'WhatsApp Integration', 'Task & Reminder System', 'Deal Tracking System', 'Lead Scoring Setup', 'Role-Based Access Setup', 'Dashboard Customization', 'Reporting Setup', 'Data Import & Migration', '30-Day Optimization Support'],
  },
  {
    id: 'biz-4', name: 'Payment Gateway Setup', category: 'Business Setup & Systems', categoryId: 'business-setup', subcategory: 'Payment Systems',
    tiers: [{ tierName: 'Starter', priceINR: 2999 }, { tierName: 'Growth', priceINR: 10000 }, { tierName: 'Premium', priceINR: 35000 }],
    features: ['Gateway Selection', 'Account Setup', 'API Integration', 'Webhook Configuration', 'Payment Page Design', 'Multiple Payment Methods', 'UPI Integration', 'Card Payment Setup', 'Net Banking Setup', 'Refund System', 'Invoice Generation', 'Tax Configuration', 'Security Setup', 'Testing', 'Documentation', '14 Days Support'],
  },
  {
    id: 'biz-5', name: 'Automated Booking System', category: 'Business Setup & Systems', categoryId: 'business-setup', subcategory: 'Booking Automation',
    tiers: [{ tierName: 'Starter', priceINR: 4999 }, { tierName: 'Growth', priceINR: 18000 }, { tierName: 'Premium', priceINR: 65000 }],
    features: ['Booking Platform Setup', 'Calendar Integration', 'Availability Management', 'Automated Confirmations', 'Reminder System', 'Payment Integration', 'Cancellation Handling', 'Rescheduling System', 'Client Portal', 'Staff Management', 'Service Catalog', 'Analytics Dashboard', 'CRM Integration', 'Email/SMS Notifications', 'Mobile Optimization', '14 Days Support'],
  },
  {
    id: 'biz-6', name: 'Lead Nurturing Email System', category: 'Business Setup & Systems', categoryId: 'business-setup', subcategory: 'Email Automation',
    tiers: [{ tierName: 'Starter', priceINR: 3999 }, { tierName: 'Growth', priceINR: 20000 }, { tierName: 'Premium', priceINR: 70000 }],
    features: ['Email Platform Setup', 'Lead Segmentation', 'Welcome Sequence', 'Nurture Sequence (7 Emails)', 'Sales Sequence', 'Re-engagement Sequence', 'Template Design', 'Copywriting', 'Automation Triggers', 'CRM Integration', 'Analytics Setup', 'A/B Testing', 'Deliverability Optimization', 'List Management', 'Reporting Dashboard', '30 Days Monitoring'],
  },
];

export const allMasterServices: MasterService[] = [
  ...webDevelopmentServices,
  ...appDevelopmentServices,
  ...aiAutomationServices,
  ...digitalMarketingServices,
  ...brandingCreativeServices,
  ...saasAdvancedTechServices,
  ...businessSetupServices,
];
