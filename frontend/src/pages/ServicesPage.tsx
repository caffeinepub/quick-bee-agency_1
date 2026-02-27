import React, { useState, useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Search, ShoppingCart, ChevronDown, ChevronUp, Star, Zap, Shield, TrendingUp, Globe, Megaphone, Code, Palette, BarChart3, Settings, Check, Filter } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCart } from '../cart/useCart';

// ─── Types ───────────────────────────────────────────────────────────────────

type Tier = 'basic' | 'pro' | 'premium';

interface TieredService {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  basic: { price: number; features: string[] };
  pro: { price: number; features: string[] };
  premium: { price: number; features: string[] };
}

interface IndividualPackage {
  id: string;
  name: string;
  price: number;
  category: string;
  features: string[];
}

interface MaintenancePlan {
  id: string;
  name: string;
  category: string;
  priceRange: string;
  features: string[];
  color: string;
}

interface AgencyPlan {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  color: string;
  highlight: boolean;
  features: string[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const MASTER_SERVICES: TieredService[] = [
  // Digital Marketing
  {
    id: 'dm-seo',
    name: 'SEO Optimization',
    description: 'Complete search engine optimization to rank higher on Google',
    category: 'Digital Marketing',
    basic: { price: 8000, features: ['On-page SEO', 'Keyword research', '5 pages optimized', 'Monthly report'] },
    pro: { price: 18000, features: ['On-page + Off-page SEO', 'Advanced keyword research', '15 pages optimized', 'Backlink building', 'Weekly report'] },
    premium: { price: 35000, features: ['Full SEO suite', 'Unlimited pages', 'Competitor analysis', 'Content strategy', 'Daily monitoring', 'Dedicated manager'] },
  },
  {
    id: 'dm-smm',
    name: 'Social Media Marketing',
    description: 'Grow your brand presence across all social platforms',
    category: 'Digital Marketing',
    basic: { price: 6000, features: ['2 platforms', '8 posts/month', 'Basic graphics', 'Monthly analytics'] },
    pro: { price: 14000, features: ['4 platforms', '20 posts/month', 'Custom graphics', 'Story creation', 'Weekly analytics'] },
    premium: { price: 28000, features: ['All platforms', '40 posts/month', 'Video content', 'Influencer outreach', 'Daily analytics', 'Ad management'] },
  },
  {
    id: 'dm-ppc',
    name: 'PPC / Google Ads',
    description: 'Targeted paid advertising campaigns for maximum ROI',
    category: 'Digital Marketing',
    basic: { price: 10000, features: ['Google Search Ads', 'Up to ₹20k ad spend', 'Basic targeting', 'Monthly report'] },
    pro: { price: 22000, features: ['Search + Display Ads', 'Up to ₹50k ad spend', 'Advanced targeting', 'A/B testing', 'Bi-weekly report'] },
    premium: { price: 45000, features: ['Full Google suite', 'Unlimited ad spend', 'Remarketing', 'Shopping ads', 'Daily optimization', 'Dedicated manager'] },
  },
  {
    id: 'dm-email',
    name: 'Email Marketing',
    description: 'Automated email campaigns that convert leads to customers',
    category: 'Digital Marketing',
    basic: { price: 5000, features: ['500 subscribers', '4 campaigns/month', 'Basic templates', 'Open rate tracking'] },
    pro: { price: 12000, features: ['2000 subscribers', '12 campaigns/month', 'Custom templates', 'Automation flows', 'Click tracking'] },
    premium: { price: 25000, features: ['Unlimited subscribers', 'Unlimited campaigns', 'Advanced automation', 'Segmentation', 'A/B testing', 'CRM integration'] },
  },
  // Web Development
  {
    id: 'web-landing',
    name: 'Landing Page',
    description: 'High-converting landing pages designed to capture leads',
    category: 'Web Development',
    basic: { price: 12000, features: ['1 page design', 'Mobile responsive', 'Contact form', '3 revisions'] },
    pro: { price: 25000, features: ['Up to 5 pages', 'Custom design', 'Lead capture forms', 'Analytics integration', '5 revisions'] },
    premium: { price: 50000, features: ['Unlimited pages', 'Premium design', 'A/B testing setup', 'CRM integration', 'Speed optimization', 'Unlimited revisions'] },
  },
  {
    id: 'web-ecommerce',
    name: 'E-Commerce Website',
    description: 'Full-featured online store with payment gateway integration',
    category: 'Web Development',
    basic: { price: 25000, features: ['Up to 50 products', 'Payment gateway', 'Basic design', 'Mobile responsive'] },
    pro: { price: 55000, features: ['Up to 500 products', 'Multiple payment options', 'Custom design', 'Inventory management', 'Order tracking'] },
    premium: { price: 120000, features: ['Unlimited products', 'All payment gateways', 'Custom features', 'Multi-vendor support', 'Advanced analytics', 'Dedicated support'] },
  },
  {
    id: 'web-corporate',
    name: 'Corporate Website',
    description: 'Professional business website that builds credibility',
    category: 'Web Development',
    basic: { price: 18000, features: ['5 pages', 'Standard design', 'Contact form', 'Basic SEO'] },
    pro: { price: 40000, features: ['10 pages', 'Custom design', 'Blog section', 'Advanced SEO', 'Social integration'] },
    premium: { price: 85000, features: ['Unlimited pages', 'Premium design', 'CMS integration', 'Full SEO suite', 'Performance optimization', 'Maintenance'] },
  },
  // Graphic Design
  {
    id: 'gd-logo',
    name: 'Logo & Brand Identity',
    description: 'Professional logo design and complete brand identity package',
    category: 'Graphic Design',
    basic: { price: 5000, features: ['3 logo concepts', '2 revisions', 'PNG/JPG files', 'Basic brand colors'] },
    pro: { price: 12000, features: ['5 logo concepts', '5 revisions', 'All file formats', 'Brand guidelines', 'Business card design'] },
    premium: { price: 28000, features: ['Unlimited concepts', 'Unlimited revisions', 'Complete brand kit', 'Stationery design', 'Social media kit', 'Brand manual'] },
  },
  {
    id: 'gd-social',
    name: 'Social Media Design',
    description: 'Eye-catching social media graphics and templates',
    category: 'Graphic Design',
    basic: { price: 4000, features: ['10 post designs', '1 platform size', 'Basic templates', '2 revisions'] },
    pro: { price: 9000, features: ['25 post designs', 'All platform sizes', 'Custom templates', 'Story designs', '4 revisions'] },
    premium: { price: 20000, features: ['50 post designs', 'All formats', 'Animated posts', 'Brand consistency', 'Unlimited revisions', 'Monthly refresh'] },
  },
  // Content Writing
  {
    id: 'cw-blog',
    name: 'Blog & Article Writing',
    description: 'SEO-optimized content that drives organic traffic',
    category: 'Content Writing',
    basic: { price: 3000, features: ['4 articles/month', '500 words each', 'Basic SEO', 'Topic research'] },
    pro: { price: 8000, features: ['8 articles/month', '1000 words each', 'Advanced SEO', 'Keyword optimization', 'Meta descriptions'] },
    premium: { price: 18000, features: ['16 articles/month', '2000 words each', 'Full SEO suite', 'Internal linking', 'Content calendar', 'Performance tracking'] },
  },
  {
    id: 'cw-copy',
    name: 'Copywriting & Sales Copy',
    description: 'Persuasive copy that converts visitors into customers',
    category: 'Content Writing',
    basic: { price: 5000, features: ['1 sales page', 'Email sequence (3)', 'Basic copy', '2 revisions'] },
    pro: { price: 12000, features: ['3 sales pages', 'Email sequence (7)', 'Conversion-focused copy', 'A/B variants', '4 revisions'] },
    premium: { price: 25000, features: ['Unlimited pages', 'Full email funnel', 'Premium copy', 'Ad copy', 'Video scripts', 'Unlimited revisions'] },
  },
  // Video Production
  {
    id: 'vp-explainer',
    name: 'Explainer Video',
    description: 'Animated explainer videos that simplify your message',
    category: 'Video Production',
    basic: { price: 15000, features: ['60 second video', 'Basic animation', 'Stock music', '2 revisions'] },
    pro: { price: 35000, features: ['2 minute video', 'Custom animation', 'Professional voiceover', 'Custom music', '4 revisions'] },
    premium: { price: 75000, features: ['5 minute video', 'Premium animation', 'Celebrity voiceover', 'Original music', 'Multiple formats', 'Unlimited revisions'] },
  },
  {
    id: 'vp-reels',
    name: 'Social Media Reels',
    description: 'Viral-worthy short videos for Instagram and YouTube',
    category: 'Video Production',
    basic: { price: 8000, features: ['4 reels/month', 'Basic editing', 'Stock music', 'Captions'] },
    pro: { price: 18000, features: ['10 reels/month', 'Advanced editing', 'Custom music', 'Effects & transitions', 'Thumbnails'] },
    premium: { price: 40000, features: ['20 reels/month', 'Premium editing', 'Original music', 'Motion graphics', 'Multi-platform optimization', 'Analytics'] },
  },
  // Business Consulting
  {
    id: 'bc-strategy',
    name: 'Business Strategy',
    description: 'Expert business strategy and growth planning',
    category: 'Business Consulting',
    basic: { price: 10000, features: ['2-hour consultation', 'SWOT analysis', 'Basic roadmap', 'Action plan'] },
    pro: { price: 25000, features: ['5-hour consultation', 'Market analysis', 'Detailed roadmap', 'Competitor analysis', 'Monthly check-in'] },
    premium: { price: 60000, features: ['Ongoing consulting', 'Full market research', 'Strategic planning', 'Implementation support', 'Weekly meetings', 'KPI tracking'] },
  },
  // Automation
  {
    id: 'auto-crm',
    name: 'CRM & Sales Automation',
    description: 'Automate your sales pipeline and customer management',
    category: 'Automation',
    basic: { price: 12000, features: ['CRM setup', 'Lead capture automation', 'Email sequences', 'Basic reporting'] },
    pro: { price: 28000, features: ['Advanced CRM', 'Multi-channel automation', 'Lead scoring', 'Custom workflows', 'Integration setup'] },
    premium: { price: 65000, features: ['Enterprise CRM', 'AI-powered automation', 'Predictive analytics', 'Custom integrations', 'Dedicated support', 'Training'] },
  },
];

const MASTER_CATEGORIES = ['All', 'Digital Marketing', 'Web Development', 'Graphic Design', 'Content Writing', 'Video Production', 'Business Consulting', 'Automation'];

const INDIVIDUAL_PACKAGES: IndividualPackage[] = [
  { id: 'ip-1', name: 'Starter Social Pack', price: 4999, category: 'Social Media', features: ['Facebook page setup', 'Instagram profile optimization', 'Cover photo design', 'Profile picture design', '10 post templates', 'Content calendar', 'Hashtag strategy', 'Bio optimization', 'Story highlights setup', 'Link in bio page', 'Basic analytics setup', 'Competitor analysis', 'Audience research', 'Posting schedule', 'Engagement tips guide', 'Support for 30 days'] },
  { id: 'ip-2', name: 'Logo Design Package', price: 3999, category: 'Design', features: ['3 unique logo concepts', 'Unlimited revisions', 'PNG, JPG, SVG files', 'Vector source files', 'Black & white versions', 'Color variations', 'Brand color palette', 'Font recommendations', 'Usage guidelines', 'Social media sizes', 'Favicon version', 'Watermark version', 'Print-ready files', 'Email signature logo', 'Business card mockup', '1 year support'] },
  { id: 'ip-3', name: 'Google My Business Setup', price: 2999, category: 'Local SEO', features: ['GMB profile creation', 'Business verification', 'Category optimization', 'Description writing', 'Photo upload (20 photos)', 'Service listing', 'Product catalog setup', 'Q&A setup', 'Review response templates', 'Post scheduling setup', 'Insights tracking', 'Competitor analysis', 'Local keyword research', 'Citation building (10)', 'NAP consistency check', 'Monthly performance report'] },
  { id: 'ip-4', name: 'WhatsApp Business Setup', price: 1999, category: 'Messaging', features: ['WhatsApp Business account', 'Profile optimization', 'Catalog setup', 'Quick replies setup', 'Greeting message', 'Away message', 'Labels setup', 'Broadcast list setup', 'Status strategy', 'Link generation', 'QR code creation', 'Auto-reply setup', 'Business hours setup', 'Product showcase', 'Payment link integration', 'Training guide'] },
  { id: 'ip-5', name: 'Website Speed Optimization', price: 5999, category: 'Web', features: ['Speed audit report', 'Image optimization', 'Code minification', 'Caching setup', 'CDN configuration', 'Database optimization', 'Plugin audit', 'Server optimization', 'Mobile speed fix', 'Core Web Vitals fix', 'Lazy loading setup', 'Font optimization', 'Script optimization', 'Redirect cleanup', 'HTTPS setup', 'Performance monitoring'] },
  { id: 'ip-6', name: 'Email Marketing Setup', price: 4499, category: 'Email', features: ['Email platform setup', 'List import & cleanup', 'Welcome sequence (5 emails)', 'Newsletter template', 'Automation workflow', 'Segmentation setup', 'Opt-in form creation', 'Landing page integration', 'GDPR compliance', 'Unsubscribe management', 'Analytics dashboard', 'A/B test setup', 'Deliverability check', 'SPF/DKIM setup', 'Spam score check', '30-day support'] },
  { id: 'ip-7', name: 'YouTube Channel Setup', price: 3499, category: 'Video', features: ['Channel creation/optimization', 'Channel art design', 'Profile picture design', 'Channel description', 'Keyword research', 'Playlist setup', 'End screen templates', 'Thumbnail templates (5)', 'About page optimization', 'Social links setup', 'Channel trailer script', 'SEO strategy guide', 'Upload schedule', 'Monetization guide', 'Analytics setup', 'Growth tips guide'] },
  { id: 'ip-8', name: 'Facebook Ads Starter', price: 7999, category: 'Paid Ads', features: ['Ad account setup', 'Pixel installation', 'Audience research', '2 ad campaigns', '4 ad creatives', 'Ad copy writing', 'Targeting setup', 'Budget optimization', 'A/B testing', 'Conversion tracking', 'Retargeting setup', 'Lookalike audiences', 'Weekly reporting', 'Ad performance analysis', 'Optimization recommendations', '30-day management'] },
  { id: 'ip-9', name: 'Content Writing Pack', price: 5499, category: 'Content', features: ['8 blog articles (800 words)', 'SEO optimization', 'Keyword research', 'Meta titles & descriptions', 'Internal linking', 'Image suggestions', 'Content calendar', 'Topic ideation', 'Competitor content analysis', 'Readability optimization', 'CTA optimization', 'Social media snippets', 'Email newsletter version', 'Infographic outline', 'FAQ section', 'Plagiarism check'] },
  { id: 'ip-10', name: 'Shopify Store Setup', price: 14999, category: 'E-Commerce', features: ['Store creation', 'Theme customization', 'Product upload (25)', 'Payment gateway setup', 'Shipping configuration', 'Tax setup', 'Domain connection', 'Email notifications', 'Discount codes setup', 'Collection pages', 'About/Contact pages', 'Privacy policy', 'Terms of service', 'SEO optimization', 'Analytics setup', 'Training session'] },
  { id: 'ip-11', name: 'Instagram Growth Pack', price: 6999, category: 'Social Media', features: ['Profile audit & optimization', 'Bio rewrite', 'Content strategy', '30 post captions', 'Hashtag research (200)', 'Story strategy', 'Reel ideas (10)', 'Engagement strategy', 'Collaboration outreach', 'Influencer list', 'Analytics review', 'Competitor analysis', 'Growth tactics guide', 'Posting schedule', 'Highlight covers (10)', '60-day support'] },
  { id: 'ip-12', name: 'Business Card Design', price: 999, category: 'Design', features: ['2 design concepts', 'Front & back design', 'Print-ready files', 'Digital version', 'QR code integration', 'Social media icons', 'Brand color matching', 'Font selection', 'Bleed & crop marks', 'CMYK color mode', 'High resolution (300 DPI)', 'Multiple file formats', '3 revisions', 'Express delivery', 'Mockup preview', 'Lifetime file access'] },
  { id: 'ip-13', name: 'LinkedIn Profile Optimization', price: 2499, category: 'Professional', features: ['Profile photo guidance', 'Headline optimization', 'Summary rewrite', 'Experience section', 'Skills optimization', 'Recommendations strategy', 'Connection strategy', 'Content strategy', 'Company page setup', 'LinkedIn SEO', 'Keyword optimization', 'Featured section setup', 'Activity strategy', 'Network growth tips', 'InMail templates', '30-day support'] },
  { id: 'ip-14', name: 'Press Release Writing', price: 3999, category: 'Content', features: ['Professional press release', 'Newsworthy angle', 'SEO optimization', 'Quote crafting', 'Boilerplate writing', 'Distribution list', 'Media contact research', 'Follow-up email template', 'Social media version', 'Blog post version', 'Email newsletter version', 'Headline variations (5)', 'Sub-headline options', 'Call-to-action', 'Fact-checking', 'Proofreading'] },
  { id: 'ip-15', name: 'Podcast Launch Package', price: 8999, category: 'Audio', features: ['Podcast strategy', 'Name & branding', 'Cover art design', 'Intro/outro script', 'Episode template', 'Show notes template', 'Platform submission (5)', 'RSS feed setup', 'Website integration', 'Social media setup', 'Launch episode plan', 'Guest outreach template', 'Monetization guide', 'Equipment recommendations', 'Recording tips', '30-day support'] },
  { id: 'ip-16', name: 'Chatbot Setup', price: 9999, category: 'Automation', features: ['Chatbot strategy', 'Platform setup', 'Welcome flow', 'FAQ automation', 'Lead capture flow', 'Appointment booking', 'Product recommendation', 'Order tracking integration', 'Human handoff setup', 'Analytics dashboard', 'A/B testing', 'Multi-language support', 'CRM integration', 'Email integration', 'Testing & QA', '30-day support'] },
  { id: 'ip-17', name: 'Amazon Seller Setup', price: 11999, category: 'E-Commerce', features: ['Seller account setup', 'Product listing (10)', 'Keyword research', 'Title optimization', 'Bullet points writing', 'Description writing', 'Backend keywords', 'Image requirements guide', 'Pricing strategy', 'FBA setup guide', 'Review strategy', 'PPC basics guide', 'Brand registry guide', 'A+ content guide', 'Competitor analysis', 'Launch strategy'] },
  { id: 'ip-18', name: 'Brochure Design', price: 2999, category: 'Design', features: ['Tri-fold or bi-fold', '2 design concepts', 'Front & back design', 'Print-ready files', 'Digital PDF version', 'Brand color matching', 'Professional copywriting', 'Stock images included', 'Infographic elements', 'QR code integration', 'Contact details layout', 'Product/service showcase', '4 revisions', 'CMYK color mode', 'High resolution', 'Mockup preview'] },
  { id: 'ip-19', name: 'Video Testimonial Package', price: 4999, category: 'Video', features: ['Script writing', 'Recording guidelines', 'Video editing (3 videos)', 'Subtitles/captions', 'Thumbnail design', 'Background music', 'Color grading', 'Logo watermark', 'Multiple formats', 'Social media versions', 'Website embed code', 'YouTube upload', 'Testimonial page design', 'Email campaign version', 'Ad-ready version', 'Lifetime access'] },
  { id: 'ip-20', name: 'Infographic Design', price: 3499, category: 'Design', features: ['Data visualization', '2 design concepts', 'Custom illustrations', 'Brand color scheme', 'Statistical graphics', 'Icon design', 'Typography layout', 'Print & digital versions', 'Social media sizes', 'Presentation version', 'Blog post version', 'Animated version option', '4 revisions', 'Source file included', 'Multiple formats', 'Lifetime access'] },
  { id: 'ip-21', name: 'Reputation Management', price: 7999, category: 'PR', features: ['Online audit report', 'Review monitoring setup', 'Response templates (20)', 'Review generation strategy', 'Negative review handling', 'Google alerts setup', 'Social listening setup', 'Brand mention tracking', 'Competitor monitoring', 'Crisis management plan', 'Monthly reporting', 'Review platform optimization', 'Customer feedback system', 'NPS survey setup', 'Testimonial collection', '3-month support'] },
  { id: 'ip-22', name: 'Sales Funnel Design', price: 12999, category: 'Marketing', features: ['Funnel strategy', 'Landing page design', 'Thank you page', 'Upsell page', 'Email sequence (7)', 'Lead magnet creation', 'Opt-in form design', 'Payment integration', 'Analytics setup', 'A/B testing setup', 'Retargeting pixel', 'CRM integration', 'Automation workflow', 'Conversion optimization', 'Split testing', '60-day support'] },
  { id: 'ip-23', name: 'App Store Optimization', price: 5999, category: 'Mobile', features: ['ASO audit', 'Keyword research', 'Title optimization', 'Description rewrite', 'Screenshot design (5)', 'Icon design', 'Preview video script', 'Rating strategy', 'Review response templates', 'Competitor analysis', 'Category optimization', 'Localization guide', 'A/B testing plan', 'Analytics setup', 'Update strategy', 'Monthly monitoring'] },
  { id: 'ip-24', name: 'Webinar Setup Package', price: 6499, category: 'Events', features: ['Platform setup', 'Registration page', 'Email sequence (5)', 'Presentation template', 'Slide design (20 slides)', 'Promotional graphics', 'Social media posts (10)', 'Reminder sequence', 'Recording setup', 'Replay page', 'Follow-up sequence', 'Attendee management', 'Q&A management', 'Certificate template', 'Analytics tracking', 'Post-webinar report'] },
  { id: 'ip-25', name: 'Franchise Marketing Kit', price: 19999, category: 'Marketing', features: ['Brand guidelines document', 'Marketing materials (10)', 'Social media templates (20)', 'Email templates (5)', 'Presentation template', 'Brochure design', 'Business card design', 'Signage design', 'Vehicle wrap design', 'Uniform design', 'Training manual', 'Marketing calendar', 'Ad templates', 'PR kit', 'Digital asset library', 'Ongoing support'] },
  { id: 'ip-26', name: 'Influencer Marketing Setup', price: 8499, category: 'Social Media', features: ['Influencer research (50)', 'Outreach templates', 'Campaign strategy', 'Brief creation', 'Contract template', 'Tracking setup', 'Content guidelines', 'Hashtag strategy', 'Performance metrics', 'ROI calculation', 'Reporting template', 'Platform selection', 'Budget allocation guide', 'Micro-influencer list', 'Macro-influencer list', '60-day support'] },
  { id: 'ip-27', name: 'CRM Implementation', price: 15999, category: 'Automation', features: ['CRM selection guide', 'Account setup', 'Pipeline configuration', 'Lead import', 'Contact management', 'Deal stages setup', 'Email integration', 'Calendar integration', 'Task automation', 'Reporting dashboard', 'Team training (2 hours)', 'Custom fields setup', 'Workflow automation', 'Integration setup (2)', 'Data migration', '60-day support'] },
  { id: 'ip-28', name: 'Photography Direction', price: 7499, category: 'Visual', features: ['Shot list creation', 'Mood board design', 'Location scouting guide', 'Prop list', 'Styling guide', 'Lighting recommendations', 'Post-processing guide', 'Editing presets (10)', 'Batch editing (50 photos)', 'Retouching (10 photos)', 'Background removal (20)', 'Color correction', 'Social media crops', 'Website crops', 'Print crops', 'Delivery in 48 hours'] },
  { id: 'ip-29', name: 'Affiliate Program Setup', price: 9999, category: 'Marketing', features: ['Program strategy', 'Platform setup', 'Commission structure', 'Affiliate recruitment', 'Marketing materials', 'Tracking setup', 'Payment system', 'Terms & conditions', 'Affiliate portal', 'Training materials', 'Email templates', 'Banner designs (5)', 'Link management', 'Performance dashboard', 'Fraud prevention', '90-day support'] },
  { id: 'ip-30', name: 'Crisis Communication Plan', price: 11999, category: 'PR', features: ['Risk assessment', 'Crisis scenarios (10)', 'Response protocols', 'Spokesperson training guide', 'Media statement templates', 'Social media protocols', 'Internal communication plan', 'Stakeholder communication', 'Legal review checklist', 'Media monitoring setup', 'Dark site preparation', 'Recovery strategy', 'Post-crisis review', 'Team roles & responsibilities', 'Contact directory', 'Annual review plan'] },
];

const MAINTENANCE_PLANS: MaintenancePlan[] = [
  {
    id: 'mp-web',
    name: 'Website Maintenance',
    category: 'Web',
    priceRange: '₹3,000 – ₹12,000/month',
    color: 'blue',
    features: ['Regular updates', 'Security monitoring', 'Backup management', 'Performance optimization', 'Bug fixes', 'Content updates', 'SSL renewal', 'Uptime monitoring', '24/7 support'],
  },
  {
    id: 'mp-seo',
    name: 'SEO Maintenance',
    category: 'SEO',
    priceRange: '₹5,000 – ₹20,000/month',
    color: 'green',
    features: ['Monthly keyword tracking', 'Backlink monitoring', 'Content updates', 'Technical SEO checks', 'Competitor tracking', 'Rank reporting', 'Algorithm update response', 'Local SEO updates', 'Schema markup updates'],
  },
  {
    id: 'mp-social',
    name: 'Social Media Management',
    category: 'Social',
    priceRange: '₹8,000 – ₹30,000/month',
    color: 'purple',
    features: ['Daily posting', 'Community management', 'Story creation', 'Engagement monitoring', 'Monthly analytics', 'Campaign management', 'Influencer coordination', 'Crisis management', 'Trend monitoring'],
  },
  {
    id: 'mp-ads',
    name: 'Ad Campaign Management',
    category: 'Ads',
    priceRange: '₹10,000 – ₹40,000/month',
    color: 'orange',
    features: ['Campaign optimization', 'Budget management', 'A/B testing', 'Audience refinement', 'Creative refresh', 'Bid management', 'Conversion tracking', 'Weekly reporting', 'ROI optimization'],
  },
  {
    id: 'mp-content',
    name: 'Content Marketing',
    category: 'Content',
    priceRange: '₹6,000 – ₹25,000/month',
    color: 'cyan',
    features: ['Blog articles (4-16/month)', 'Social media content', 'Email newsletters', 'Video scripts', 'Infographics', 'Case studies', 'Press releases', 'Content calendar', 'Performance tracking'],
  },
];

const AGENCY_PLANS: AgencyPlan[] = [
  {
    id: 'ap-spark',
    name: 'Spark',
    subtitle: 'Perfect for startups',
    price: 25000,
    color: 'green',
    highlight: false,
    features: ['5 services/month', 'Dedicated account manager', 'Monthly strategy call', 'Priority support', 'Performance dashboard', 'Social media management', 'Basic SEO', 'Email marketing', 'Monthly reporting', 'Up to 2 team members'],
  },
  {
    id: 'ap-surge',
    name: 'Surge',
    subtitle: 'For growing businesses',
    price: 55000,
    color: 'blue',
    highlight: true,
    features: ['12 services/month', 'Senior account manager', 'Weekly strategy calls', '24/7 priority support', 'Advanced analytics', 'Full social media suite', 'Advanced SEO', 'PPC management', 'Content marketing', 'Video production (2/month)', 'CRM setup', 'Up to 5 team members'],
  },
  {
    id: 'ap-titan',
    name: 'Titan',
    subtitle: 'Enterprise-grade solution',
    price: 120000,
    color: 'purple',
    highlight: false,
    features: ['Unlimited services', 'Dedicated team (3 members)', 'Daily strategy support', 'White-glove support', 'Custom analytics & BI', 'Full digital marketing suite', 'Enterprise SEO', 'Unlimited PPC', 'Premium content production', 'Video production (8/month)', 'Custom automation', 'API integrations', 'Unlimited team members', 'Quarterly business review'],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function TierSelector({ selected, onChange }: { selected: Tier; onChange: (t: Tier) => void }) {
  const tiers: { value: Tier; label: string }[] = [
    { value: 'basic', label: 'Basic' },
    { value: 'pro', label: 'Pro' },
    { value: 'premium', label: 'Premium' },
  ];
  return (
    <div className="flex rounded-lg overflow-hidden border border-border">
      {tiers.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
            selected === t.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-background text-muted-foreground hover:bg-muted'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function MasterServiceCard({ service }: { service: TieredService }) {
  const [tier, setTier] = useState<Tier>('pro');
  const { addItem } = useCart();
  const navigate = useNavigate();

  const tierData = service[tier];
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

  const handleBuy = () => {
    addItem({
      id: `${service.id}-${tier}-${Date.now()}`,
      name: `${service.name} (${tierLabel})`,
      price: tierData.price,
      quantity: 1,
      tierLabel,
    });
    navigate({ to: '/authenticated/checkout' });
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    'Digital Marketing': <Megaphone className="w-4 h-4" />,
    'Web Development': <Code className="w-4 h-4" />,
    'Graphic Design': <Palette className="w-4 h-4" />,
    'Content Writing': <BarChart3 className="w-4 h-4" />,
    'Video Production': <Zap className="w-4 h-4" />,
    'Business Consulting': <TrendingUp className="w-4 h-4" />,
    'Automation': <Settings className="w-4 h-4" />,
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              {categoryIcons[service.category] || <Star className="w-4 h-4" />}
            </div>
            <Badge variant="secondary" className="text-xs">{service.category}</Badge>
          </div>
        </div>
        <CardTitle className="text-base mt-2">{service.name}</CardTitle>
        <CardDescription className="text-xs">{service.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 gap-3">
        <TierSelector selected={tier} onChange={setTier} />
        <div className="text-2xl font-bold text-primary">{formatINR(tierData.price)}</div>
        <ul className="space-y-1 flex-1">
          {tierData.features.map((f, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Button onClick={handleBuy} className="w-full mt-auto" size="sm">
          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
          Buy Now
        </Button>
      </CardContent>
    </Card>
  );
}

function IndividualPackageCard({ pkg }: { pkg: IndividualPackage }) {
  const [expanded, setExpanded] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const handleBuy = () => {
    addItem({
      id: `${pkg.id}-${Date.now()}`,
      name: pkg.name,
      price: pkg.price,
      quantity: 1,
      tierLabel: 'Standard',
    });
    navigate({ to: '/authenticated/checkout' });
  };

  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <Badge variant="outline" className="text-xs mb-2">{pkg.category}</Badge>
            <CardTitle className="text-sm">{pkg.name}</CardTitle>
          </div>
          <div className="text-lg font-bold text-primary shrink-0">{formatINR(pkg.price)}</div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 gap-3">
        <div>
          <ul className="space-y-1">
            {(expanded ? pkg.features : pkg.features.slice(0, 4)).map((f, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {pkg.features.length > 4 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
            >
              {expanded ? (
                <><ChevronUp className="w-3 h-3" /> Show less</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> +{pkg.features.length - 4} more features</>
              )}
            </button>
          )}
        </div>
        <Button onClick={handleBuy} className="w-full mt-auto" size="sm">
          <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
          Select & Pay
        </Button>
      </CardContent>
    </Card>
  );
}

function MaintenancePlanCard({ plan }: { plan: MaintenancePlan }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
    green: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
    purple: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800',
    orange: 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800',
    cyan: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800',
  };
  const badgeColorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
  };

  return (
    <Card className={`border-2 ${colorMap[plan.color] || ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{plan.name}</CardTitle>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeColorMap[plan.color] || ''}`}>
            {plan.category}
          </span>
        </div>
        <div className="text-lg font-bold text-foreground">{plan.priceRange}</div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1.5">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <Button variant="outline" className="w-full mt-4" size="sm">
          Get Quote
        </Button>
      </CardContent>
    </Card>
  );
}

function AgencyPlanCard({ plan }: { plan: AgencyPlan }) {
  const { addItem } = useCart();
  const navigate = useNavigate();

  const colorStyles: Record<string, { card: string; badge: string; btn: string }> = {
    green: {
      card: 'border-green-300 dark:border-green-700',
      badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      btn: 'bg-green-600 hover:bg-green-700 text-white',
    },
    blue: {
      card: 'border-blue-400 dark:border-blue-600 ring-2 ring-blue-400 dark:ring-blue-600',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
    purple: {
      card: 'border-purple-300 dark:border-purple-700',
      badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      btn: 'bg-purple-600 hover:bg-purple-700 text-white',
    },
  };

  const styles = colorStyles[plan.color] || colorStyles.blue;

  const handleBuy = () => {
    addItem({
      id: `${plan.id}-${Date.now()}`,
      name: `${plan.name} Agency Plan`,
      price: plan.price,
      quantity: 1,
      tierLabel: plan.name,
    });
    navigate({ to: '/authenticated/checkout' });
  };

  return (
    <Card className={`flex flex-col border-2 ${styles.card} ${plan.highlight ? 'shadow-xl scale-105' : ''} transition-all`}>
      {plan.highlight && (
        <div className="bg-blue-600 text-white text-xs font-bold text-center py-1.5 rounded-t-lg">
          ⭐ MOST POPULAR
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <CardDescription>{plan.subtitle}</CardDescription>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${styles.badge}`}>
            Agency
          </span>
        </div>
        <div className="mt-2">
          <span className="text-3xl font-bold text-foreground">{formatINR(plan.price)}</span>
          <span className="text-muted-foreground text-sm">/month</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 gap-4">
        <ul className="space-y-2 flex-1">
          {plan.features.map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <button
          onClick={handleBuy}
          className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${styles.btn}`}
        >
          <ShoppingCart className="w-4 h-4 inline mr-2" />
          Select & Pay
        </button>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState('master');
  const [masterCategory, setMasterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMasterServices = useMemo(() => {
    return MASTER_SERVICES.filter((s) => {
      const matchesCategory = masterCategory === 'All' || s.category === masterCategory;
      const matchesSearch =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [masterCategory, searchQuery]);

  const filteredPackages = useMemo(() => {
    return INDIVIDUAL_PACKAGES.filter((p) => {
      return (
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Service Catalog</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Browse our complete range of digital marketing and business services
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="master">Master Services</TabsTrigger>
          <TabsTrigger value="packages">Individual Packages</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Plans</TabsTrigger>
          <TabsTrigger value="agency">Agency Plans</TabsTrigger>
        </TabsList>

        {/* ── Master Services ── */}
        <TabsContent value="master" className="mt-6 space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <Filter className="w-4 h-4 text-muted-foreground self-center" />
            {MASTER_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setMasterCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  masterCategory === cat
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredMasterServices.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No services found</p>
              <p className="text-sm">Try adjusting your search or category filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredMasterServices.map((s) => (
                <MasterServiceCard key={s.id} service={s} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Individual Packages ── */}
        <TabsContent value="packages" className="mt-6">
          {filteredPackages.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No packages found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPackages.map((p) => (
                <IndividualPackageCard key={p.id} pkg={p} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Maintenance Plans ── */}
        <TabsContent value="maintenance" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MAINTENANCE_PLANS.map((plan) => (
              <MaintenancePlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </TabsContent>

        {/* ── Agency Plans ── */}
        <TabsContent value="agency" className="mt-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">Agency Partnership Plans</h2>
            <p className="text-muted-foreground mt-2">
              Full-service digital marketing packages for businesses that want to scale fast
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
            {AGENCY_PLANS.map((plan) => (
              <AgencyPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
