import { describe, it, expect } from 'vitest';
import { ReviewResultSchema, ReviewIssueSchema } from '../src/lib/ai/schema';

describe('AI Output Structured Schema Validation', () => {
  it('validates a compliant review output payload', () => {
    const mockOutput = {
      overall_summary: 'Brand compliance review completed successfully.',
      compliance_score: 95,
      issues: [
        {
          id: 'iss_1',
          category: 'Terminology',
          severity: 'High',
          title: 'Prohibited Term: "users"',
          original_text: 'users',
          explanation: 'Use customers instead of users.',
          guideline_reference: 'Customer-First Terminology',
          evidence: 'Section 4.3: Nomenclature.',
          suggestion: 'customers',
          confidence: 0.95,
          requires_human_review: false,
        },
      ],
      positive_observations: ['Clear product value proposition.'],
      requires_human_review: false,
    };

    const parsed = ReviewResultSchema.safeParse(mockOutput);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.compliance_score).toBe(95);
      expect(parsed.data.issues.length).toBe(1);
    }
  });

  it('rejects an invalid severity or missing required fields', () => {
    const invalidOutput = {
      overall_summary: 'Missing fields',
      issues: [
        {
          category: 'Tone',
          severity: 'Critical', // Invalid severity
          title: '',
        },
      ],
    };

    const parsed = ReviewResultSchema.safeParse(invalidOutput);
    expect(parsed.success).toBe(false);
  });
});
