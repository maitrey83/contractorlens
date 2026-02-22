# ContractorLens — Full Build Plan
**Goal:** First paying customer  
**Budget:** 8–10 hrs/week  
**Stack:** React · Node.js · Supabase · Stripe · Claude API · Vercel  
**Definition of Done:** Someone pays $19

---

## The One-Sentence Product

> "Got your first contractor quote and have no idea if it's fair? Paste it in. We'll flag what's vague, what's missing, what's overpriced, and give you the exact questions to ask before you sign."

---

## What We're Building (Scope)

### Free Tier (always free, no login)
- Paste quote text OR upload PDF/image
- Enter zip code
- Get instant AI analysis:
  - Red flag report (vague items, missing scope, risky payment terms)
  - Fair price range for their zip code
  - Cost reduction opportunities
  - Questions to ask the contractor

### Paid Tier ($19 one-time)
- Everything above, PLUS:
  - Polished PDF report (contractor-ready format)
  - Full savings breakdown with negotiation scripts
  - Shareable link to analysis

### Out of Scope for MVP
- User accounts / login
- Saved quote history
- Contractor directory
- Multi-quote comparison (that's BidCompareAI's thing)
- Mobile app

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend | React (Vite) | Already built prototype |
| Hosting | Vercel | Free tier, instant deploy |
| AI | Claude API (claude-sonnet-4-6) | Best for document analysis |
| Database | Supabase | Analyses + payment records |
| Payments | Stripe | One-time payment, no subscription needed |
| PDF | html-pdf / puppeteer | Generate from analysis output |
| File Upload | Supabase Storage | PDF/image uploads |
| OCR (images) | Claude Vision | Send image directly to Claude API |

---

## Phase 0 — Foundation (Week 1)
**Time: ~8 hrs | Goal: Repo live, env wired, deploy working**

### Tasks
- [ ] Create GitHub repo: `contractorlens`
- [ ] Scaffold Vite + React project
- [ ] Set up Vercel deployment (push = auto-deploy)
- [ ] Create Supabase project, add env vars
- [ ] Create `.env.local` with keys (never commit)
- [ ] Add `.gitignore` — node_modules, .env*, dist
- [ ] Copy UI prototype into repo, confirm it renders on Vercel URL
- [ ] Set up `/api` folder for Node.js serverless functions (Vercel functions)

### Deliverable
Prototype live at `contractorlens.vercel.app`. Nothing works yet, but it's deployed.

### Schema (Supabase)
```sql
-- analyses table
create table analyses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  quote_text text,
  zip_code text,
  project_type text,
  analysis_json jsonb,
  paid boolean default false,
  stripe_session_id text,
  pdf_url text
);
```

---

## Phase 1 — Claude API Integration (Week 2)
**Time: ~9 hrs | Goal: Real AI analysis on any pasted quote**

### Tasks
- [ ] Create `/api/analyze` serverless function
- [ ] Write the core prompt (see Prompt Design below)
- [ ] Wire frontend textarea → POST /api/analyze → render real results
- [ ] Handle file upload: PDF → extract text → send to Claude
- [ ] Handle image upload: send directly to Claude Vision
- [ ] Save analysis to Supabase `analyses` table
- [ ] Return `analysis_id` to frontend (needed for Stripe later)
- [ ] Test with 5–10 real quote types: kitchen, roofing, HVAC, bathroom, electrical

### Prompt Design (Critical)
The prompt IS the product. Quality here = quality of output.

