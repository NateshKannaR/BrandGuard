import { describe, it, expect, beforeEach } from 'vitest';
import { repository } from '../src/lib/storage/repository';
import { retrieveRelevantGuidelines } from '../src/lib/ai/retrieval';

describe('Brand Knowledge Hub & Retrieval', () => {
  beforeEach(() => {
    repository.resetToDemoData();
  });

  it('lists seeded brand guidelines correctly', () => {
    const list = repository.listGuidelines();
    expect(list.length).toBeGreaterThan(5);
    expect(list.some((g) => g.category === 'Tone of Voice')).toBe(true);
    expect(list.some((g) => g.category === 'Terminology')).toBe(true);
  });

  it('creates and retrieves a new brand guideline', () => {
    const newGuide = repository.createGuideline({
      title: 'No Jargon in Press Releases',
      category: 'Tone of Voice',
      rule: 'Avoid unverified tech jargon like synergy or cloud-native wizardry.',
      description: 'Clarity over hype.',
      sourceDocument: 'PR_Charter.pdf',
      isActive: true,
    });

    expect(newGuide.id).toBeDefined();
    const fetched = repository.getGuideline(newGuide.id);
    expect(fetched?.title).toBe('No Jargon in Press Releases');
  });

  it('filters guidelines by category and keyword search', () => {
    const termList = repository.listGuidelines({ category: 'Terminology' });
    expect(termList.every((g) => g.category === 'Terminology')).toBe(true);

    const searchList = repository.listGuidelines({ query: 'Uptime' });
    expect(searchList.some((g) => g.title.includes('Uptime'))).toBe(true);
  });

  it('retrieves relevant terminology and guidelines for violating text', () => {
    const sampleCopy = 'Our users enjoy dirt-cheap pricing and 100% uptime.';
    const context = retrieveRelevantGuidelines(sampleCopy, ['Terminology', 'Approved Facts']);

    expect(context.relevantTerminology.some((t) => t.preferredTerm === 'customers')).toBe(true);
    expect(context.relevantTerminology.some((t) => t.preferredTerm === 'cost-effective')).toBe(true);
    expect(context.relevantFacts.some((f) => f.tags.includes('uptime'))).toBe(true);
  });
});
