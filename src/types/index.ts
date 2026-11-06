export type UserRole = 'creator' | 'reviewer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  title?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    neutral: string;
  };
}

export type GuidelineCategory =
  | 'Tone of Voice'
  | 'Terminology'
  | 'Approved Facts'
  | 'Messaging'
  | 'Visual Identity'
  | 'Accessibility'
  | 'Promotional Claims';

export interface BrandGuideline {
  id: string;
  organizationId: string;
  title: string;
  category: GuidelineCategory;
  rule: string;
  description: string;
  sourceDocument?: string;
  sourceExcerpt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  examples?: {
    approved: string[];
    prohibited: string[];
  };
}

export interface ApprovedFact {
  id: string;
  organizationId: string;
  claim: string;
  verificationSource: string;
  category: string;
  lastVerifiedDate: string;
  tags: string[];
}

export interface TerminologyRule {
  id: string;
  organizationId: string;
  preferredTerm: string;
  prohibitedTerms: string[];
  context: string;
  rationale: string;
}

export interface BrandAsset {
  id: string;
  organizationId: string;
  name: string;
  type: 'logo' | 'color_palette' | 'typography' | 'imagery' | 'template';
  assetUrl?: string;
  specifications: Record<string, string | number | boolean>;
}

export type ContentType =
  | 'Social media post'
  | 'Advertisement'
  | 'Website copy'
  | 'Email campaign'
  | 'Marketing document'
  | 'General promotional content';

export type SubmissionStatus =
  | 'draft'
  | 'submitted'
  | 'in_review'
  | 'changes_requested'
  | 'approved'
  | 'rejected';

export type IssueSeverity = 'High' | 'Medium' | 'Low';

export interface ReviewIssue {
  id: string;
  category: GuidelineCategory | string;
  severity: IssueSeverity;
  title: string;
  original_text: string;
  explanation: string;
  guideline_reference: string;
  evidence: string;
  suggestion: string;
  confidence: number;
  requires_human_review: boolean;
  status?: 'pending' | 'accepted' | 'rejected' | 'edited';
  edited_text?: string;
}

export interface ReviewResult {
  id: string;
  overall_summary: string;
  compliance_score: number; // 0 - 100
  issues: ReviewIssue[];
  positive_observations: string[];
  requires_human_review: boolean;
  mode: 'live_ai' | 'demo_rules';
  aiModel?: string;
  evaluatedAt: string;
}

export interface ReviewComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  createdAt: string;
  issueId?: string;
}

export interface Revision {
  revisionNumber: number;
  content: string;
  createdAt: string;
  createdBy: string;
  changeSummary?: string;
}

export interface ContentSubmission {
  id: string;
  organizationId: string;
  title: string;
  contentType: ContentType;
  rawText: string;
  currentText: string;
  status: SubmissionStatus;
  creatorId: string;
  creatorName: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewCategories: GuidelineCategory[];
  latestReview?: ReviewResult;
  comments: ReviewComment[];
  revisions: Revision[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  attachedImages?: string[];
}

export interface VisualReviewFinding {
  id: string;
  category: 'Logo Placement' | 'Color Consistency' | 'Typography' | 'Visible Claims' | 'Accessibility';
  severity: IssueSeverity;
  title: string;
  description: string;
  observedValue?: string;
  expectedRule: string;
  confidence: number;
  requiresHumanReview: boolean;
  recommendation: string;
}

export interface VisualReviewResult {
  id: string;
  imageUrl: string;
  filename: string;
  overallSummary: string;
  complianceScore: number;
  findings: VisualReviewFinding[];
  detectedPalette: string[];
  extractedText?: string;
  mode: 'live_vision' | 'demo_vision';
  evaluatedAt: string;
}

export interface GovernanceMetrics {
  totalReviews: number;
  totalSubmissions: number;
  approvedCount: number;
  pendingCount: number;
  changesRequestedCount: number;
  rejectedCount: number;
  avgComplianceScore: number;
  correctionAcceptanceRate: number;
  categoryViolations: { category: string; count: number }[];
  recurringMistakes: { termOrPhrase: string; occurrences: number; recommendation: string }[];
  severityDistribution: { severity: IssueSeverity; count: number }[];
  activityTrends: { date: string; reviews: number; approvals: number }[];
  insights: {
    id: string;
    type: 'warning' | 'info' | 'recommendation';
    title: string;
    description: string;
    actionLabel?: string;
    actionUrl?: string;
  }[];
}
