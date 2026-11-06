'use client';

import React from 'react';
import { Sparkles, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ContentType, GuidelineCategory } from '@/types';

export interface DemoScenario {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  description: string;
  title: string;
  contentType: ContentType;
  categories: GuidelineCategory[];
  text: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scenario_regulatory',
    name: 'Regulatory & SLA Violations',
    badge: 'High Risk (4 Flags)',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
    description: 'Contains unverified #1 claims, unverified 100% uptime, dirt-cheap pricing, and "users".',
    title: 'Q1 Enterprise Cloud Launch Announcement',
    contentType: 'Social media post',
    categories: ['Tone of Voice', 'Terminology', 'Approved Facts', 'Promotional Claims'],
    text: 'NovaTech is the undisputed #1 cloud platform in the world! Over 10,000 users agree our cheap pricing delivers 100% uptime with zero crashes ever. Check out our crazy fast tool now!',
  },
  {
    id: 'scenario_tone',
    name: 'Slang & Tone Inconsistency',
    badge: 'Medium Risk (3 Flags)',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Informal hype words, excessive exclamation marks, and prohibited "tool" nomenclature.',
    title: 'Spring Product Feature Announcement',
    contentType: 'Website copy',
    categories: ['Tone of Voice', 'Terminology', 'Messaging'],
    text: 'You would be crazy not to switch right now! Our killer new tool crushes legacy database latency and gives users insane speed boosts across the stack!!!',
  },
  {
    id: 'scenario_compliant',
    name: 'Exemplary Approved Enterprise Copy',
    badge: 'Clean (100/100)',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Adheres to 99.95% audited SLA, customer-first terms, and core reliability pillars.',
    title: 'Customer Advisory on Cloud Architecture Resilience',
    contentType: 'Marketing document',
    categories: ['Tone of Voice', 'Terminology', 'Approved Facts', 'Messaging'],
    text: 'At NovaTech Solutions, our enterprise platform is anchored on three core pillars: Architectural Reliability, Operational Simplicity, and Measurable Customer Value. Over 150 enterprise customers rely on our verified 99.95% uptime SLA.',
  },
];

interface ScenarioSwitcherProps {
  onSelect: (scenario: DemoScenario) => void;
  activeScenarioId?: string;
}

export function ScenarioSwitcher({ onSelect, activeScenarioId }: ScenarioSwitcherProps) {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-blue-200/70 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900">
          <div className="h-6 w-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span>Interactive Evaluator Test Presets</span>
        </div>
        <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
          One-click scenarios designed for hackathon judges & audit testing
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {DEMO_SCENARIOS.map((sc) => {
          const isActive = activeScenarioId === sc.id;
          const Icon =
            sc.id === 'scenario_regulatory'
              ? ShieldAlert
              : sc.id === 'scenario_tone'
              ? AlertTriangle
              : CheckCircle2;

          return (
            <button
              key={sc.id}
              onClick={() => onSelect(sc)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between relative group ${
                isActive
                  ? 'bg-white border-blue-500 shadow-md shadow-blue-500/15 ring-2 ring-blue-500/20'
                  : 'bg-white hover:bg-slate-50/80 border-slate-200 hover:border-slate-300 shadow-2xs hover:-translate-y-0.5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon
                      className={`h-3.5 w-3.5 shrink-0 ${
                        sc.id === 'scenario_regulatory'
                          ? 'text-red-500'
                          : sc.id === 'scenario_tone'
                          ? 'text-amber-500'
                          : 'text-emerald-500'
                      }`}
                    />
                    <h4 className="text-xs font-bold text-slate-900 truncate">{sc.name}</h4>
                  </div>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border shrink-0 ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {sc.description}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 font-medium">{sc.contentType}</span>
                <span className={`font-bold transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`}>
                  {isActive ? 'Active Preset ✓' : 'Load Preset →'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
