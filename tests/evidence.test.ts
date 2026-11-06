import { describe, it, expect, beforeEach } from 'vitest';
import { runDeterministicEvaluation } from '../src/lib/ai/provider';
import { retrieveRelevantGuidelines } from '../src/lib/ai/retrieval';
import { repository } from '../src/lib/storage/repository';

describe('Explainable AI & Evidence Citation Integrity', () => {
  beforeEach(() => {
    repository.resetToDemoData();
  });

  it('cites official stored guidelines and source documents for terminology issues', () => {
    const text = 'All users will love our new pricing tiers.';
    const context = retrieveRelevantGuidelines(text, ['Terminology']);
    const review = runDeterministicEvaluation(text, 'Website copy', ['Terminology'], context);

    expect(review.issues.length).toBeGreaterThan(0);
    const userIssue = review.issues.find((i) => i.original_text.toLowerCase() === 'users');
    expect(userIssue).toBeDefined();

    // Guideline reference must match an actual stored guideline title
    const storedGuides = repository.listGuidelines();
    const matchingStored = storedGuides.find((g) => g.title === userIssue?.guideline_reference);
    expect(matchingStored).toBeDefined();

    // Evidence must contain authentic excerpt
    expect(userIssue?.evidence).toContain('Nomenclature');
  });

  it('distinguishes unsupported claims and states "No approved supporting source found."', () => {
    const text = 'NovaTech is the best in the world.';
    const context = retrieveRelevantGuidelines(text, ['Promotional Claims']);
    const review = runDeterministicEvaluation(text, 'Advertisement', ['Promotional Claims'], context);

    const claimIssue = review.issues.find((i) => i.category === 'Promotional Claims');
    expect(claimIssue).toBeDefined();
    expect(claimIssue?.evidence).toBe('No approved supporting source found.');
  });
});
