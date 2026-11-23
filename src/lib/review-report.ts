import type { ReviewResult } from '@/types';

export function formatReviewReport(title: string, review: ReviewResult) {
  const findings = review.issues.map((issue, index) => [
    `${index + 1}. ${issue.title} (${issue.severity}, ${issue.category})`,
    `   Original text: ${issue.original_text}`,
    `   Finding: ${issue.explanation}`,
    `   Guideline: ${issue.guideline_reference}`,
    `   Evidence: ${issue.evidence}`,
    `   Suggested change: ${issue.suggestion}`,
    `   Status: ${issue.status ?? 'pending'}`,
    ...(issue.edited_text === undefined ? [] : [`   Edited text: ${issue.edited_text}`]),
  ].join('\n'));

  return [
    'BrandGuard compliance review',
    `Title: ${title.trim() || 'Untitled draft'}`,
    `Evaluated: ${review.evaluatedAt}`,
    `Engine: ${review.aiModel || (review.mode === 'demo_rules' ? 'Demo rules' : 'Live AI')}`,
    `Compliance score: ${review.compliance_score}/100`,
    `Human review flagged: ${review.requires_human_review ? 'Yes' : 'No'}`,
    '',
    review.overall_summary,
    '',
    'Findings',
    findings.join('\n\n') || 'No findings.',
    '',
    'Positive observations',
    review.positive_observations.map((observation) => `- ${observation}`).join('\n') || 'None recorded.',
  ].join('\n');
}
