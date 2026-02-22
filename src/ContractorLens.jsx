import { useState } from "react";

const SAMPLE_QUOTE = `Kitchen Remodel - Quote from ABC Contractors

Labor: $8,500
Materials: $12,000
Demo work: included
Cabinets: $4,200 (standard grade)
Countertops: $2,800
Plumbing: $1,500
Electrical: misc
Paint: included
Cleanup: TBD

Total: $29,000

Payment: 50% upfront, 50% on completion
Timeline: 3-4 weeks
Warranty: workmanship guaranteed`;

const ANALYSIS = {
  projectType: "Kitchen Remodel",
  totalQuoted: 29000,
  fairRangeLow: 22000,
  fairRangeHigh: 31000,
  verdict: "within-range",
  savingsOpportunity: 4200,
  score: 61,
  redFlags: [
    {
      severity: "high",
      item: "Electrical listed as 'misc'",
      detail:
        "Electrical work should always be itemized. 'Misc' hides scope and lets contractors add charges post-signature. Ask for a specific breakdown: panel work, outlet additions, lighting circuits.",
    },
    {
      severity: "high",
      item: "50% upfront deposit ($14,500)",
      detail:
        "Industry standard is 10–33% upfront. A $14,500 deposit on a $29K job is a red flag — it gives contractors cash before delivering value and reduces your leverage if work is poor.",
    },
    {
      severity: "medium",
      item: "Cleanup listed as 'TBD'",
      detail:
        "Debris removal and final cleanup can cost $500–$2,000. 'TBD' means it will be added to your bill mid-project when you have no negotiating power.",
    },
    {
      severity: "medium",
      item: "Cabinets: 'standard grade' — no brand or spec",
      detail:
        "Cabinet quality varies enormously. 'Standard grade' could mean anything from IKEA to semi-custom. Demand specific brand, series, and door style in writing before signing.",
    },
    {
      severity: "low",
      item: "No permit costs listed",
      detail:
        "Kitchen remodels typically require electrical and plumbing permits ($150–$800). If not listed, either the contractor is skipping permits (liability on you) or adding this cost later.",
    },
  ],
  costReductions: [
    {
      item: "Negotiate deposit down to 25%",
      saving: 7250,
      note: "Standard industry practice. Frame as 'matching industry standard terms.'",
    },
    {
      item: "Lock in cabinet brand/series now",
      saving: 800,
      note:
        "Specifying brand prevents upgrade upcharges mid-project.",
    },
    {
      item: "Get cleanup scope in writing",
      saving: 600,
      note: "Prevents a surprise line item at final invoice.",
    },
    {
      item: "Request itemized electrical breakdown",
      saving: 500,
      note: "Often reveals padding — 'misc' electrical regularly comes in $300–$700 under verbal estimates when forced to specify.",
    },
  ],
  questions: [
    "Can you provide a line-by-line breakdown of the electrical work — specifically what circuits, outlets, and fixtures are included?",
    "What cabinet brand and series are you quoting? Can we add that to the contract?",
    "Industry standard deposit is 25%. Can we adjust the payment schedule to 25% upfront, 50% at rough-in, 25% at completion?",
    "Is permit pulling included in this quote? If so, which permits?",
    "What does 'cleanup' include specifically — debris removal, dumpster, and final broom sweep?",
    "What is your workmanship warranty in writing, and what does it cover?",
    "Can you provide 2–3 references from kitchen remodels completed in the last 12 months?",
  ],
};

const severityConfig = {
  high: { color: "#EF4444", bg: "rgba(239,68,68,0.08)", label: "HIGH" },
  medium: { color: "#F59E0B", bg: "rgba(245,158,11,0.08)", label: "MEDIUM" },
  low: { color: "#6B7280", bg: "rgba(107,114,128,0.08)", label: "LOW" },
};

