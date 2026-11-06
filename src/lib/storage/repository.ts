import fs from 'fs';
import path from 'path';
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

interface DatabaseSchema {
  organization: Organization;
  users: User[];
  guidelines: BrandGuideline[];
  approvedFacts: ApprovedFact[];
  terminologyRules: TerminologyRule[];
  brandAssets: BrandAsset[];
  submissions: ContentSubmission[];
  currentUser: User;
}

class BrandGuardRepository {
  private dbPath: string;
  private data: DatabaseSchema;

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'db.json');
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(this.dbPath)) {
        const fileContent = fs.readFileSync(this.dbPath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed.guidelines && parsed.submissions) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Repository failed to read data/db.json, falling back to seeded dataset:', e);
    }

    // Default seeded state
    const initialData: DatabaseSchema = {
      organization: { ...DEMO_ORGANIZATION },
      users: [...DEMO_USERS],
      guidelines: [...DEMO_GUIDELINES],
      approvedFacts: [...DEMO_APPROVED_FACTS],
      terminologyRules: [...DEMO_TERMINOLOGY_RULES],
      brandAssets: [...DEMO_BRAND_ASSETS],
      submissions: [...DEMO_SUBMISSIONS],
      currentUser: DEMO_USERS[0],
    };

    this.saveDatabase(initialData);
    return initialData;
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Failed to persist to data/db.json (running in-memory):', e);
    }
  }

  // --- Organization & Users ---
  getOrganization(): Organization {
    return this.data.organization;
  }

  getUsers(): User[] {
    return this.data.users;
  }

  getCurrentUser(): User {
    return this.data.currentUser || this.data.users[0];
  }

  setCurrentUser(userId: string): User {
    const user = this.data.users.find((u) => u.id === userId);
    if (user) {
      this.data.currentUser = user;
      this.saveDatabase();
    }
    return this.data.currentUser;
  }

  // --- Brand Guidelines ---
  listGuidelines(params?: { category?: string; query?: string; activeOnly?: boolean }): BrandGuideline[] {
    let result = [...this.data.guidelines];

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
    return this.data.guidelines.find((g) => g.id === id);
  }

  createGuideline(data: Omit<BrandGuideline, 'id' | 'createdAt' | 'updatedAt' | 'organizationId'>): BrandGuideline {
    const newGuideline: BrandGuideline = {
      ...data,
      id: `guide_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organizationId: this.data.organization.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.guidelines.unshift(newGuideline);
    this.saveDatabase();
    return newGuideline;
  }

  updateGuideline(id: string, updates: Partial<BrandGuideline>): BrandGuideline | undefined {
    const index = this.data.guidelines.findIndex((g) => g.id === id);
    if (index === -1) return undefined;

    this.data.guidelines[index] = {
      ...this.data.guidelines[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveDatabase();
    return this.data.guidelines[index];
  }

  deleteGuideline(id: string): boolean {
    const initialLen = this.data.guidelines.length;
    this.data.guidelines = this.data.guidelines.filter((g) => g.id !== id);
    const deleted = this.data.guidelines.length < initialLen;
    if (deleted) this.saveDatabase();
    return deleted;
  }

  // --- Approved Facts ---
  listApprovedFacts(query?: string): ApprovedFact[] {
    if (!query || query.trim() === '') return this.data.approvedFacts;
    const q = query.toLowerCase();
    return this.data.approvedFacts.filter(
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
      organizationId: this.data.organization.id,
    };
    this.data.approvedFacts.unshift(newFact);
    this.saveDatabase();
    return newFact;
  }

  // --- Terminology Rules ---
  listTerminologyRules(): TerminologyRule[] {
    return this.data.terminologyRules;
  }

  createTerminologyRule(data: Omit<TerminologyRule, 'id' | 'organizationId'>): TerminologyRule {
    const newRule: TerminologyRule = {
      ...data,
      id: `term_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organizationId: this.data.organization.id,
    };
    this.data.terminologyRules.unshift(newRule);
    this.saveDatabase();
    return newRule;
  }

  // --- Brand Assets ---
  listBrandAssets(): BrandAsset[] {
    return this.data.brandAssets;
  }

  // --- Content Submissions & Review Queue ---
  listSubmissions(params?: { status?: string; creatorId?: string; query?: string }): ContentSubmission[] {
    let result = [...this.data.submissions];

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
    return this.data.submissions.find((s) => s.id === id);
  }

  createSubmission(data: {
    title: string;
    contentType: ContentSubmission['contentType'];
    rawText: string;
    reviewCategories: BrandGuideline['category'][];
    creator?: User;
    latestReview?: ReviewResult;
  }): ContentSubmission {
    const creator = data.creator || this.getCurrentUser();
    const now = new Date().toISOString();

    const submission: ContentSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organizationId: this.data.organization.id,
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

    this.data.submissions.unshift(submission);
    this.saveDatabase();
    return submission;
  }

  updateSubmission(id: string, updates: Partial<ContentSubmission>): ContentSubmission | undefined {
    const index = this.data.submissions.findIndex((s) => s.id === id);
    if (index === -1) return undefined;

    this.data.submissions[index] = {
      ...this.data.submissions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveDatabase();
    return this.data.submissions[index];
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
    this.saveDatabase();
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
    this.saveDatabase();
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

    this.saveDatabase();
    return submission;
  }

  // --- Governance Analytics Engine ---
  getMetrics(): GovernanceMetrics {
    const totalSubmissions = this.data.submissions.length;
    const approvedCount = this.data.submissions.filter((s) => s.status === 'approved').length;
    const pendingCount = this.data.submissions.filter((s) => s.status === 'submitted' || s.status === 'in_review').length;
    const changesRequestedCount = this.data.submissions.filter((s) => s.status === 'changes_requested').length;
    const rejectedCount = this.data.submissions.filter((s) => s.status === 'rejected').length;

    // Calculate real-time categories violated across all reviews
    const categoryCounts: Record<string, number> = {};
    const severityCounts: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    let totalScore = 0;
    let reviewsWithScores = 0;

    for (const sub of this.data.submissions) {
      if (sub.latestReview) {
        totalScore += sub.latestReview.compliance_score;
        reviewsWithScores++;

        for (const issue of sub.latestReview.issues) {
          categoryCounts[issue.category] = (categoryCounts[issue.category] || 0) + 1;
          severityCounts[issue.severity] = (severityCounts[issue.severity] || 0) + 1;
        }
      }
    }

    const avgComplianceScore = reviewsWithScores > 0 ? Math.round((totalScore / reviewsWithScores) * 10) / 10 : 86.4;

    const categoryViolations = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    })).sort((a, b) => b.count - a.count);

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

  // --- Reset to Pristine State ---
  resetToDemoData(): void {
    this.data = {
      organization: { ...DEMO_ORGANIZATION },
      users: [...DEMO_USERS],
      guidelines: [...DEMO_GUIDELINES],
      approvedFacts: [...DEMO_APPROVED_FACTS],
      terminologyRules: [...DEMO_TERMINOLOGY_RULES],
      brandAssets: [...DEMO_BRAND_ASSETS],
      submissions: [...DEMO_SUBMISSIONS],
      currentUser: DEMO_USERS[0],
    };
    this.saveDatabase();
  }
}

// Global persistent repository instance
const globalRepo = new BrandGuardRepository();
export const repository = globalRepo;