```
You are ContractorLens, an expert home renovation consultant 
who helps homeowners understand and negotiate contractor quotes.

Analyze the following contractor quote and return ONLY valid JSON 
(no markdown, no explanation outside the JSON).

The homeowner is in zip code: {ZIP_CODE}

QUOTE:
{QUOTE_TEXT}

Return this exact structure:
{
  "projectType": "string — inferred project type",
  "totalQuoted": number — total in dollars,
  "fairRangeLow": number — low end of fair range for this zip,
  "fairRangeHigh": number — high end of fair range for this zip,
  "verdict": "underpriced|fair|overpriced|unclear",
  "score": number 0-100 (100 = perfectly clear, fair, no issues),
  "savingsOpportunity": number — estimated savings available,
  "redFlags": [
    {
      "severity": "high|medium|low",
      "item": "short label",
      "detail": "2-3 sentence explanation of the problem and what to do"
    }
  ],
  "costReductions": [
    {
      "item": "what to negotiate",
      "saving": number,
      "note": "one sentence on how to ask for it"
    }
  ],
  "questions": [
    "Full sentence question to ask the contractor"
  ],
  "missingItems": [
    "Thing that should be in the quote but isn't"
  ]
}

Pricing rules:
- Base estimates on RSMeans regional data for the zip code
- Account for material cost inflation through 2025
- Flag if deposit exceeds 33% of total (industry red flag)
- Flag any line item that lacks brand, quantity, or spec
- Flag "TBD", "misc", "as needed", "included" as vague language
- Identify missing permit costs for regulated work (electrical, plumbing, structural)
```

### Deliverable
Paste any real contractor quote → get real, accurate AI analysis in ~10 seconds.

---

## Phase 2 — Stripe + PDF (Week 3)
**Time: ~9 hrs | Goal: $19 payment flow live end to end**

### Tasks

#### Stripe Setup
- [ ] Create Stripe account, get API keys
- [ ] Create `/api/create-checkout` serverless function
- [ ] Pass `analysis_id` as metadata to Stripe session
- [ ] Create `/api/stripe-webhook` to handle `checkout.session.completed`
- [ ] On payment success: mark `analyses.paid = true` in Supabase
- [ ] Redirect user to `/report/{analysis_id}` after payment

#### PDF Generation
- [ ] Create `/api/generate-pdf` function
- [ ] Build HTML template for the report (matches UI design — dark → light for print)
- [ ] Use puppeteer to render HTML → PDF
- [ ] Upload PDF to Supabase Storage
- [ ] Store `pdf_url` in analyses table
- [ ] Serve download link on report page

#### Frontend
- [ ] Wire "Download Report →" button to Stripe checkout
- [ ] Build `/report/{id}` page (shows full analysis + download button)
- [ ] Handle payment success redirect

### Payment Flow
```
User gets free analysis
  → clicks "Download Report ($19)"
  → POST /api/create-checkout (with analysis_id)
  → Stripe Checkout page
  → Payment succeeds
  → Webhook fires → mark paid → generate PDF
  → Redirect to /report/{id}
  → User downloads PDF
```

### Deliverable
Full end-to-end works: paste quote → analyze → pay $19 → download PDF.

---

## Phase 3 — Polish + Launch (Week 4)
**Time: ~8 hrs | Goal: Public, shareable, first real user**

### Tasks

#### Product Polish
- [ ] Error states (bad quote format, API failure, payment error)
- [ ] Loading states that feel fast (stream analysis if possible)
- [ ] Mobile responsive (most people will find this on phone)
- [ ] Add real domain: `contractorlens.com` (~$12/yr on Namecheap)
- [ ] Connect domain to Vercel

#### Legal / Trust
- [ ] Terms of Service page (not legal advice, results are estimates)
- [ ] Privacy Policy (minimal data, no selling)
- [ ] Footer disclaimer: "ContractorLens provides estimates only. Not legal or financial advice."

#### SEO Foundation
- [ ] Page title: "ContractorLens — Is Your Contractor Quote Fair?"
- [ ] Meta description targeting "contractor quote too high" / "is my contractor quote fair"
- [ ] Write one cornerstone blog post: "10 Red Flags in Contractor Quotes (And How to Spot Them)"
- [ ] Submit sitemap to Google Search Console

