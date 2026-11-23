import { describe, expect, it } from 'vitest';
import type { ContentSubmission } from '@/types';
import { getQueueResults, queueToCsv } from '@/lib/queue';
import { formatReviewReport } from '@/lib/review-report';
import { DEMO_SUBMISSIONS } from '@/lib/storage/mock-data';

const reviewed = DEMO_SUBMISSIONS.find((submission) => submission.latestReview?.issues.length)!;
const review = reviewed.latestReview!;
const submissions: ContentSubmission[] = [
  { ...reviewed, id: 'a', title: 'Email launch', creatorId: 'creator', reviewerId: 'reviewer', status: 'in_review', currentText: 'Updated campaign wording', createdAt: '2026-01-01', updatedAt: '2026-01-02', latestReview: { ...review, compliance_score: 90 } },
  { ...reviewed, id: 'b', title: 'Landing page', creatorId: 'other', reviewerId: 'reviewer', status: 'approved', createdAt: '2026-02-01', updatedAt: '2026-02-02', latestReview: { ...review, compliance_score: 55 } },
  { ...reviewed, id: 'c', title: 'Draft', creatorId: 'creator', reviewerId: undefined, status: 'draft', createdAt: '2026-03-01', updatedAt: '2026-03-02', latestReview: undefined },
];
const defaults = { status: 'all', view: 'all', sort: 'updated', userId: 'creator', query: '' } as const;

describe('Advanced queue', () => {
  it('combines role, status and case-insensitive search of revised content', () => {
    expect(getQueueResults(submissions, { ...defaults, view: 'created', status: 'in_review', query: '  CAMPAIGN WORDING ' }).map(({ id }) => id)).toEqual(['a']);
    expect(getQueueResults(submissions, { ...defaults, view: 'assigned', userId: 'reviewer' }).map(({ id }) => id)).toEqual(['b', 'a']);
    expect(getQueueResults(submissions, { ...defaults, status: 'draft' }).map(({ id }) => id)).toEqual(['c']);
    expect(getQueueResults(submissions, { ...defaults, query: 'missing' })).toEqual([]);
  });

  it('sorts chronologically or by score and puts unscored records last', () => {
    expect(getQueueResults(submissions, { ...defaults, sort: 'oldest' }).map(({ id }) => id)).toEqual(['a', 'b', 'c']);
    expect(getQueueResults(submissions, { ...defaults, sort: 'lowest-score' }).map(({ id }) => id)).toEqual(['b', 'a', 'c']);
    expect(submissions.map(({ id }) => id)).toEqual(['a', 'b', 'c']);
  });

  it('exports only matching rows and escapes CSV and formula prefixes', () => {
    const matching = getQueueResults(submissions, { ...defaults, status: 'approved' });
    const report = queueToCsv([{ ...matching[0], title: '=1+2, "report"' }]);
    expect(report).toContain(`"'=1+2, ""report"""`);
    expect(report.split('\r\n')).toHaveLength(2);
    expect(report).not.toContain('Email launch');
  });
});

describe('Review report', () => {
  it('includes the score, findings, evidence and correction status', () => {
    const issue = { ...review.issues[0], status: 'edited' as const, edited_text: 'Replacement copy' };
    const report = formatReviewReport(' Launch ', { ...review, issues: [issue] });
    expect(report).toContain('Title: Launch');
    expect(report).toContain(`Compliance score: ${review.compliance_score}/100`);
    expect(report).toContain(issue.guideline_reference);
    expect(report).toContain(issue.evidence);
    expect(report).toContain('Status: edited');
    expect(report).toContain('Edited text: Replacement copy');
  });

  it('handles an untitled review without findings or positive observations', () => {
    const report = formatReviewReport('', { ...review, issues: [], positive_observations: [] });
    expect(report).toContain('Untitled draft');
    expect(report).toContain('No findings.');
    expect(report).toContain('None recorded.');
  });
});
