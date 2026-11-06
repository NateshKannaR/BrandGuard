import {
  BrandGuideline,
  ApprovedFact,
  TerminologyRule,
  BrandAsset,
  ContentSubmission,
  GovernanceMetrics,
  Organization,
  User,
  ReviewResult,
  SubmissionStatus,
  UserRole,
} from '@/types';
import {
  DEMO_ORGANIZATION,
  DEMO_USERS,
  DEMO_GUIDELINES,
  DEMO_APPROVED_FACTS,
  DEMO_TERMINOLOGY_RULES,
  DEMO_BRAND_ASSETS,
  DEMO_SUBMISSIONS,
  DEMO_METRICS,
} from './mock-data';

// Singleton in-memory store that persists across API calls within the Node process
// and can sync to local storage / file if desired.
class BrandGuardRepository {
  private organization: Organization = { ...DEMO_ORGANIZATION };
  private users: User[] = [...DEMO_USERS];
  private guidelines: BrandGuideline[] = [...DEMO_GUIDELINES];
  private approvedFacts: ApprovedFact[] = [...DEMO_APPROVED_FACTS];
  private terminologyRules: TerminologyRule[] = [...DEMO_TERMINOLOGY_RULES];
  private brandAssets: BrandAsset[] = [...DEMO_BRAND_ASSETS];
  private submissions: ContentSubmission[] = [...DEMO_SUBMISSIONS];
  private currentUser: User = DEMO_USERS[0]; // Alex Chen by default

  // --- Organization & Users ---
  getOrganization(): Organization {
    return this.organization;
  }

  getUsers(): User[] {
    return this.users;
  }

  getCurrentUser(): User {
    return this.currentUser;
  }