#### Distribution Push (first users)
- [ ] Post on Twitter/X: short thread with a real before/after quote analysis
- [ ] Post on LinkedIn: "I built this because 78% of homeowners go over budget..."
- [ ] Find 3 relevant Facebook Groups (homeowner, home improvement, first-time buyers)
- [ ] Submit to Product Hunt (plan for Tuesday launch, peak traffic day)
- [ ] DM 5 real estate agents: free tool for their clients pre-renovation

### Deliverable
Live at real domain, indexed by Google, first organic or social traffic hitting the tool.

---

## Phase 4 — First Paying Customer (Week 5–6)
**Time: ongoing | Goal: $19 in Stripe**

### What drives conversion
The free analysis must be genuinely good — if it feels like a toy, nobody pays $19 for a PDF.

Quality checklist before pushing for traffic:
- [ ] Test 10 real quote types, all produce accurate analysis
- [ ] Red flags are specific, not generic ("Electrical listed as misc" not "vague item found")
- [ ] Fair range feels believable vs. real market rates
- [ ] PDF looks professional enough to email a contractor

### Conversion levers to test
- [ ] Try $14 vs $19 (lower barrier for first validation)
- [ ] Add "share your analysis" free feature → viral loop
- [ ] Add email capture before showing full results (lead gen alternative)

### Success Metrics — Week 5 & 6
- 50+ unique visitors
- 10+ analyses run
- 1 payment = validation complete

---

## Risk Register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Claude API output is inconsistent / hallucinates prices | Medium | Strict JSON prompt, validate schema before render, fallback message |
| $19 price point too high | Medium | Test $14 first, add "what you get" clarity |
| PDF looks cheap → kills upsell | High | Invest Week 3 time heavily in PDF design |
| No traffic → no conversion | High | Don't wait for SEO. Manual outreach Week 4 |
| BidCompareAI copies single-quote feature | Low | Speed to market matters. Ship Week 4. |

---

## File Structure

```
contractorlens/
├── src/
│   ├── components/
│   │   ├── QuoteInput.jsx       ← paste + upload zone
│   │   ├── AnalysisResults.jsx  ← tabs: flags / savings / questions
│   │   ├── PdfUpsell.jsx        ← $19 CTA block
│   │   └── ReportPage.jsx       ← post-payment download page
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Report.jsx
│   │   └── Blog.jsx
│   ├── App.jsx
│   └── main.jsx
├── api/                          ← Vercel serverless functions
│   ├── analyze.js               ← Claude API call
│   ├── create-checkout.js       ← Stripe session
│   ├── stripe-webhook.js        ← payment confirmation
│   └── generate-pdf.js          ← puppeteer PDF
├── public/
├── .env.local                   ← NEVER commit
├── .gitignore
├── vercel.json
└── package.json
```

---

## Environment Variables

```
# Claude
ANTHROPIC_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=

# App
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Weekly Schedule (8–10 hrs/week)

| Week | Focus | Hours | End State |
|---|---|---|---|
| 1 | Foundation + deploy | 8 | Prototype live on Vercel |
| 2 | Claude API integration | 9 | Real analysis on real quotes |
| 3 | Stripe + PDF | 9 | Full payment flow working |
| 4 | Polish + SEO + launch | 8 | Live on real domain, first traffic |
| 5–6 | Iterate toward conversion | 10 | First $19 payment |

---

## Decision Log

| Decision | Choice | Reason |
|---|---|---|
| Auth | No auth for MVP | Removes friction, speeds launch |
| Pricing | $19 one-time | No subscription needed, low barrier |
| Input | Paste + PDF/image upload | Both from Week 1 |
| AI model | claude-sonnet-4-6 | Best balance of quality + cost |
| PDF gen | Puppeteer | Full design control |
| Hosting | Vercel | Free tier, Vite-native |
| Database | Supabase | Already know it, free tier |

---

*Last updated: Phase 0 not started*  
*Next action: Create GitHub repo and scaffold Vite project*
