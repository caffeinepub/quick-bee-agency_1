export interface IndividualPackage {
  id: string;
  name: string;
  priceINR: number;
  category: string;
  subcategory: string;
  description: string;
  features: string[];
}

export const individualPackages: IndividualPackage[] = [
  {
    id: 'pkg-1', name: 'Website Development', priceINR: 999,
    category: 'Web Development', subcategory: 'Business Website',
    description: 'Complete business website with all essential features to establish your online presence.',
    features: ['Custom UI/UX Design', 'Mobile Responsive Layout', 'Modern Hero Section', 'Up to 5 Pages', 'Contact Form Integration', 'WhatsApp Chat Button', 'SEO-Friendly Structure', 'Fast Loading Optimization', 'SSL Setup', 'Basic Security Setup', 'Domain Connection', 'Hosting Setup Guidance', 'Social Media Integration', 'Google Map Integration', 'Basic On-Page SEO', '7 Days Support'],
  },
  {
    id: 'pkg-2', name: 'Sales Funnel Setup', priceINR: 1099,
    category: 'Marketing Systems', subcategory: 'Funnel Building',
    description: 'Complete sales funnel system to capture leads and convert them into paying customers.',
    features: ['Funnel Strategy Planning', 'Landing Page Setup', 'Lead Capture Form', 'Thank You Page', 'Email Capture Integration', 'Offer Page Design', 'Upsell Page Setup', 'CTA Optimization', 'Funnel Flow Automation', 'Payment Gateway Setup', 'Conversion Tracking', 'Copywriting Assistance', 'Funnel Analytics Setup', 'A/B Testing Structure', 'Retargeting Pixel Setup', '14 Days Optimization Support'],
  },
  {
    id: 'pkg-3', name: 'WhatsApp Automation', priceINR: 1199,
    category: 'Automation', subcategory: 'Messaging Automation',
    description: 'Full WhatsApp Business automation system for lead capture and customer engagement.',
    features: ['WhatsApp Business API Setup', 'Auto Welcome Message', 'FAQ Auto Replies', 'Lead Capture Automation', 'Keyword Trigger Setup', 'Broadcast System', 'Catalog Setup', 'Order Confirmation Automation', 'Payment Link Integration', 'CRM Integration', 'Customer Tagging', 'Follow-Up Sequences', 'Chat Flow Design', 'Multi-Agent Setup', 'Analytics Tracking', 'Compliance Setup'],
  },
  {
    id: 'pkg-4', name: 'AI Chatbot Setup', priceINR: 1299,
    category: 'AI Solutions', subcategory: 'Chatbot Development',
    description: 'Intelligent AI chatbot for your website and WhatsApp to automate customer interactions.',
    features: ['AI Chatbot Design', 'Website Integration', 'WhatsApp Integration', 'Custom Training Data', 'FAQ Automation', 'Lead Qualification Bot', 'Appointment Booking', 'Multi-Language Support', 'CRM Sync', 'Payment Integration', 'Smart Escalation', 'Knowledge Base Setup', '24/7 Automation', 'Conversation Analytics', 'Prompt Optimization', '14 Days Fine-Tuning'],
  },
  {
    id: 'pkg-5', name: 'Landing Pages', priceINR: 1399,
    category: 'Web Design', subcategory: 'Conversion Pages',
    description: 'High-converting landing pages designed to maximize lead generation and sales.',
    features: ['High-Converting Design', 'Conversion Copywriting', 'Mobile Optimization', 'Lead Form Setup', 'CTA Strategy', 'Social Proof Section', 'Testimonials Section', 'Countdown Timer', 'Pricing Table', 'Payment Integration', 'Email Integration', 'Pixel Tracking', 'SEO Meta Setup', 'Fast Load Speed', 'A/B Testing Ready', 'Analytics Integration'],
  },
  {
    id: 'pkg-6', name: 'SEO Setup', priceINR: 1499,
    category: 'Digital Marketing', subcategory: 'SEO Optimization',
    description: 'Complete SEO setup to improve your website visibility and organic search rankings.',
    features: ['Keyword Research', 'Competitor Analysis', 'On-Page SEO', 'Meta Tag Optimization', 'Schema Markup', 'Image Optimization', 'Internal Linking', 'Sitemap Creation', 'Robots.txt Setup', 'Google Search Console Setup', 'Google Analytics Setup', 'Page Speed Optimization', 'Content SEO Suggestions', 'Backlink Strategy Plan', 'Local SEO Setup', '30-Day Monitoring'],
  },
  {
    id: 'pkg-7', name: 'Social Media Management', priceINR: 1599,
    category: 'Social Media', subcategory: 'Account Management',
    description: 'Complete social media management system with content calendar and growth strategy.',
    features: ['Content Calendar', '12 Posts Creation', 'Caption Writing', 'Hashtag Research', 'Reel Strategy', 'Story Strategy', 'Profile Optimization', 'Bio Optimization', 'Highlight Covers', 'DM Strategy', 'Engagement Plan', 'Analytics Monitoring', 'Trend Research', 'Brand Voice Setup', 'Growth Strategy', 'Monthly Report'],
  },
  {
    id: 'pkg-8', name: 'Instagram Growth System', priceINR: 1699,
    category: 'Social Growth', subcategory: 'Instagram Automation',
    description: 'Comprehensive Instagram growth system with automation and viral content strategy.',
    features: ['Profile Audit', 'Niche Strategy', 'Content Blueprint', 'Reel Hook Scripts', 'Growth Funnel Setup', 'Engagement Automation', 'Hashtag Sets', 'Viral Format Templates', 'Lead Magnet Strategy', 'DM Automation', 'Bio Funnel Setup', 'Collab Strategy', 'Analytics Tracking', 'Conversion Strategy', 'Weekly Optimization', '30-Day Growth Plan'],
  },
  {
    id: 'pkg-9', name: 'Lead Generation System', priceINR: 1799,
    category: 'Lead Systems', subcategory: 'Automation',
    description: 'Complete lead generation system with automated follow-ups and qualification.',
    features: ['Lead Funnel Setup', 'Lead Magnet Creation', 'Landing Page', 'Email Capture', 'CRM Integration', 'Lead Scoring', 'WhatsApp Integration', 'Auto Follow-Ups', 'Ad Structure Setup', 'Pixel Setup', 'Retargeting Setup', 'Qualification Automation', 'Appointment Scheduler', 'Lead Dashboard', 'Analytics Setup', '30-Day Support'],
  },
  {
    id: 'pkg-10', name: 'Branding Kit', priceINR: 1899,
    category: 'Branding', subcategory: 'Brand Identity Development',
    description: 'Complete brand identity kit with strategy, guidelines, and all visual assets.',
    features: ['Brand Strategy Consultation', 'Brand Positioning Framework', 'Target Audience Definition', 'Brand Mission & Vision Creation', 'Brand Voice Guidelines', 'Color Palette Selection', 'Typography System', 'Logo Usage Guidelines', 'Social Media Branding Kit', 'Business Card Design', 'Letterhead Design', 'Email Signature Design', 'Brand Moodboard Creation', 'Iconography Style Guide', 'Brand Style Guide PDF', 'Editable Source Files'],
  },
  {
    id: 'pkg-11', name: 'Logo Design', priceINR: 1999,
    category: 'Branding', subcategory: 'Logo Creation',
    description: 'Professional logo design with multiple concepts, revisions, and all file formats.',
    features: ['Brand Discovery Session', '3 Initial Logo Concepts', 'Modern & Minimal Design', 'Typography-Based Logo', 'Icon-Based Logo Option', 'Monogram Option', 'High-Resolution Files', 'Transparent PNG', 'Vector Files (AI, SVG)', 'Social Media Versions', 'Black & White Version', 'Favicon Version', 'Mockup Presentation', 'Unlimited Revisions (Limited Time)', 'Brand Color Guidance', 'Commercial Usage Rights'],
  },
  {
    id: 'pkg-12', name: 'Video Editing', priceINR: 2099,
    category: 'Creative Services', subcategory: 'Video Production',
    description: 'Professional video editing with cinematic effects, transitions, and optimized exports.',
    features: ['Professional Video Editing', 'Smooth Transitions', 'Cinematic Color Grading', 'Background Music Integration', 'Sound Effects Addition', 'Subtitle & Captions', 'Reel/Short Format Optimization', 'YouTube Format Optimization', 'Intro & Outro Design', 'Logo Animation (Basic)', 'Motion Graphics Elements', 'Text Overlay Animations', 'Thumbnail Suggestion', 'Hook Optimization', '4K Export Option', 'Fast Delivery Option'],
  },
  {
    id: 'pkg-13', name: 'AI Content Creation', priceINR: 2199,
    category: 'AI Solutions', subcategory: 'Content Automation',
    description: 'AI-powered content creation system for blogs, social media, ads, and more.',
    features: ['AI Content Strategy Planning', 'Blog Post Generation', 'Social Media Captions', 'Ad Copy Creation', 'Website Copywriting', 'Product Descriptions', 'Email Copywriting', 'Reel Script Writing', 'SEO Optimized Content', 'Keyword Integration', 'Brand Voice Customization', 'Content Calendar Creation', 'Hashtag Research', 'Content Repurposing Strategy', 'AI Tool Setup', '30-Day Content Plan'],
  },
  {
    id: 'pkg-14', name: 'Email Marketing Setup', priceINR: 2299,
    category: 'Marketing Automation', subcategory: 'Email Systems',
    description: 'Complete email marketing system with automation sequences and analytics.',
    features: ['Email Platform Setup', 'Domain Authentication (SPF, DKIM)', 'Welcome Sequence Setup', 'Lead Nurture Sequence', 'Sales Sequence Setup', 'Abandoned Cart Emails', 'Newsletter Template Design', 'Automation Workflow Creation', 'Segmentation Strategy', 'Tag-Based Automation', 'Email Copywriting', 'CTA Optimization', 'Landing Page Integration', 'Analytics & Tracking Setup', 'A/B Testing Structure', '30-Day Monitoring Support'],
  },
  {
    id: 'pkg-15', name: 'LinkedIn Outreach System', priceINR: 2399,
    category: 'Lead Generation', subcategory: 'LinkedIn Automation',
    description: 'Systematic LinkedIn outreach system for B2B lead generation and client acquisition.',
    features: ['LinkedIn Profile Optimization', 'Niche Targeting Strategy', 'ICP (Ideal Client Profile) Setup', 'Outreach Message Scripts', 'Connection Automation Flow', 'Follow-Up Sequences', 'Value-Based DM Strategy', 'Content Authority Plan', 'Lead Tracking Sheet', 'CRM Integration', 'Appointment Booking Flow', 'Cold Message Personalization', 'Analytics Tracking', 'Conversion Funnel Setup', '30-Day Outreach Plan', 'Compliance Guidance'],
  },
  {
    id: 'pkg-16', name: 'E-commerce Store Setup', priceINR: 2499,
    category: 'Web Development', subcategory: 'E-commerce',
    description: 'Complete e-commerce store setup with payment gateway and conversion optimization.',
    features: ['Store Platform Setup', 'Premium Theme Installation', 'Mobile Optimization', 'Product Upload (Up to 20)', 'Payment Gateway Integration', 'Shipping Configuration', 'Tax Setup', 'Product Category Structure', 'SEO Optimization', 'Conversion-Focused Design', 'Cart & Checkout Setup', 'Abandoned Cart Automation', 'Email Integration', 'Analytics Setup', 'Security Optimization', '14-Day Support'],
  },
  {
    id: 'pkg-17', name: 'No-Code App Development', priceINR: 2599,
    category: 'App Development', subcategory: 'No-Code Solutions',
    description: 'Full no-code mobile app development with Firebase integration and Play Store guidance.',
    features: ['App Strategy Planning', 'UI/UX Design', 'Drag-and-Drop Development', 'Firebase Integration', 'Login/Signup System', 'Database Setup', 'Push Notifications', 'API Integration', 'Payment Integration', 'Admin Dashboard', 'APK Export', 'Basic Testing', 'App Icon Design', 'Splash Screen Design', 'Play Store Guidance', 'Maintenance Guide'],
  },
  {
    id: 'pkg-18', name: 'Automation Setup', priceINR: 2699,
    category: 'Business Systems', subcategory: 'Process Automation',
    description: 'Complete business process automation with Zapier/Make integration and workflow optimization.',
    features: ['Workflow Analysis', 'Automation Mapping', 'CRM Integration', 'Email Automation', 'WhatsApp Automation', 'Lead Routing Automation', 'Task Automation', 'Zapier/Make Setup', 'Webhook Integration', 'Payment Automation', 'Client Onboarding Automation', 'Reporting Automation', 'AI Workflow Integration', 'Multi-App Integration', 'Dashboard Setup', '30-Day Optimization Support'],
  },
  {
    id: 'pkg-19', name: 'CRM Setup', priceINR: 2799,
    category: 'Business Systems', subcategory: 'Customer Management',
    description: 'Complete CRM setup with custom pipelines, automation, and team access configuration.',
    features: ['CRM Platform Selection Guidance', 'CRM Installation & Setup', 'Custom Pipeline Creation', 'Lead Stage Configuration', 'Contact Segmentation', 'Automation Workflow Setup', 'Email Integration', 'WhatsApp Integration', 'Task & Reminder System', 'Deal Tracking System', 'Lead Scoring Setup', 'Role-Based Access Setup', 'Dashboard Customization', 'Reporting Setup', 'Data Import & Migration', '30-Day Optimization Support'],
  },
  {
    id: 'pkg-20', name: 'AI Proposal Generator', priceINR: 2899,
    category: 'AI Solutions', subcategory: 'Sales Automation',
    description: 'AI-powered proposal generation system with auto-personalization and e-signature integration.',
    features: ['AI Proposal Template Creation', 'Industry-Specific Customization', 'Dynamic Pricing Blocks', 'Service-Based Auto Fill', 'Client Name Auto Personalization', 'Branded Proposal Design', 'Scope of Work Templates', 'Timeline Generator', 'Terms & Conditions Builder', 'Payment Terms Setup', 'PDF Auto Export', 'E-Signature Integration', 'CRM Integration', 'Proposal Tracking System', 'Follow-Up Automation', 'Training & Usage Guide'],
  },
  {
    id: 'pkg-21', name: 'Pricing Strategy Consulting', priceINR: 2999,
    category: 'Business Consulting', subcategory: 'Revenue Optimization',
    description: 'Expert pricing strategy consulting with market research and revenue optimization framework.',
    features: ['Market Research Analysis', 'Competitor Pricing Study', 'Value-Based Pricing Model', 'Tiered Pricing Strategy', 'Profit Margin Calculation', 'Offer Structuring', 'Upsell Strategy Design', 'Bundle Pricing Framework', 'Subscription Model Setup', 'Psychological Pricing Strategy', 'Break-Even Analysis', 'Revenue Forecasting', 'Discount Strategy Framework', 'Pricing Presentation Structure', 'Testing Strategy', '30-Day Review Support'],
  },
  {
    id: 'pkg-22', name: 'Funnel Optimization', priceINR: 3099,
    category: 'Marketing Systems', subcategory: 'Conversion Optimization',
    description: 'Complete funnel audit and optimization to maximize conversion rates and revenue.',
    features: ['Funnel Audit', 'Conversion Rate Analysis', 'Copy Optimization', 'CTA Refinement', 'Landing Page Improvements', 'Checkout Optimization', 'Offer Enhancement', 'Page Speed Optimization', 'Heatmap Analysis Setup', 'Retargeting Strategy', 'Email Sequence Optimization', 'Upsell/Downsell Refinement', 'A/B Testing Setup', 'Funnel Analytics Setup', 'Customer Journey Mapping', '30-Day Optimization Monitoring'],
  },
  {
    id: 'pkg-23', name: 'Copywriting Service', priceINR: 3199,
    category: 'Marketing', subcategory: 'Conversion Copy',
    description: 'Professional conversion copywriting for websites, ads, emails, and sales pages.',
    features: ['Website Copywriting', 'Landing Page Copy', 'Sales Page Copy', 'Email Sequence Copy', 'Ad Copy Creation', 'Social Media Copy', 'Product Descriptions', 'SEO-Optimized Writing', 'Brand Voice Development', 'Emotional Hook Writing', 'Call-to-Action Strategy', 'Headline Optimization', 'Storytelling Framework', 'Competitor Analysis', 'Conversion-Focused Structure', 'Revision Support'],
  },
  {
    id: 'pkg-24', name: 'Reels Script Creation', priceINR: 3299,
    category: 'Content Marketing', subcategory: 'Short-Form Video Scripts',
    description: 'Viral reel scripts with hooks, storytelling, and 30-day content calendar.',
    features: ['Viral Hook Creation', '30–60 Second Scripts', 'Trend-Based Concepts', 'Niche-Specific Ideas', 'Call-to-Action Integration', 'Storytelling Format', 'Educational Reel Scripts', 'Sales Reel Scripts', 'Authority-Building Scripts', 'Carousel-to-Reel Repurposing', 'High-Retention Structure', 'Caption Suggestions', 'Hashtag Recommendations', 'Posting Strategy Guide', '30-Day Script Calendar', 'Optimization Tips'],
  },
  {
    id: 'pkg-25', name: 'AI Image Generation', priceINR: 3399,
    category: 'AI Solutions', subcategory: 'Visual Content Creation',
    description: 'Custom AI-generated images for branding, ads, social media, and marketing materials.',
    features: ['Custom AI Image Prompts', 'Brand-Aligned Visual Style', 'Product Mockups', 'Social Media Graphics', 'Ad Creative Images', 'Website Hero Images', 'Thumbnail Designs', 'Background Removal', 'Image Upscaling', 'Color Enhancement', 'Style Transfer Options', 'Commercial License Guidance', 'Batch Image Creation', 'PNG/JPEG Export', 'High-Resolution Files', '7-Day Revision Support'],
  },
  {
    id: 'pkg-26', name: 'T-Shirt POD Setup', priceINR: 3499,
    category: 'E-Commerce', subcategory: 'Print-on-Demand',
    description: 'Complete print-on-demand t-shirt business setup with designs and store integration.',
    features: ['Niche Research', 'Store Platform Setup', 'POD Supplier Integration', 'Product Mockup Creation', 'AI Design Assistance', '10 Initial Designs', 'Product Descriptions', 'Pricing Strategy', 'Payment Gateway Setup', 'Shipping Configuration', 'Brand Logo Setup', 'Social Media Setup', 'Basic Ad Strategy', 'Etsy/Shopify Integration Option', 'Automation Setup', 'Launch Checklist'],
  },
  {
    id: 'pkg-27', name: 'Etsy Automation', priceINR: 3599,
    category: 'Marketplace Systems', subcategory: 'Etsy Growth',
    description: 'Complete Etsy store automation with SEO optimization and growth strategy.',
    features: ['Etsy Store Setup', 'SEO Product Optimization', 'Keyword Research', 'Automated Listing Templates', 'AI Description Writing', 'Pricing Optimization', 'Auto Reply Setup', 'Order Automation', 'Review Request Automation', 'Tag Optimization', 'Banner & Branding Setup', 'Analytics Integration', 'Competitor Research', 'Conversion Optimization', '30-Day Growth Plan', 'Performance Monitoring'],
  },
  {
    id: 'pkg-28', name: 'Affiliate Marketing System', priceINR: 3699,
    category: 'Digital Marketing', subcategory: 'Affiliate Systems',
    description: 'Complete affiliate marketing system with niche selection, funnel, and passive income setup.',
    features: ['Niche Selection Strategy', 'Affiliate Platform Setup', 'Website/Blog Setup', 'Product Research', 'SEO Content Plan', 'Funnel Setup', 'Email Automation', 'Tracking Links Setup', 'Conversion Optimization', 'Review Content Framework', 'Pinterest/Instagram Strategy', 'Analytics Setup', 'Ad Strategy Blueprint', 'Scaling Plan', 'Passive Income Model Setup', '30-Day Action Plan'],
  },
  {
    id: 'pkg-29', name: 'Notion Dashboard Setup', priceINR: 3799,
    category: 'Productivity Systems', subcategory: 'Workspace Automation',
    description: 'Custom Notion workspace with CRM, project management, and business tracking dashboards.',
    features: ['Custom Workspace Setup', 'CRM Dashboard', 'Client Tracker', 'Project Management Board', 'Finance Tracker', 'Sales Tracker', 'Task Automation', 'Content Planner', 'KPI Dashboard', 'Team Access Setup', 'Template Library', 'Automation Integration', 'Data Organization System', 'Clean UI Design', 'Training Guide', 'Ongoing Support (7 Days)'],
  },
  {
    id: 'pkg-30', name: 'Analytics Dashboard Setup', priceINR: 3899,
    category: 'Business Intelligence', subcategory: 'Data & Reporting',
    description: 'Complete analytics dashboard with KPI tracking, real-time reporting, and business insights.',
    features: ['KPI Identification', 'Data Source Integration', 'Google Analytics Integration', 'CRM Data Integration', 'Sales Tracking Setup', 'Marketing Data Sync', 'Custom Dashboard Design', 'Real-Time Reporting', 'Funnel Visualization', 'Revenue Tracking', 'Lead Tracking', 'Performance Graphs', 'Automated Reports', 'Monthly Summary Template', 'Decision Insights Setup', 'Training Session'],
  },
];
