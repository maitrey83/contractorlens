# ContractorLens — CLAUDE.md

This file is the source of truth for Claude Code working on this project.
Read it fully before starting any task. Follow it exactly.

---

## What This Project Is

ContractorLens is a SaaS tool that helps homeowners decode contractor quotes.
A homeowner pastes or uploads a quote → AI analyzes it → free results shown →
$19 one-time payment unlocks a polished PDF report for negotiation.

**The core value:** Help homeowners identify vague language, benchmark pricing
by zip code, surface cost reduction opportunities, and generate questions to ask
before signing. We are NOT a contractor directory. We are NOT a comparison tool.
We analyze the single quote in front of the homeowner right now.

**Target user:** Homeowner who just received their first contractor quote and
has no idea if it's fair. Peak anxiety moment. High willingness to pay for clarity.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Inline styles + CSS-in-JS (no Tailwind, no CSS modules) |
| Hosting | Vercel (frontend + serverless API functions) |
| API | Vercel serverless functions (`/api/*.js`) |
| AI | Anthropic Claude API — model: `claude-sonnet-4-6` |
| Database | Supabase (Postgres) |
| Auth | None for MVP — no login required |
| Payments | Stripe (one-time checkout, no subscriptions) |
| PDF | Puppeteer (server-side render to PDF) |
| File storage | Supabase Storage |

---

## Project Structure

```
contractorlens/
├── src/
│   ├── components/
│   │   ├── QuoteInput.jsx       ← paste + upload zone
│   │   ├── AnalysisResults.jsx  ← tabs: red flags / savings / questions
│   │   ├── PdfUpsell.jsx        ← $19 CTA block
│   │   └── ReportPage.jsx       ← post-payment download page
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Report.jsx
│   │   └── Blog.jsx
│   ├── App.jsx
│   └── main.jsx
├── api/                          ← Vercel serverless functions (Node.js)
│   ├── analyze.js               ← Claude API call — core of the product
│   ├── create-checkout.js       ← Stripe session creation
│   ├── stripe-webhook.js        ← Stripe payment confirmation handler
│   └── generate-pdf.js          ← Puppeteer PDF generation
├── supabase/
│   └── migrations/              ← ALL schema changes go here as .sql files
├── tests/
│   ├── api/                     ← API function tests
│   └── components/              ← React component tests
├── public/
├── .env.local                   ← NEVER commit. NEVER touch.
├── .gitignore
├── vercel.json
├── CLAUDE.md                    ← This file
└── package.json
```

---

## Environment Variables

**NEVER hardcode, log, or commit any secret or API key.**
**NEVER add console.log statements that could expose env vars.**
**NEVER create or modify `.env.local` — that is the developer's responsibility.**

If a new environment variable is needed, do this instead:
1. Add it to `.env.example` with a placeholder value
2. Document it in the task summary
3. Tell the developer what value is needed and where to get it