  setCurrentUser(userId: string): User {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      this.currentUser = user;
    }
    return this.currentUser;
  }

  // --- Brand Guidelines ---
  listGuidelines(params?: { category?: string; query?: string; activeOnly?: boolean }): BrandGuideline[] {
    let result = [...this.guidelines];

    if (params?.activeOnly) {
      result = result.filter((g) => g.isActive);
    }

    if (params?.category && params.category !== 'All') {
      result = result.filter((g) => g.category.toLowerCase() === params.category?.toLowerCase());
    }

    if (params?.query && params.query.trim().length > 0) {
      const q = params.query.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.rule.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          (g.sourceDocument && g.sourceDocument.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getGuideline(id: string): BrandGuideline | undefined {
    return this.guidelines.find((g) => g.id === id);
  }

  createGuideline(data: Omit<BrandGuideline, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>): BrandGuideline {
    const newGuideline: BrandGuideline = {
      ...data,
      id: `guide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organizationId: this.organization.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.guidelines.unshift(newGuideline);
    return newGuideline;
  }

  updateGuideline(id: string, updates: Partial<BrandGuideline>): BrandGuideline | undefined {
    const index = this.guidelines.findIndex((g) => g.id === id);
    if (index === -1) return undefined;

    this.guidelines[index] = {
      ...this.guidelines[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.guidelines[index];
  }

  deleteGuideline(id: string): boolean {
    const initialLen = this.guidelines.length;
    this.guidelines = this.guidelines.filter((g) => g.id !== id);
    return this.guidelines.length < initialLen;
  }

  // --- Approved Facts ---
  listApprovedFacts(query?: string): ApprovedFact[] {
    if (!query || query.trim() === '') return this.approvedFacts;
    const q = query.toLowerCase();
    return this.approvedFacts.filter(
      (f) =>
        f.claim.toLowerCase().includes(q) ||
        f.verificationSource.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  createApprovedFact(data: Omit<ApprovedFact, 'id' | 'organizationId'>): ApprovedFact {
    const newFact: ApprovedFact = {
      ...data,
      id: `fact_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organizationId: this.organization.id,
    };
    this.approvedFacts.unshift(newFact);
    return newFact;
  }

  // --- Terminology Rules ---
  listTerminologyRules(): TerminologyRule[] {
    return this.terminologyRules;
  }

  createTerminologyRule(data: Omit<TerminologyRule, 'id' | 'organizationId'>): TerminologyRule {
    const newRule: TerminologyRule = {
      ...data,
      id: `term_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organizationId: this.organization.id,
    };
    this.terminologyRules.unshift(newRule);
    return newRule;
  }

  // --- Brand Assets ---
  listBrandAssets(): BrandAsset[] {
    return this.brandAssets;
  }

  // --- Content Submissions & Review Queue ---
  listSubmissions(params?: { status?: string; creatorId?: string; query?: string }): ContentSubmission[] {
    let result = [...this.submissions];

    if (params?.status && params.status !== 'all') {
      result = result.filter((s) => s.status.toLowerCase() === params.status?.toLowerCase());
    }

    if (params?.creatorId) {
      result = result.filter((s) => s.creatorId === params.creatorId);
    }

    if (params?.query && params.query.trim().length > 0) {
      const q = params.query.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.rawText.toLowerCase().includes(q) ||
          s.creatorName.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  getSubmission(id: string): ContentSubmission | undefined {
    return this.submissions.find((s) => s.id === id);
  }

  createSubmission(data: {
    title: string;
    contentType: ContentSubmission['contentType'];
    rawText: string;
    reviewCategories: BrandGuideline['category'][];
    creator?: User;
    latestReview?: ReviewResult;
  }): ContentSubmission {
    const creator = data.creator || this.currentUser;
    const now = new Date().toISOString();

    const submission: ContentSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organizationId: this.organization.id,
      title: data.title,
      contentType: data.contentType,
      rawText: data.rawText,
      currentText: data.rawText,
      status: 'submitted',
      creatorId: creator.id,
      creatorName: creator.name,
      reviewCategories: data.reviewCategories,
      latestReview: data.latestReview,
      comments: [],
      revisions: [
        {
          revisionNumber: 1,
          content: data.rawText,
          createdAt: now,
          createdBy: creator.name,
          changeSummary: 'Initial content submission',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    this.submissions.unshift(submission);
    return submission;
  }

  updateSubmission(id: string, updates: Partial<ContentSubmission>): ContentSubmission | undefined {
    const index = this.submissions.findIndex((s) => s.id === id);
    if (index === -1) return undefined;

    this.submissions[index] = {
      ...this.submissions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return this.submissions[index];
  }

  addRevision(id: string, content: string, changeSummary: string, authorName: string): ContentSubmission | undefined {
    const submission = this.getSubmission(id);
    if (!submission) return undefined;

    const nextRevNum = (submission.revisions?.length || 0) + 1;
    const newRev = {
      revisionNumber: nextRevNum,
      content,
      createdAt: new Date().toISOString(),
      createdBy: authorName,
      changeSummary,
    };

    submission.revisions = [...(submission.revisions || []), newRev];
    submission.currentText = content;
    submission.updatedAt = new Date().toISOString();
    return submission;
  }

  addComment(id: string, text: string, user: User, issueId?: string): ContentSubmission | undefined {
    const submission = this.getSubmission(id);
    if (!submission) return undefined;

    const newComment = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      text,
      createdAt: new Date().toISOString(),
      issueId,
    };

    submission.comments = [...(submission.comments || []), newComment];
    submission.updatedAt = new Date().toISOString();
    return submission;
  }

  transitionStatus(id: string, status: SubmissionStatus, reviewer?: User, reason?: string): ContentSubmission | undefined {
    const submission = this.getSubmission(id);
    if (!submission) return undefined;

    const now = new Date().toISOString();
    submission.status = status;
    submission.updatedAt = now;

    if (reviewer) {
      submission.reviewerId = reviewer.id;
      submission.reviewerName = reviewer.name;
    }

    if (status === 'approved') {
      submission.approvedAt = now;
    } else if (status === 'rejected') {
      submission.rejectedAt = now;
      if (reason) submission.rejectionReason = reason;
    }

    return submission;
  }

  // --- Governance Analytics Engine ---
  getMetrics(): GovernanceMetrics {
    const totalSubmissions = this.submissions.length;
    const approvedCount = this.submissions.filter((s) => s.status === 'approved').length;
    const pendingCount = this.submissions.filter((s) => s.status === 'submitted' || s.status === 'in_review').length;
    const changesRequestedCount = this.submissions.filter((s) => s.status === 'changes_requested').length;
    const rejectedCount = this.submissions.filter((s) => s.status === 'rejected').length;

    // Calculate real-time categories violated across all reviews
    const categoryCounts: Record<string, number> = {};
    const severityCounts: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    let totalScore = 0;
    let reviewsWithScores = 0;

    for (const sub of this.submissions) {
      if (sub.latestReview) {
        totalScore += sub.latestReview.compliance_score;
        reviewsWithScores++;

        for (const issue of sub.latestReview.issues) {
          categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
          severityCounts[issue.severity] = (severityCounts[issue.severity] || 0) + 1;
        }
      }
    }

    const avgComplianceScore = reviewsWithScores > 0 ? Math.round((totalScore / reviewsWithScores) * 10) / 10 : 85;

    // Sort category violations
    const categoryViolations = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    })).sort((a, b) => b.count - a.count);

    // If there are few reviews yet, ensure realistic baseline distribution is displayed
    const finalCategoryViolations = categoryViolations.length > 0 ? categoryViolations : DEMO_METRICS.categoryViolations;

    return {
      totalReviews: DEMO_METRICS.totalReviews + reviewsWithScores,
      totalSubmissions,
      approvedCount,
      pendingCount,
      changesRequestedCount,
      rejectedCount,
      avgComplianceScore,
      correctionAcceptanceRate: DEMO_METRICS.correctionAcceptanceRate,
      categoryViolations: finalCategoryViolations,
      recurringMistakes: DEMO_METRICS.recurringMistakes,
      severityDistribution: [
        { severity: 'High', count: severityCounts.High + 19 },
        { severity: 'Medium', count: severityCounts.Medium + 32 },
        { severity: 'Low', count: severityCounts.Low + 18 },
      ],
      activityTrends: DEMO_METRICS.activityTrends,
      insights: DEMO_METRICS.insights,
    };
  }

  // --- Reset to Pristine Demo State ---
  resetToDemoData(): void {
    this.organization = { ...DEMO_ORGANIZATION };
    this.users = [...DEMO_USERS];
    this.guidelines = [...DEMO_GUIDELINES];
    this.approvedFacts = [...DEMO_APPROVED_FACTS];
    this.terminologyRules = [...DEMO_TERMINOLOGY_RULES];
    this.brandAssets = [...DEMO_BRAND_ASSETS];
    this.submissions = [...DEMO_SUBMISSIONS];
    this.currentUser = DEMO_USERS[0];
  }
}

// Global singleton instance
const globalRepo = new BrandGuardRepository();
export const repository = globalRepo;
