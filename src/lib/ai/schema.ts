import { z } from 'zod';

export const ReviewIssueSchema = z.object({
  id: z.string().default(() => `iss_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`),
  category: z.string(),
  severity: z.enum(['High', 'Medium', 'Low']),
  title: z.string().min(1),
  original_text: z.string(),
  explanation: z.string().min(1),
  guideline_reference: z.string().min(1),
  evidence: z.string().min(1),
  suggestion: z.string(),
  confidence: z.number().min(0).max(1).default(0.85),
  requires_human_review: z.boolean().default(false),
});

export const ReviewResultSchema = z.object({
  overall_summary: z.string().min(1),
  compliance_score: z.number().min(0).max(100).default(80),
  issues: z.array(ReviewIssueSchema).default([]),
  positive_observations: z.array(z.string()).default([]),
  requires_human_review: z.boolean().default(false),
});

export type ReviewResultOutput = z.infer<typeof ReviewResultSchema>;
export type ReviewIssueOutput = z.infer<typeof ReviewIssueSchema>;
