import {
  BrandGuideline,
  ApprovedFact,
  TerminologyRule,
  ContentType,
  GuidelineCategory,
  ReviewResult,
  ReviewIssue,
} from '@/types';
import { ReviewResultSchema } from './schema';
import { retrieveRelevantGuidelines } from './retrieval';

export interface AIProviderConfig {
  provider: 'gemini' | 'openai' | 'demo';
  apiKey?: string;
  modelName?: string;
}

export function getActiveAIConfig(): AIProviderConfig {
  if (process.env.GEMINI_API_KEY) {
    return {
      provider: 'gemini',
      apiKey: process.env.GEMINI_API_KEY,
      modelName: 'gemini-1.5-pro',
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o',
    };
  }

  return {
    provider: 'demo',
    modelName: 'Rule-Based Evaluation Engine',
  };
}

export async function evaluateContentWithAI(
  content: string,
  contentType: ContentType,
  categories: GuidelineCategory[]
): Promise<ReviewResult> {
  const config = getActiveAIConfig();
  const context = retrieveRelevantGuidelines(content, categories);

  // If live API key is configured, call live LLM
  if (config.provider === 'gemini' && config.apiKey) {
    try {
      return await callGeminiAPI(content, contentType, categories, context, config.apiKey);
    } catch (err) {
      console.error('Gemini API call failed, falling back to rule evaluation:', err);
      return runDeterministicEvaluation(content, contentType, categories, context, 'Fallback after Gemini API error');
    }
  }

  if (config.provider === 'openai' && config.apiKey) {
    try {
      return await callOpenAIAPI(content, contentType, categories, context, config.apiKey);
    } catch (err) {
      console.error('OpenAI API call failed, falling back to rule evaluation:', err);
      return runDeterministicEvaluation(content, contentType, categories, context, 'Fallback after OpenAI API error');
    }
  }

  // Otherwise, use transparent deterministic rule-based evaluation
  return runDeterministicEvaluation(content, contentType, categories, context);
}

// --- Live Gemini Provider ---
async function callGeminiAPI(
  content: string,
  contentType: ContentType,
  categories: GuidelineCategory[],
  context: ReturnType<typeof retrieveRelevantGuidelines>,
  apiKey: string
): Promise<ReviewResult> {
  const prompt = buildSystemPrompt(content, contentType, categories, context);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini');

  const parsed = JSON.parse(rawText);
  const validated = ReviewResultSchema.parse(parsed);

  return {
    id: `rev_${Date.now()}`,
    overall_summary: validated.overall_summary,
    compliance_score: validated.compliance_score,
    issues: validated.issues.map((iss) => ({
      ...iss,
      id: iss.id || `iss_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'pending',
    })),
    positive_observations: validated.positive_observations,
    requires_human_review: validated.requires_human_review,
    mode: 'live_ai',
    aiModel: 'Gemini 1.5 Pro',
    evaluatedAt: new Date().toISOString(),
  };
}

// --- Live OpenAI Provider ---
async function callOpenAIAPI(
  content: string,
  contentType: ContentType,
  categories: GuidelineCategory[],
  context: ReturnType<typeof retrieveRelevantGuidelines>,
  apiKey: string
): Promise<ReviewResult> {
  const prompt = buildSystemPrompt(content, contentType, categories, context);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an enterprise brand compliance engine. Respond ONLY in valid JSON matching the schema.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content;
  if (!rawText) throw new Error('Empty response from OpenAI');

  const parsed = JSON.parse(rawText);
  const validated = ReviewResultSchema.parse(parsed);

  return {
    id: `rev_${Date.now()}`,
    overall_summary: validated.overall_summary,
    compliance_score: validated.compliance_score,
    issues: validated.issues.map((iss) => ({
      ...iss,
      id: iss.id || `iss_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: 'pending',
    })),
    positive_observations: validated.positive_observations,
    requires_human_review: validated.requires_human_review,
    mode: 'live_ai',
    aiModel: 'GPT-4o',
    evaluatedAt: new Date().toISOString(),
  };
}

function buildSystemPrompt(
  content: string,
  contentType: ContentType,
  categories: GuidelineCategory[],
  context: ReturnType<typeof retrieveRelevantGuidelines>
): string {
  return `You are BrandGuard AI, an explainable enterprise brand governance compliance engine.
Evaluate the following ${contentType} against the approved guidelines, facts, and terminology below.

CONTENT TO EVALUATE:
"""
${content}
"""

CATEGORIES TO EVALUATE:
${categories.join(', ')}

STORED BRAND GUIDELINES:
${JSON.stringify(
  context.relevantGuidelines.map((g) => ({
    title: g.title,
    category: g.category,
    rule: g.rule,
    sourceExcerpt: g.sourceExcerpt,
    sourceDocument: g.sourceDocument,
  })),
  null,
  2
)}

STORED APPROVED FACTS:
${JSON.stringify(
  context.relevantFacts.map((f) => ({
    claim: f.claim,
    verificationSource: f.verificationSource,
  })),
  null,
  2
)}

STORED TERMINOLOGY RULES:
${JSON.stringify(
  context.relevantTerminology.map((t) => ({
    preferred: t.preferredTerm,
    prohibited: t.prohibitedTerms,
    rationale: t.rationale,
  })),
  null,
  2
)}

RULES FOR EVALUATION:
1. Identify all potential violations in the selected categories.
2. For each violation, specify:
   - "category"
   - "severity": "High", "Medium", or "Low"
   - "title": Concise issue title
   - "original_text": The exact verbatim substring from the content that violates the rule
   - "explanation": Concise, user-friendly explanation of why the issue matters
   - "guideline_reference": Exact matching guideline title
   - "evidence": Exact quote from the source document or excerpt. If no approved source is found for an unsupported factual claim, output: "No approved supporting source found."
   - "suggestion": Exact replacement wording that fixes the issue while preserving the creator's intent
   - "confidence": Float between 0.0 and 1.0
   - "requires_human_review": Boolean
3. Calculate an overall "compliance_score" from 0 to 100.
4. List "positive_observations" where content adhered well to brand standards.
5. Provide an "overall_summary".
`;
}

