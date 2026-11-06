# BrandGuard AI
### Explainable AI-Powered Brand Governance Platform
**Hackathon Round 2: The Build**

---

## 1. Project Overview

**BrandGuard AI** is an intelligent enterprise brand governance platform designed to review marketing campaigns, social media posts, website copy, and visual creative assets prior to public release. The platform evaluates content against an organization's stored:

- **Brand Guidelines** (Tone of voice, voice principles, and style charters)
- **Approved Facts** (Audited SLAs, customer numbers, corporate milestones)
- **Terminology Rules** (Preferred customer-first vocabulary, prohibited phrasing)
- **Messaging Pillars** (Core brand value propositions and pillars)
- **Visual Identity Assets** (Approved hex color palettes, logo safe-zones)
- **Accessibility Requirements** (WCAG 2.1 AA text contrast and plain text clarity)
- **Promotional Claims** (Mandatory third-party citations for superlatives)

### Explainable AI & Human-in-the-Loop Governance
BrandGuard AI identifies potential violations, articulates **why they matter**, quotes the **exact verbatim evidence** from internal source documents, and suggests non-destructive corrections while preserving the creator's original intent. Crucially, AI assists and advises: **publication decisions remain an explicit human reviewer responsibility**.

---

## 2. Key Features

1. **Brand Knowledge Hub**
   - Central repository for corporate governance rules, approved facts, and terminology.
   - Categorized filtering, keyword search, and CRUD management.
   - Text extraction support for uploaded documents (`TXT`, `PDF`, `DOCX`).
   - Source document attribution and verbatim passage excerpting.

2. **AI Content Compliance Review**
   - Multi-category compliance checking (Tone, Terminology, Facts, Claims, Messaging, Accessibility).
   - Fast-track "Load Sample Marketing Copy" for instantaneous evaluator demonstration.
   - Structured JSON output validated with Zod schemas.
   - Overall compliance scoring algorithm (0–100) reflecting violation severity.

3. **Interactive Correction Studio & Diff Editor**
   - Real-time inline highlighting of flagged phrases.
   - Side-by-side comparison between original copy and corrected draft.
   - One-click "Accept Correction", "Dismiss", or custom text edit per issue.
   - Batch "Apply All Corrections" and reversible undo functionality.
   - One-click compliance re-evaluation on modified copy.

4. **Visual Brand Compliance Review (Round 2 Improvement 2)**
   - Upload marketing creatives and posters (`PNG`, `JPG`, `WEBP`, `SVG`).
   - Automated color palette extraction and verification against approved brand hex codes.
   - Logo placement, clearspace margin, and boundary crowding checks.
   - OCR headline extraction for unsubstantiated claims.
   - WCAG 2.1 AA text contrast ratio assessment.
   - Transparent uncertainty reporting to avoid false certainty.

5. **Human Review & Approval Workflow**
   - Complete pre-publication queue with lifecycle statuses: `Draft` &rarr; `Submitted` &rarr; `In Review` &rarr; `Changes Requested` &rarr; `Approved` / `Rejected`.
   - Simulated role switching in header:
     - **Alex Chen** (`Creator` — Product Marketing Manager)
     - **Elena Rostova** (`Reviewer` — Senior Brand Compliance Officer)
     - **Marcus Vance** (`Admin` — VP of Global Brand Governance)
   - Audit trail tracking revision history and reviewer/creator discussion threads.

6. **Governance Analytics & Intelligence (Round 2 Improvement 3)**
   - Powered by **Recharts**:
     - Most frequently violated categories (Bar chart).
     - Issue severity distribution (Donut chart).
     - 7-day review activity and approval velocity (Area chart).
     - Empirical correction adoption rate (91.2%).
   - Actionable governance coaching and recommendations derived from observed review records.

7. **Zero-Setup Demo Mode Out-of-the-Box**
   - Operates immediately without external API keys or remote database setup.
   - Pre-seeded with a realistic enterprise dataset for fictional company **NovaTech Solutions**.
   - Transparently switches to live multi-modal LLM analysis when `GEMINI_API_KEY` or `OPENAI_API_KEY` is provided.

