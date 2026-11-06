-- BrandGuard AI — PostgreSQL / Supabase Database Schema
-- Multi-Tenant Brand Governance Schema with Row Level Security (RLS)

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    brand_colors JSONB NOT NULL DEFAULT '{"primary": "#0F172A", "accent": "#2563EB", "neutral": "#64748B"}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Users & Memberships
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TYPE user_role AS ENUM ('creator', 'reviewer', 'admin');

CREATE TABLE IF NOT EXISTS organization_memberships (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'creator',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 3. Brand Guidelines
CREATE TYPE guideline_category AS ENUM (
    'Tone of Voice',
    'Terminology',
    'Approved Facts',
    'Messaging',
    'Visual Identity',
    'Accessibility',
    'Promotional Claims'
);

CREATE TABLE IF NOT EXISTS brand_guidelines (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category guideline_category NOT NULL,
    rule TEXT NOT NULL,
    description TEXT,
    source_document TEXT,
    source_excerpt TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    examples JSONB DEFAULT '{"approved": [], "prohibited": []}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guidelines_org_cat ON brand_guidelines(organization_id, category);

-- 4. Approved Facts
CREATE TABLE IF NOT EXISTS approved_facts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    claim TEXT NOT NULL,
    verification_source TEXT NOT NULL,
    category TEXT NOT NULL,
    last_verified_date DATE NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Terminology Rules
CREATE TABLE IF NOT EXISTS terminology_rules (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    preferred_term TEXT NOT NULL,
    prohibited_terms TEXT[] NOT NULL,
    context TEXT,
    rationale TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Brand Assets
CREATE TABLE IF NOT EXISTS brand_assets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    asset_type TEXT NOT NULL,
    asset_url TEXT,
    specifications JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Content Submissions
CREATE TYPE submission_status AS ENUM (
    'draft',
    'submitted',
    'in_review',
    'changes_requested',
    'approved',
    'rejected'
);

CREATE TABLE IF NOT EXISTS content_submissions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    current_text TEXT NOT NULL,
    status submission_status NOT NULL DEFAULT 'submitted',
    creator_id TEXT NOT NULL REFERENCES users(id),
    reviewer_id TEXT REFERENCES users(id),
    review_categories TEXT[] NOT NULL,
    approved_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_org_status ON content_submissions(organization_id, status);

-- 8. Reviews & Explainable Issues
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id TEXT NOT NULL REFERENCES content_submissions(id) ON DELETE CASCADE,
    overall_summary TEXT NOT NULL,
    compliance_score INT NOT NULL,
    requires_human_review BOOLEAN NOT NULL DEFAULT FALSE,
    mode TEXT NOT NULL DEFAULT 'demo_rules',
    ai_model TEXT,
    positive_observations TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS review_issues (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id TEXT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    original_text TEXT NOT NULL,
    explanation TEXT NOT NULL,
    guideline_reference TEXT NOT NULL,
    evidence TEXT NOT NULL,
    suggestion TEXT NOT NULL,
    confidence FLOAT NOT NULL DEFAULT 0.9,
    requires_human_review BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'pending',
    edited_text TEXT
);

-- 9. Revisions & Comments
CREATE TABLE IF NOT EXISTS submission_revisions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id TEXT NOT NULL REFERENCES content_submissions(id) ON DELETE CASCADE,
    revision_number INT NOT NULL,
    content TEXT NOT NULL,
    change_summary TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS submission_comments (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id TEXT NOT NULL REFERENCES content_submissions(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES users(id),
    text TEXT NOT NULL,
    issue_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Row Level Security Policies (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_guidelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their organization data"
    ON brand_guidelines FOR SELECT
    USING (organization_id IN (
        SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()::text
    ));

CREATE POLICY "Reviewers and admins can modify guidelines"
    ON brand_guidelines FOR ALL
    USING (organization_id IN (
        SELECT organization_id FROM organization_memberships 
        WHERE user_id = auth.uid()::text AND role IN ('reviewer', 'admin')
    ));