```
# Required env vars (reference only — never modify .env.local)
ANTHROPIC_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Core Business Rules (Never Violate)

These are product decisions. Do not change them without explicit instruction.

1. **Free analysis is always free.** Never gate the analysis behind payment or login.
2. **PDF is the only paid feature.** $19 one-time. No subscriptions.
3. **No user accounts for MVP.** No login, no registration, no session management.
4. **analysis_id is the session key.** Every analysis gets a UUID. This links the
   free result → Stripe payment → PDF download. Protect it, never expose others'.
5. **Claude model is `claude-sonnet-4-6`.** Do not change to a different model.
6. **Analysis output is always JSON.** The prompt must return valid JSON only.
   Never change the prompt to return markdown or plain text.
7. **Stripe webhooks are the payment source of truth.** Never mark an analysis as
   paid based on frontend redirect alone. Only the webhook can flip `paid = true`.

---

## The Core Prompt (analyze.js)

This is the most important code in the project. Handle with care.

- Always send as a `user` message (not system)
- Always request JSON-only output with no markdown wrapping
- Always validate the returned JSON structure before saving to Supabase
- If JSON parsing fails, return a 422 with `{ error: "analysis_failed" }` — never expose raw Claude output to the frontend
- Never add new fields to the JSON schema without updating the frontend renderer

The expected output schema lives in `src/components/AnalysisResults.jsx`.
If you change one, change both. They must stay in sync.

---

## Coding Conventions

### General
- Use `async/await` — never `.then()` chains
- Always handle errors explicitly — no silent catches
- Use `const` by default — `let` only when reassignment is necessary
- No `var`
- Keep functions under 40 lines. Extract helpers if longer.
- One responsibility per file

### API Functions (Vercel serverless)
```javascript
// Standard structure for every /api/*.js file
export default async function handler(req, res) {
  // 1. Method check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Input validation
  // 3. Business logic
  // 4. Response

  // Always use try/catch
  try {
    // logic here
  } catch (error) {
    console.error('[api/name]', error.message); // log message only, not full error
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### React Components
- Functional components only — no class components
- Props destructured in function signature
- No prop-types (TypeScript is not in scope for MVP)
- Keep components under 150 lines — split if larger
- Inline styles using the `styles` object pattern (see existing prototype)
- No external UI libraries (no MUI, no Chakra, no Shadcn)

### Supabase Queries
- Always use `supabase` service role client in API functions
- Always use `anon` client (via `VITE_` vars) in frontend
- Never expose service role key to frontend
- Always handle `.error` from Supabase responses explicitly

```javascript
const { data, error } = await supabase.from('analyses').insert({...});
if (error) throw new Error(`Supabase insert failed: ${error.message}`);
```

---

## Git Workflow

### Branch Naming
```
feature/short-description     ← new functionality
fix/short-description         ← bug fixes
chore/short-description       ← deps, config, non-feature work
```

### Commit Message Format
```
type: short description (under 60 chars)

- Bullet detail if needed
- Another detail if needed
```

Types: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`

Examples:
```
feat: wire Claude API to analyze endpoint
fix: handle empty zip code in pricing prompt
chore: add puppeteer dependency for PDF generation
test: add unit tests for JSON schema validation
```

### Never commit:
- `.env.local` or any file containing real secrets
- `node_modules/`
- `.DS_Store`
- `dist/` or `build/` output folders
- Any file with a hardcoded API key, even a test key

---

## Database (Supabase)

### Migration Rules
- Every schema change is a `.sql` migration file in `supabase/migrations/`
- Filename format: `YYYYMMDD_HHMMSS_description.sql`
- Migrations are append-only — never edit an existing migration
- Always include a rollback comment at the bottom of each migration
- Never run raw SQL against production — always via migration

### Current Schema
```sql
-- analyses table (created in Phase 0)
create table analyses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  quote_text text not null,
  zip_code text,
  project_type text,
  analysis_json jsonb,
  paid boolean default false,
  stripe_session_id text,
  pdf_url text
);

-- Row Level Security: enabled, no public access
-- All access via service role key in API functions only
```

---

## Testing

### Required before any PR
- Run `npm test` — all tests must pass
- Run `npm run lint` — zero errors (warnings OK)
- Manually test the happy path: paste quote → analyze → see results

### What to test
- API functions: test with valid input, invalid input, missing fields
- JSON schema validation in `analyze.js` — this is critical
- Stripe webhook signature verification — never skip this test
- Supabase error handling — test what happens when DB is unreachable

### What NOT to test
- Third-party SDKs (Stripe, Supabase, Anthropic)
- Vercel infrastructure
- CSS/styling details

---

## Stripe Webhook Safety

The webhook handler (`api/stripe-webhook.js`) is security-critical.

**Always:**
- Verify the Stripe signature using `STRIPE_WEBHOOK_SECRET`
- Use raw request body for signature verification (not parsed JSON)
- Handle `checkout.session.completed` event only
- Extract `analysis_id` from `session.metadata`
- Update Supabase atomically

**Never:**
- Mark payment as complete without verifying webhook signature
- Trust the frontend redirect as confirmation of payment
- Expose Stripe keys in any log or response

---

## When a Task is Complete

Before marking anything done:

1. Code runs without errors locally
2. `npm test` passes
3. `npm run lint` passes
4. No secrets in any committed file
5. New env vars documented in `.env.example`
6. Migration file created if schema changed
7. Summarize what was changed and what the developer needs to do next
   (e.g., "Set STRIPE_PRICE_ID in .env.local before testing")

---

## What NOT to Build (MVP Guardrails)

Do not build these unless explicitly asked:

- User authentication or accounts
- Subscription billing (Stripe recurring)
- Quote comparison (multiple quotes side by side)
- Contractor profiles or directory
- Admin dashboard
- Email notifications
- Quote history / saved analyses
- Mobile app or PWA features
- Multi-language support

If asked to build something on this list, flag it and confirm before proceeding.

---

## Asking for Clarification

Before starting a task, flag if:
- The task touches the Stripe webhook handler
- The task changes the Claude prompt schema
- The task requires a new environment variable
- The task modifies the Supabase schema
- The task is ambiguous in scope and could be interpreted multiple ways

Better to ask once than to redo work.

---

*Project: ContractorLens*
*Stack: React + Vite + Vercel + Supabase + Stripe + Claude API*
*Phase: 0 — Foundation*