---

## 3. Technology Stack

- **Framework**: Next.js 14 (App Router, Server-side API Routes, Server Actions)
- **Language**: TypeScript 5 (Strict type checking)
- **Styling**: Tailwind CSS (Enterprise SaaS aesthetic, navy/blue/slate palette)
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **Schema Validation**: Zod
- **Document Processing**: `pdf-parse`, `mammoth` (DOCX), native text parsers
- **Unit & Integration Testing**: Vitest (16 unit and workflow tests)
- **Database Schema**: PostgreSQL / Supabase with Row Level Security (RLS) policies

---

## 4. Architecture Diagram

```
+-------------------------------------------------------------------------+
|                       Next.js App Router UI Layer                       |
|   Dashboard  |  Content Review  |  Knowledge Hub  |  Queue  | Analytics |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                           API Route Handlers                            |
|  /api/review  |  /api/guidelines  |  /api/submissions  |  /api/analytics |
+-------------------------------------------------------------------------+
                                    |
             +----------------------+----------------------+
             |                                             |
             v                                             v
+-----------------------------+               +---------------------------+
|    AI Provider Interface    |               |  Guideline & Terminology  |
| - Gemini 1.5 Pro / Flash    |               |     Retrieval Engine      |
| - OpenAI GPT-4o             |               | - Keyword matching        |
| - Rule Engine (Demo Mode)   |               | - Source quote extractor  |
+-----------------------------+               +---------------------------+
             |                                             |
             +----------------------+----------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
|                        Data Access Repository Layer                     |
|  - In-Memory / File Persistent Store (Zero-Dependency Demo Mode)        |
|  - Supabase / PostgreSQL Client Adapter (Production Migration Ready)    |
+-------------------------------------------------------------------------+
```

---

## 5. Getting Started & Local Development

### Prerequisites
- Node.js version 18.x or later (developed & tested on Node v26)
- npm version 9.x or later

### Installation
```bash
# Clone or navigate to the repository
cd BrandGuard

# Install dependencies
npm install
```

### Running Locally
```bash
# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### Running Automated Tests
```bash
# Execute Vitest test suite
npm test
```
All 16 unit and workflow tests execute and validate schema integrity, retrieval, evidence citations, correction replacements, status transitions, and analytics.

### Production Build
```bash
# Verify typechecking, linting, and compile production assets
npm run build
```

---

## 6. Environment Variables Configuration

Create a `.env.local` file in the project root:

```bash
# Optional: Set displayed AI engine label
NEXT_PUBLIC_AI_PROVIDER="Demo Mode (Deterministic Rules & Retrieval)"

# Optional: Live AI Provider (Gemini)
GEMINI_API_KEY="your-google-gemini-api-key"

# Optional: Live AI Provider (OpenAI)
OPENAI_API_KEY="your-openai-api-key"

# Optional: Supabase Production Database
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

> **Note**: When API keys are omitted, BrandGuard AI runs in **Demo Mode**, using a rule-based retrieval evaluation engine clearly labelled in the UI. It never hallucinates or pretends to be a model when unconfigured.

---

## 7. Interactive Judge Walkthrough (End-to-End Demo)

Follow this 5-minute flow to experience the entire governance lifecycle:

1. **Dashboard (`/`)**:
   - Inspect overall compliance rate, active governance insights, and recent submissions.
2. **Brand Knowledge Hub (`/guidelines`)**:
   - Review active guidelines across *Terminology*, *Tone of Voice*, *Approved Facts*, and *Claims*.
   - Filter by "Terminology" and inspect the rule enforcing "customers" instead of "users".
3. **Content Review Studio (`/review`)**:
   - Click **"Load Sample Copy (With Violations)"**.
   - Click **"Run Compliance Review"**.
   - Notice the explainable evidence cards quoting source documents (`Brand Book v3`, `SOC2 Audit Report`).
   - Click **"Apply All Corrections"** in the Diff Editor to watch the copy automatically sanitize to compliant standards.
   - Click **"Submit to Queue"** and add an optional note for the reviewer.
