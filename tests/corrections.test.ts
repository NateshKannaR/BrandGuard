import { describe, it, expect } from 'vitest';

describe('Correction Engine & Text Replacement', () => {
  it('applies single word corrections while preserving surrounding copy', () => {
    const original = 'NovaTech empowers over 150 users worldwide.';
    const originalWord = 'users';
    const suggestion = 'customers';

    const regex = new RegExp(`\\b${originalWord}\\b`, 'gi');
    const corrected = original.replace(regex, suggestion);

    expect(corrected).toBe('NovaTech empowers over 150 customers worldwide.');
    expect(corrected).not.toContain('users');
  });

  it('applies batch multiple corrections accurately', () => {
    let text = 'Our cheap tool serves 10,000 users with zero crashes ever.';
    const corrections = [
      { from: 'cheap', to: 'cost-effective' },
      { from: 'tool', to: 'platform' },
      { from: 'users', to: 'customers' },
      { from: 'zero crashes ever', to: 'a verified 99.95% uptime SLA' },
    ];

    for (const c of corrections) {
      const regex = new RegExp(`\\b${c.from}\\b`, 'gi');
      text = text.replace(regex, c.to);
    }

    expect(text).toBe(
      'Our cost-effective platform serves 10,000 customers with a verified 99.95% uptime SLA.'
    );
  });
});
