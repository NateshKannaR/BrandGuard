import { describe, it, expect, beforeEach } from 'vitest';
import { repository } from '../src/lib/storage/repository';

describe('Human Review & Approval Workflow', () => {
  beforeEach(() => {
    repository.resetToDemoData();
  });

  it('progresses submission through draft -> submitted -> approved lifecycle', () => {
    const creator = repository.getUsers().find((u) => u.role === 'creator')!;
    const reviewer = repository.getUsers().find((u) => u.role === 'reviewer')!;

    // 1. Create submission
    const submission = repository.createSubmission({
      title: 'Product Launch Draft',
      contentType: 'Email campaign',
      rawText: 'Join 150 customers using NovaTech cloud.',
      reviewCategories: ['Tone of Voice', 'Terminology'],
      creator,
    });

    expect(submission.status).toBe('submitted');
    expect(submission.creatorName).toBe(creator.name);

    // 2. Put into review
    const inReview = repository.transitionStatus(submission.id, 'in_review', reviewer);
    expect(inReview?.status).toBe('in_review');
    expect(inReview?.reviewerName).toBe(reviewer.name);

    // 3. Reviewer approves
    const approved = repository.transitionStatus(submission.id, 'approved', reviewer, 'Compliant with tone.');
    expect(approved?.status).toBe('approved');
    expect(approved?.approvedAt).toBeDefined();
  });

  it('records revisions when creator updates submission copy', () => {
    const sub = repository.listSubmissions()[0];
    const initialRevCount = sub.revisions.length;

    const updated = repository.addRevision(
      sub.id,
      'Updated revised content text for campaign.',
      'Accepted terminology corrections',
      'Alex Chen'
    );

    expect(updated?.revisions.length).toBe(initialRevCount + 1);
    expect(updated?.currentText).toBe('Updated revised content text for campaign.');
  });

  it('appends comments to submission audit trail', () => {
    const sub = repository.listSubmissions()[0];
    const reviewer = repository.getUsers().find((u) => u.role === 'reviewer')!;

    const updated = repository.addComment(
      sub.id,
      'Please verify the SLA citation before publication.',
      reviewer
    );

    expect(updated?.comments.some((c) => c.text.includes('SLA citation'))).toBe(true);
  });
});
