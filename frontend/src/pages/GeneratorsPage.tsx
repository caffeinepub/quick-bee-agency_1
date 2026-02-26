import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Wand2, Star, FileText, DollarSign, MessageSquare, Mail, Target, ArrowRight, Zap
} from 'lucide-react';

const generators = [
  {
    id: 'recommendation',
    title: 'Service Recommender',
    description: 'AI-powered service recommendations based on client needs, budget, and goals.',
    icon: Star,
    path: '/authenticated/generators/recommendation',
    badge: 'AI',
  },
  {
    id: 'proposal',
    title: 'Proposal Generator',
    description: 'Generate professional proposals with detailed scope, timeline, and pricing.',
    icon: FileText,
    path: '/authenticated/generators/proposal',
    badge: 'AI',
  },
  {
    id: 'pricing',
    title: 'Pricing Strategy',
    description: 'Dynamic pricing suggestions with psychological pricing techniques.',
    icon: DollarSign,
    path: '/authenticated/generators/pricing',
    badge: 'Smart',
  },
  {
    id: 'closing',
    title: 'Closing Scripts',
    description: 'Proven closing scripts tailored to your prospect\'s objections and needs.',
    icon: MessageSquare,
    path: '/authenticated/generators/closing',
    badge: 'AI',
  },
  {
    id: 'followup',
    title: 'Follow-up Messages',
    description: 'Automated follow-up sequences for leads at every stage of the pipeline.',
    icon: Mail,
    path: '/authenticated/generators/followup',
    badge: 'Auto',
  },
  {
    id: 'qualification',
    title: 'Lead Qualification',
    description: 'Score and qualify leads based on budget, urgency, and decision-making power.',
    icon: Target,
    path: '/authenticated/generators/qualification',
    badge: 'Smart',
  },
];

const badgeColors: Record<string, string> = {
  AI: 'rgba(45, 212, 191, 0.15)',
  Smart: 'rgba(74, 222, 128, 0.15)',
  Auto: 'rgba(6, 182, 212, 0.15)',
};

const badgeTextColors: Record<string, string> = {
  AI: '#2dd4bf',
  Smart: '#4ade80',
  Auto: '#06b6d4',
};

export default function GeneratorsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold gradient-text-teal flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-teal-400" />
          AI Sales Tools
        </h1>
        <p className="text-teal-400/50 text-sm mt-0.5">
          Intelligent generators to supercharge your sales process
        </p>
      </div>

      {/* Hero banner */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(10,20,18,0.95), rgba(4,47,46,0.8))',
          border: '1px solid rgba(45, 212, 191, 0.25)',
        }}>
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.7), transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10"
          style={{ background: 'radial-gradient(ellipse at right, #2dd4bf, transparent)' }} />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-teal-glow"
            style={{ background: 'linear-gradient(135deg, #2dd4bf, #4ade80)' }}>
            <Zap className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold gradient-text-teal">Powered by AI</h2>
            <p className="text-teal-400/60 text-sm">6 intelligent tools to close more deals faster</p>
          </div>
        </div>
      </div>

      {/* Generator cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {generators.map((gen) => {
          const Icon = gen.icon;
          return (
            <button
              key={gen.id}
              onClick={() => navigate({ to: gen.path })}
              className="text-left rounded-2xl p-5 relative overflow-hidden group transition-all duration-300 hover:shadow-teal-glow-sm hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, rgba(10,20,18,0.9), rgba(13,26,22,0.9))',
                border: '1px solid rgba(45, 212, 191, 0.15)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(45, 212, 191, 0.35)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.border = '1px solid rgba(45, 212, 191, 0.15)';
              }}
            >
              {/* Top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.6), transparent)' }} />

              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(45, 212, 191, 0.1)', border: '1px solid rgba(45, 212, 191, 0.2)' }}>
                  <Icon className="w-5 h-5 text-teal-400" />
                </div>
                <span className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{
                    background: badgeColors[gen.badge] || 'rgba(45, 212, 191, 0.15)',
                    color: badgeTextColors[gen.badge] || '#2dd4bf',
                    border: `1px solid ${badgeTextColors[gen.badge] || '#2dd4bf'}30`,
                  }}>
                  {gen.badge}
                </span>
              </div>

              <h3 className="font-display text-sm font-semibold text-teal-100 mb-2 group-hover:gradient-text-teal transition-all">
                {gen.title}
              </h3>
              <p className="text-xs text-teal-400/50 leading-relaxed mb-4">{gen.description}</p>

              <div className="flex items-center gap-1 text-xs font-semibold text-teal-400 group-hover:text-teal-300 transition-colors">
                Launch Tool
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