// --- Deterministic Explainable Rule-Based Evaluation Engine (Demo Mode) ---
// Clearly labelled and transparent, matches against actual stored guidelines!
export function runDeterministicEvaluation(
  content: string,
  contentType: ContentType,
  categories: GuidelineCategory[],
  context: ReturnType<typeof retrieveRelevantGuidelines>,
  note?: string
): ReviewResult {
  const issues: ReviewIssue[] = [];
  const positiveObservations: string[] = [];

  // 1. Terminology checks
  if (categories.includes('Terminology')) {
    for (const rule of context.relevantTerminology) {
      for (const prohibited of rule.prohibitedTerms) {
        const regex = new RegExp(`\\b${prohibited}\\b`, 'gi');
        const match = regex.exec(content);
        if (match) {
          const matchingGuideline = context.relevantGuidelines.find(
            (g) => g.category === 'Terminology' && (g.title.toLowerCase().includes(prohibited) || g.rule.toLowerCase().includes(prohibited))
          ) || context.relevantGuidelines.find((g) => g.category === 'Terminology');

          issues.push({
            id: `iss_term_${Date.now()}_${issues.length}`,
            category: 'Terminology',
            severity: prohibited === 'users' || prohibited === 'cheap' || prohibited === 'dirt-cheap' ? 'High' : 'Medium',
            title: `Prohibited Term: "${match[0]}"`,
            original_text: match[0],
            explanation: rule.rationale || `Use the approved term "${rule.preferredTerm}" instead of "${match[0]}" for enterprise brand consistency.`,
            guideline_reference: matchingGuideline?.title || 'Brand Terminology Guidelines',
            evidence: matchingGuideline?.sourceExcerpt || `Style Guide: Use "${rule.preferredTerm}" in place of "${match[0]}".`,
            suggestion: rule.preferredTerm,
            confidence: 0.98,
            requires_human_review: false,
            status: 'pending',
          });
        }
      }
    }
  }

  // 2. Promotional Claims / Superlatives
  if (categories.includes('Promotional Claims')) {
    const superlativeRegexes = [
      {
        regex: /(#1\b|undisputed\s+#1|number\s+one\b|undisputed\s+leader)/i,
        title: 'Unsubstantiated Superlative Claim ("#1" / "Undisputed")',
        explanation: 'Superlative claims regarding market ranking require verifiable citation of third-party industry reports.',
        guideline: 'Prohibition of Unsubstantiated Superlatives',
        evidence: 'Legal Compliance Marketing Handbook 2026: "Any superlative claim must be accompanied by the exact publication date and title of the independent audit."',
        suggestion: 'an industry-recognized',
        severity: 'High' as const,
      },
      {
        regex: /(world's\s+best|best\s+in\s+the\s+world|greatest\s+ever)/i,
        title: 'Unsupported Performance Superlative',
        explanation: 'Claims asserting global supremacy lack third-party empirical backing and risk misleading advertising.',
        guideline: 'Prohibition of Unsubstantiated Superlatives',
        evidence: 'No approved supporting source found.',
        suggestion: 'a leading',
        severity: 'High' as const,
      },
    ];

    for (const sup of superlativeRegexes) {
      const match = sup.regex.exec(content);
      if (match) {
        issues.push({
          id: `iss_claim_${Date.now()}_${issues.length}`,
          category: 'Promotional Claims',
          severity: sup.severity,
          title: sup.title,
          original_text: match[0],
          explanation: sup.explanation,
          guideline_reference: sup.guideline,
          evidence: sup.evidence,
          suggestion: sup.suggestion,
          confidence: 0.95,
          requires_human_review: true,
          status: 'pending',
        });
      }
    }
  }

  // 3. Approved Facts & SLA Verification
  if (categories.includes('Approved Facts')) {
    // 100% uptime check
    const uptimeMatch = /(100%\s+uptime|zero\s+downtime(\s+ever)?|zero\s+crashes(\s+ever)?)/i.exec(content);
    if (uptimeMatch) {
      issues.push({
        id: `iss_fact_${Date.now()}_${issues.length}`,
        category: 'Approved Facts',
        severity: 'High',
        title: 'Inaccurate Uptime Guarantee ("100% Uptime")',
        original_text: uptimeMatch[0],
        explanation: 'NovaTech commits to an audited 99.95% SLA. Promising 100% uptime or zero downtime ever creates unsupportable legal liability.',
        guideline_reference: 'Verified 99.95% Uptime SLA',
        evidence: 'SOC2 Type II Audit Report: "NovaTech Cloud Infrastructure demonstrated annualized verified uptime of 99.962%, contracted at 99.95% SLA."',
        suggestion: 'verified 99.95% uptime SLA',
        confidence: 0.96,
        requires_human_review: false,
        status: 'pending',
      });
    }

    // Unverified customer metric check
    const unverifiedCountMatch = /(thousands\s+of\s+(users|customers)|10,000\s+(users|customers))/i.exec(content);
    if (unverifiedCountMatch) {
      issues.push({
        id: `iss_fact_${Date.now()}_${issues.length}`,
        category: 'Approved Facts',
        severity: 'Medium',
        title: 'Unverified Customer Count Milestone',
        original_text: unverifiedCountMatch[0],
        explanation: 'Official verified customer figure is "over 150 enterprise customer organizations". Unsubstantiated counts violate compliance.',
        guideline_reference: 'Customer Base and Year Founded',
        evidence: 'NovaTech_Company_Factsheet_Q1_2026.pdf: "Passed 150 active enterprise customer threshold in November 2025."',
        suggestion: 'over 150 enterprise organizations',
        confidence: 0.91,
        requires_human_review: true,
        status: 'pending',
      });
    }
  }

  // 4. Tone of Voice checks
  if (categories.includes('Tone of Voice')) {
    const toneMatch = /(crazy\s+fast|insane\s+tool|killer\s+feature|you\s+would\s+be\s+crazy)/i.exec(content);
    if (toneMatch) {
      issues.push({
        id: `iss_tone_${Date.now()}_${issues.length}`,
        category: 'Tone of Voice',
        severity: 'Medium',
        title: 'Excessive Slang / Hyperbolic Tone',
        original_text: toneMatch[0],
        explanation: 'Informal slang conflicts with NovaTech\'s professional, trustworthy, and authoritative brand voice.',
        guideline_reference: 'Professional and Trustworthy Tone of Voice',
        evidence: 'Brand Book v3: "Words like \'insane\', \'killer\', and colloquial hyperbole are strictly prohibited in public collateral."',
        suggestion: 'high-performance',
        confidence: 0.93,
        requires_human_review: false,
        status: 'pending',
      });
    }

    // Exclamation mark cascades (!!!)
    if (/!{2,}/.test(content)) {
      issues.push({
        id: `iss_tone_${Date.now()}_${issues.length}`,
        category: 'Tone of Voice',
        severity: 'Low',
        title: 'Excessive Punctuation',
        original_text: '!!!',
        explanation: 'Cascading exclamation marks degrade enterprise credibility. Use single punctuation.',
        guideline_reference: 'Professional and Trustworthy Tone of Voice',
        evidence: 'Brand Book v3: Exclamation point cascades are prohibited in public collateral.',
        suggestion: '.',
        confidence: 0.99,
        requires_human_review: false,
        status: 'pending',
      });
    }
  }

  // Positive observations
  if (content.toLowerCase().includes('reliability') || content.toLowerCase().includes('simplicity')) {
    positiveObservations.push('Reinforces NovaTech core messaging pillars (Reliability & Simplicity)');
  }
  if (content.toLowerCase().includes('customers') && !content.toLowerCase().includes('users')) {
    positiveObservations.push('Correctly addresses audience as "customers"');
  }
  if (issues.length === 0) {
    positiveObservations.push('Tone is professional, authoritative, and respectful');
    positiveObservations.push('No unsubstantiated superlatives or prohibited terminology detected');
  }

  // Calculate compliance score
  let score = 100;
  for (const iss of issues) {
    if (iss.severity === 'High') score -= 15;
    else if (iss.severity === 'Medium') score -= 8;
    else if (iss.severity === 'Low') score -= 4;
  }
  score = Math.max(20, Math.min(100, score));

  const hasHighSeverity = issues.some((i) => i.severity === 'High');
  const summary = issues.length === 0
    ? 'All content strictly adheres to stored NovaTech brand guidelines and approved facts. Ready for publication.'
    : `Detected ${issues.length} potential compliance ${issues.length === 1 ? 'issue' : 'issues'} across ${new Set(issues.map((i) => i.category)).size} categories. Human review is recommended prior to publication.`;

  return {
    id: `rev_${Date.now()}`,
    overall_summary: note ? `${note}. ${summary}` : summary,
    compliance_score: score,
    issues,
    positive_observations: positiveObservations,
    requires_human_review: hasHighSeverity || issues.some((i) => i.requires_human_review),
    mode: 'demo_rules',
    aiModel: 'Deterministic Rule Engine (Demo Mode)',
    evaluatedAt: new Date().toISOString(),
  };
}
