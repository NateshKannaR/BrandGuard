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
    <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 p-4 rounded-2xl border border-blue-200/80 shadow-2xs space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>Interactive Judge Scenarios (1-Click Presets)</span>
        </div>
        <span className="text-[11px] text-blue-600 font-medium hidden sm:inline">
          Click any preset to populate and test compliance rules
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        {DEMO_SCENARIOS.map((sc) => {
          const isActive = activeScenarioId === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => onSelect(sc)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white/80 border-slate-200 hover:bg-white hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="text-xs font-bold text-slate-900">{sc.name}</h4>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {sc.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