4. **Human Review & Approval (`/queue/[id]`)**:
   - Notice the prompt indicating Elena (Reviewer) has authority to approve.
   - In the top header bar, click the **Role Switcher** and select **Elena Rostova (Reviewer)**.
   - Click **"Approve for Publication"**, confirm the approval note, and witness the status transition to **Approved**.
5. **Visual Review (`/visual-review`)**:
   - Click **"Load Sample NovaTech Banner"**.
   - Run visual compliance analysis to inspect color palette harmony, logo clearspace, and WCAG contrast.
6. **Governance Analytics (`/analytics`)**:
   - Inspect real-time charts illustrating category violation frequency, recurring mistakes, and reviewer throughput.

---

## 8. API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/guidelines` | `GET` | List brand guidelines with optional `?category=` and `?q=` filters |
| `/api/guidelines` | `POST` | Create a new brand guideline |
| `/api/guidelines/[id]` | `GET`, `PUT`, `DELETE` | Retrieve, update, or remove a guideline |
| `/api/review` | `POST` | Run AI / rule-based compliance check on draft content |
| `/api/visual-review` | `POST` | Analyze uploaded creative image for brand compliance |
| `/api/submissions` | `GET`, `POST` | List and create submissions for the review queue |
| `/api/submissions/[id]` | `GET`, `PUT` | Fetch and update a content submission |
| `/api/submissions/[id]/transition` | `POST` | Transition status (`approved`, `rejected`, `changes_requested`) |
| `/api/submissions/[id]/comment` | `POST` | Add reviewer/creator comment to submission audit trail |
| `/api/submissions/[id]/revision` | `POST` | Append a new draft revision to the submission |
| `/api/analytics` | `GET` | Calculate and return aggregated governance metrics |
| `/api/demo/reset` | `POST` | Reset workspace to pristine NovaTech demo state |
| `/api/users` | `GET`, `POST` | List demo users and switch active user role |

---

## 9. Security & Responsible AI Considerations

- **Untrusted Document Ingestion**: Uploaded text and files are sanitized before processing. Instructions contained within uploaded brand documents are sandboxed and cannot override system prompts or application behavior.
- **Evidence-Backed Findings**: Every violation must cite an actual stored guideline. Unsupported factual statements are categorized explicitly as `"No approved supporting source found"` rather than fabricating false certainty.
- **Non-Destructive Corrections**: Original author text is preserved across all revisions with full diff inspection and undo support.
- **Human Authority**: Publication approval is reserved exclusively for authenticated human compliance reviewers.

---

## 10. Round 2 Hackathon Scoring Alignment

- **Core Workflow Runs End-to-End (30 pts)**: Verified Brand Guidelines &rarr; Content Submission &rarr; AI Review &rarr; Explainable Evidence &rarr; Interactive Corrections &rarr; Human Review Approval.
- **Technical Depth & Reliability (25 pts)**: TypeScript strict mode, Zod output schemas, Next.js App Router, Vitest test suite (16 tests passed), and full Supabase SQL migrations.
- **Progress Against Round 1 Plan (20 pts)**: Fully delivered Knowledge Hub, Content Review Studio, Human Review Queue, and Analytics.
- **Three Round 2 Improvements (15 pts)**:
  - *Improvement 1*: Evidence-backed AI compliance checking with verbatim citations.
  - *Improvement 2*: Multi-modal Visual Brand Compliance Review (`/visual-review`).
  - *Improvement 3*: Governance intelligence and recurring violation analytics (`/analytics`).
- **Usability (10 pts)**: Enterprise SaaS design, responsive layout, clear status indicators, and simulated role switching.

---

## 11. Deployment

### Deploying to Vercel
1. Push repository to GitHub or GitLab.
2. Import project into [Vercel](https://vercel.com).
3. (Optional) Set `GEMINI_API_KEY` or `OPENAI_API_KEY` in Vercel Environment Variables.
4. Deploy! Next.js will build all static and dynamic API routes automatically.

### Database Migration (Supabase)
1. Create a project in [Supabase](https://supabase.com).
2. Open the SQL Editor and execute `supabase/schema.sql`.
3. Add your Supabase project URL and keys to environment variables.