export default function ContractorLens() {
  const [screen, setScreen] = useState("landing"); // landing | analyzing | results
  const [quoteText, setQuoteText] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [activeTab, setActiveTab] = useState("redflags");
  const [dragOver, setDragOver] = useState(false);

  const handleAnalyze = () => {
    setScreen("analyzing");
    setTimeout(() => setScreen("results"), 2200);
  };

  const loadSample = () => {
    setQuoteText(SAMPLE_QUOTE);
    setZipCode("90210");
  };

  return (
    <div style={styles.root}>
      <style>{css}</style>

      {/* NAV */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <span style={styles.logoMark}>⬡</span>
          <span style={styles.logoText}>ContractorLens</span>
        </div>
        {screen === "results" && (
          <button style={styles.navBtn} onClick={() => setScreen("landing")}>
            ← New Quote
          </button>
        )}
      </nav>

      {/* LANDING */}
      {screen === "landing" && (
        <div style={styles.landing}>
          <div style={styles.heroSection}>
            <div style={styles.badge}>Free Quote Analysis</div>
            <h1 style={styles.h1}>
              Got a contractor quote?
              <br />
              <span style={styles.h1Accent}>Find out if it's fair.</span>
            </h1>
            <p style={styles.subtitle}>
              Paste or upload your quote. We'll flag every vague line item,
              benchmark pricing for your zip code, and tell you exactly where
              you can negotiate money back — before you sign.
            </p>
          </div>

          <div style={styles.card}>
            {/* Upload zone */}
            <div
              style={{
                ...styles.dropzone,
                ...(dragOver ? styles.dropzoneActive : {}),
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
              }}
            >
              <div style={styles.dropzoneIcon}>↑</div>
              <div style={styles.dropzoneText}>
                Drop PDF or image here
              </div>
              <div style={styles.dropzoneOr}>or</div>
              <label style={styles.uploadBtn}>
                Browse file
                <input type="file" style={{ display: "none" }} accept=".pdf,image/*" />
              </label>
            </div>

            <div style={styles.divider}>
              <span style={styles.dividerText}>or paste your quote below</span>
            </div>

            <textarea
              style={styles.textarea}
              placeholder="Paste your contractor quote here — line items, totals, payment terms, everything you have..."
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              rows={10}
            />

            <div style={styles.inputRow}>
              <input
                style={styles.zipInput}
                placeholder="Zip code (for local pricing)"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                maxLength={5}
              />
              <button
                style={{
                  ...styles.analyzeBtn,
                  ...(quoteText.length > 20 ? {} : styles.analyzeBtnDisabled),
                }}
                onClick={handleAnalyze}
                disabled={quoteText.length < 20}
              >
                Analyze Quote →
              </button>
            </div>

            <button style={styles.sampleBtn} onClick={loadSample}>
              Load sample quote to see how it works
            </button>
          </div>

          <div style={styles.trustRow}>
            <span style={styles.trustItem}>✓ No signup required</span>
            <span style={styles.trustItem}>✓ Analysis is free</span>
            <span style={styles.trustItem}>✓ Not legal advice</span>
          </div>
        </div>
      )}

      {/* ANALYZING */}
      {screen === "analyzing" && (
        <div style={styles.analyzing}>
          <div style={styles.analyzerCard}>
            <div style={styles.spinnerRing} className="spin" />
            <div style={styles.analyzerTitle}>Analyzing your quote...</div>
            <div style={styles.analyzerSteps}>
              <div className="step-appear" style={{ ...styles.step, animationDelay: "0s" }}>
                ⬡ Parsing line items and totals
              </div>
              <div className="step-appear" style={{ ...styles.step, animationDelay: "0.6s" }}>
                ⬡ Benchmarking against local rates
              </div>
              <div className="step-appear" style={{ ...styles.step, animationDelay: "1.2s" }}>
                ⬡ Identifying red flags and vague language
              </div>
              <div className="step-appear" style={{ ...styles.step, animationDelay: "1.8s" }}>
                ⬡ Calculating savings opportunities
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {screen === "results" && (
        <div style={styles.results}>
          {/* Summary bar */}
          <div style={styles.summaryBar}>
            <div style={styles.summaryItem}>
              <div style={styles.summaryLabel}>Quoted Total</div>
              <div style={styles.summaryValue}>
                ${ANALYSIS.totalQuoted.toLocaleString()}
              </div>
            </div>
            <div style={styles.summaryDivider} />
            <div style={styles.summaryItem}>
              <div style={styles.summaryLabel}>Fair Range (Your Area)</div>
              <div style={styles.summaryValue}>
                ${ANALYSIS.fairRangeLow.toLocaleString()} – ${ANALYSIS.fairRangeHigh.toLocaleString()}
              </div>
            </div>
            <div style={styles.summaryDivider} />
            <div style={styles.summaryItem}>
              <div style={styles.summaryLabel}>Savings Opportunity</div>
              <div style={{ ...styles.summaryValue, color: "#10B981" }}>
                Up to ${ANALYSIS.savingsOpportunity.toLocaleString()}
              </div>
            </div>
            <div style={styles.summaryDivider} />
            <div style={styles.summaryItem}>
              <div style={styles.summaryLabel}>Quote Score</div>
              <div style={styles.scoreBox}>
                <span style={styles.scoreNum}>{ANALYSIS.score}</span>
                <span style={styles.scoreMax}>/100</span>
              </div>
            </div>
          </div>

          <div style={styles.verdictBanner}>
            <span style={styles.verdictIcon}>◆</span>
            <span>
              This quote is <strong>within fair range</strong> for a kitchen remodel in your area — but has{" "}
              <strong style={{ color: "#EF4444" }}>5 issues</strong> that need
              to be resolved before you sign. Read the flags below.
            </span>
          </div>

          {/* Tabs */}
          <div style={styles.tabs}>
            {[
              { key: "redflags", label: `Red Flags (${ANALYSIS.redFlags.length})` },
              { key: "savings", label: `Save Money (${ANALYSIS.costReductions.length})` },
              { key: "questions", label: `Questions to Ask (${ANALYSIS.questions.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.key ? styles.tabActive : {}),
                }}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Red Flags */}
          {activeTab === "redflags" && (
            <div style={styles.tabContent}>
              {ANALYSIS.redFlags.map((flag, i) => {
                const cfg = severityConfig[flag.severity];
                return (
                  <div key={i} style={{ ...styles.flagCard, borderLeftColor: cfg.color }}>
                    <div style={styles.flagHeader}>
                      <span
                        style={{
                          ...styles.severityBadge,
                          color: cfg.color,
                          background: cfg.bg,
                        }}
                      >
                        {cfg.label}
                      </span>
                      <span style={styles.flagItem}>{flag.item}</span>
                    </div>
                    <p style={styles.flagDetail}>{flag.detail}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Savings */}
          {activeTab === "savings" && (
            <div style={styles.tabContent}>
              <div style={styles.savingsHeader}>
                You could recover up to{" "}
                <span style={{ color: "#10B981" }}>
                  ${ANALYSIS.savingsOpportunity.toLocaleString()}
                </span>{" "}
                through negotiation before signing.
              </div>
              {ANALYSIS.costReductions.map((item, i) => (
                <div key={i} style={styles.savingCard}>
                  <div style={styles.savingLeft}>
                    <div style={styles.savingItem}>{item.item}</div>
                    <div style={styles.savingNote}>{item.note}</div>
                  </div>
                  <div style={styles.savingAmount}>
                    +${item.saving.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Questions */}
          {activeTab === "questions" && (
            <div style={styles.tabContent}>
              <div style={styles.savingsHeader}>
                Send these questions to your contractor before signing anything.
              </div>
              {ANALYSIS.questions.map((q, i) => (
                <div key={i} style={styles.questionCard}>
                  <span style={styles.qNum}>{i + 1}</span>
                  <span style={styles.qText}>{q}</span>
                </div>
              ))}
            </div>
          )}

          {/* PDF Upsell */}
          <div style={styles.pdfUpsell}>
            <div style={styles.pdfLeft}>
              <div style={styles.pdfTitle}>Get the full negotiation report</div>
              <div style={styles.pdfDesc}>
                A polished PDF with all flags, savings breakdown, and questions — formatted to share with your contractor or take into any negotiation meeting.
              </div>
              <div style={styles.pdfFeatures}>
                <span style={styles.pdfFeature}>✓ Printable PDF</span>
                <span style={styles.pdfFeature}>✓ Contractor-ready format</span>
                <span style={styles.pdfFeature}>✓ Full savings analysis</span>
              </div>
            </div>
            <div style={styles.pdfRight}>
              <div style={styles.pdfPrice}>$19</div>
              <div style={styles.pdfOnce}>one-time</div>
              <button style={styles.pdfBtn}>Download Report →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  root: {
    minHeight: "100vh",
    background: "#0C0C0E",
    color: "#F0EDE8",
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 40px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoMark: {
    fontSize: 22,
    color: "#F59E0B",
  },
  logoText: {
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: "-0.02em",
    color: "#F0EDE8",
  },
  navBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.15)",
    color: "#A09890",
    padding: "8px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  },
  landing: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "60px 24px 80px",
  },
  heroSection: {
    textAlign: "center",
    marginBottom: 48,
  },
  badge: {
    display: "inline-block",
    background: "rgba(245,158,11,0.12)",
    color: "#F59E0B",
    border: "1px solid rgba(245,158,11,0.3)",
    padding: "4px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 24,
  },
  h1: {
    fontSize: 46,
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: "-0.03em",
    margin: "0 0 20px",
    fontFamily: "'DM Serif Display', Georgia, serif",
  },
  h1Accent: {
    color: "#F59E0B",
  },
  subtitle: {
    fontSize: 17,
    color: "#9B9289",
    lineHeight: 1.65,
    maxWidth: 520,
    margin: "0 auto",
  },
  card: {
    background: "#161618",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 32,
  },
  dropzone: {
    border: "1.5px dashed rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "28px 20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "all 0.2s",
    marginBottom: 24,
  },
  dropzoneActive: {
    borderColor: "#F59E0B",
    background: "rgba(245,158,11,0.04)",
  },
  dropzoneIcon: {
    fontSize: 28,
    color: "#4B4540",
    marginBottom: 8,
  },
  dropzoneText: {
    color: "#6B6560",
    fontSize: 14,
    marginBottom: 4,
  },
  dropzoneOr: {
    color: "#4B4540",
    fontSize: 12,
    margin: "8px 0",
  },
  uploadBtn: {
    display: "inline-block",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#C0B9B0",
    padding: "7px 16px",
    borderRadius: 6,
    fontSize: 13,
    cursor: "pointer",
  },
  divider: {
    textAlign: "center",
    position: "relative",
    marginBottom: 20,
  },
  dividerText: {
    fontSize: 12,
    color: "#4B4540",
    background: "#161618",
    padding: "0 12px",
    position: "relative",
    zIndex: 1,
  },
  textarea: {
    width: "100%",
    background: "#0C0C0E",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    color: "#D0C9C0",
    fontSize: 14,
    lineHeight: 1.6,
    padding: "16px",
    resize: "vertical",
    fontFamily: "inherit",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s",
  },
  inputRow: {
    display: "flex",
    gap: 12,
    marginTop: 16,
  },
  zipInput: {
    flex: "0 0 140px",
    background: "#0C0C0E",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    color: "#D0C9C0",
    fontSize: 14,
    padding: "12px 14px",
    fontFamily: "inherit",
    outline: "none",
  },
  analyzeBtn: {
    flex: 1,
    background: "#F59E0B",
    color: "#0C0C0E",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "-0.01em",
    transition: "opacity 0.2s, transform 0.1s",
  },
  analyzeBtnDisabled: {
    opacity: 0.35,
    cursor: "not-allowed",
  },
  sampleBtn: {
    width: "100%",
    marginTop: 14,
    background: "transparent",
    border: "none",
    color: "#5B5550",
    fontSize: 13,
    cursor: "pointer",
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
  trustRow: {
    display: "flex",
    justifyContent: "center",
    gap: 32,
    marginTop: 32,
  },
  trustItem: {
    fontSize: 12,
    color: "#4B4540",
  },
  // Analyzing
  analyzing: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "calc(100vh - 65px)",
  },
  analyzerCard: {
    textAlign: "center",
    padding: 60,
  },
  spinnerRing: {
    width: 52,
    height: 52,
    border: "2px solid rgba(255,255,255,0.08)",
    borderTop: "2px solid #F59E0B",
    borderRadius: "50%",
    margin: "0 auto 32px",
  },
  analyzerTitle: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 28,
    color: "#D0C9C0",
  },
  analyzerSteps: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    alignItems: "center",
  },
  step: {
    fontSize: 14,
    color: "#6B6560",
    opacity: 0,
  },
  // Results
  results: {
    maxWidth: 800,
    margin: "0 auto",
    padding: "40px 24px 100px",
  },
  summaryBar: {
    display: "flex",
    background: "#161618",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "24px 32px",
    marginBottom: 20,
    gap: 0,
  },
  summaryItem: {
    flex: 1,
    textAlign: "center",
  },
  summaryLabel: {
    fontSize: 11,
    color: "#6B6560",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    fontFamily: "'DM Serif Display', Georgia, serif",
  },
  summaryDivider: {
    width: 1,
    background: "rgba(255,255,255,0.06)",
    margin: "0 8px",
  },
  scoreBox: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "center",
    gap: 2,
  },
  scoreNum: {
    fontSize: 22,
    fontWeight: 700,
    color: "#F59E0B",
    fontFamily: "'DM Serif Display', Georgia, serif",
  },
  scoreMax: {
    fontSize: 13,
    color: "#6B6560",
  },
  verdictBanner: {
    background: "rgba(245,158,11,0.06)",
    border: "1px solid rgba(245,158,11,0.15)",
    borderRadius: 10,
    padding: "14px 20px",
    fontSize: 14,
    color: "#C0B9B0",
    lineHeight: 1.6,
    marginBottom: 28,
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },
  verdictIcon: {
    color: "#F59E0B",
    flexShrink: 0,
    marginTop: 1,
  },
  tabs: {
    display: "flex",
    gap: 4,
    marginBottom: 24,
    background: "#161618",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    padding: "10px 16px",
    background: "transparent",
    border: "none",
    color: "#6B6560",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    borderRadius: 7,
    transition: "all 0.15s",
  },
  tabActive: {
    background: "#242426",
    color: "#F0EDE8",
  },
  tabContent: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginBottom: 40,
  },
  flagCard: {
    background: "#161618",
    border: "1px solid rgba(255,255,255,0.06)",
    borderLeft: "3px solid",
    borderRadius: "0 10px 10px 0",
    padding: "18px 20px",
  },
  flagHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  severityBadge: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    padding: "3px 8px",
    borderRadius: 4,
    flexShrink: 0,
  },
  flagItem: {
    fontSize: 15,
    fontWeight: 600,
    color: "#E0D9D0",
  },
  flagDetail: {
    fontSize: 13,
    color: "#7B7570",
    lineHeight: 1.65,
    margin: 0,
  },
  savingsHeader: {
    fontSize: 15,
    color: "#9B9289",
    marginBottom: 8,
    lineHeight: 1.5,
  },
  savingCard: {
    background: "#161618",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "18px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
  },
  savingLeft: {
    flex: 1,
  },
  savingItem: {
    fontSize: 15,
    fontWeight: 600,
    color: "#E0D9D0",
    marginBottom: 6,
  },
  savingNote: {
    fontSize: 13,
    color: "#7B7570",
  },
  savingAmount: {
    fontSize: 18,
    fontWeight: 700,
    color: "#10B981",
    flexShrink: 0,
    fontFamily: "'DM Serif Display', Georgia, serif",
  },
  questionCard: {
    display: "flex",
    gap: 16,
    background: "#161618",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 10,
    padding: "16px 20px",
    alignItems: "flex-start",
  },
  qNum: {
    background: "rgba(245,158,11,0.12)",
    color: "#F59E0B",
    fontSize: 12,
    fontWeight: 700,
    width: 24,
    height: 24,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  qText: {
    fontSize: 14,
    color: "#C0B9B0",
    lineHeight: 1.6,
  },
  // PDF Upsell
  pdfUpsell: {
    background: "linear-gradient(135deg, #1A1610 0%, #161618 100%)",
    border: "1px solid rgba(245,158,11,0.2)",
    borderRadius: 16,
    padding: "32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 32,
  },
  pdfLeft: {
    flex: 1,
  },
  pdfTitle: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    marginBottom: 10,
    fontFamily: "'DM Serif Display', Georgia, serif",
  },
  pdfDesc: {
    fontSize: 14,
    color: "#9B9289",
    lineHeight: 1.65,
    marginBottom: 16,
  },
  pdfFeatures: {
    display: "flex",
    gap: 20,
  },
  pdfFeature: {
    fontSize: 12,
    color: "#6B9E8A",
  },
  pdfRight: {
    textAlign: "center",
    flexShrink: 0,
  },
  pdfPrice: {
    fontSize: 42,
    fontWeight: 700,
    color: "#F0EDE8",
    lineHeight: 1,
    fontFamily: "'DM Serif Display', Georgia, serif",
  },
  pdfOnce: {
    fontSize: 12,
    color: "#6B6560",
    marginBottom: 16,
    marginTop: 4,
  },
  pdfBtn: {
    background: "#F59E0B",
    color: "#0C0C0E",
    border: "none",
    borderRadius: 8,
    padding: "12px 24px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .spin { animation: spin 0.9s linear infinite; }

  @keyframes stepIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .step-appear {
    animation: stepIn 0.4s ease forwards;
  }

  textarea:focus {
    border-color: rgba(245,158,11,0.4) !important;
  }
`;
