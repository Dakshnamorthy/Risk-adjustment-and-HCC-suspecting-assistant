import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './landing.css';

/* ─────────────────────────────────────────────────────────────
   SLIDE DEFINITIONS
───────────────────────────────────────────────────────────── */
const SLIDES = [
  'hero', 'upload', 'hcc', 'signal', 'classify', 'flagged', 'unflagged', 'pricing', 'final'
];
const TOTAL = SLIDES.length;

/* ─────────────────────────────────────────────────────────────
   VISUAL PANELS
───────────────────────────────────────────────────────────── */
function UploadVisual() {
  return (
    <div className="lp-card">
      <div className="lp-card-header">
        <div className="lp-card-dot" style={{ background: '#EF4444' }} />
        <div className="lp-card-dot" style={{ background: '#F59E0B' }} />
        <div className="lp-card-dot" style={{ background: '#10B981' }} />
        <span className="lp-card-title">HELIZA · Data Ingestion</span>
      </div>
      <div className="lp-card-body">
        <div className="lp-upload-zone">
          <div className="lp-upload-icon">📤</div>
          <div className="lp-upload-label">Drop your claims CSV here</div>
          <div className="lp-upload-hint">Supports ICD-10 coded CMS claims format</div>
          <button className="lp-upload-btn">Browse File</button>
        </div>
        <div className="lp-file-row">
          <span className="lp-file-icon">📄</span>
          <span className="lp-file-name">claims_q3_2024.csv</span>
          <span className="lp-file-badge">✓ Validated</span>
        </div>
      </div>
    </div>
  );
}

function HccVisual() {
  const rows = [
    { icd: 'E11.65', desc: 'Type 2 Diabetes w/ complications', hcc: 'HCC 19', cls: 'hcc19' },
    { icd: 'I50.32', desc: 'Chronic systolic heart failure', hcc: 'HCC 85', cls: 'hcc85' },
    { icd: 'J44.1',  desc: 'COPD with acute exacerbation', hcc: 'HCC 111', cls: 'hcc108' },
    { icd: 'N18.4',  desc: 'Chronic kidney disease, Stage 4', hcc: 'HCC 136', cls: 'hcc22' },
  ];
  return (
    <div className="lp-card">
      <div className="lp-card-header">
        <div className="lp-card-dot" style={{ background: '#EF4444' }} />
        <div className="lp-card-dot" style={{ background: '#F59E0B' }} />
        <div className="lp-card-dot" style={{ background: '#10B981' }} />
        <span className="lp-card-title">ICD-10 → HCC Crosswalk</span>
      </div>
      <div className="lp-card-body" style={{ padding: '0' }}>
        <table className="lp-table">
          <thead>
            <tr>
              <th>ICD-10</th>
              <th>Description</th>
              <th>HCC Group</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.icd}>
                <td style={{ fontFamily: 'monospace', color: '#60A5FA', fontSize: 12 }}>{r.icd}</td>
                <td style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{r.desc}</td>
                <td><span className={`lp-hcc-badge ${r.cls}`}>{r.hcc}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SignalVisual() {
  return (
    <div className="lp-card">
      <div className="lp-card-header">
        <div className="lp-card-dot" style={{ background: '#EF4444' }} />
        <div className="lp-card-dot" style={{ background: '#F59E0B' }} />
        <div className="lp-card-dot" style={{ background: '#10B981' }} />
        <span className="lp-card-title">Documentation Signal Analysis</span>
      </div>
      <div className="lp-card-body">
        <div className="lp-risk-list">
          {[
            { name: 'Doc. Completeness', score: 42, color: '#EF4444', label: '42%' },
            { name: 'HCC Suspicion', score: 78, color: '#F59E0B', label: 'High' },
            { name: 'Encounter Support', score: 55, color: '#F59E0B', label: 'Partial' },
            { name: 'Claim Consistency', score: 88, color: '#34D399', label: 'Strong' },
          ].map(r => (
            <div key={r.name} className="lp-risk-row">
              <span className="lp-risk-name">{r.name}</span>
              <div className="lp-risk-bar-bg">
                <div className="lp-risk-bar-fill" style={{ width: `${r.score}%`, background: r.color }} />
              </div>
              <span className="lp-risk-score" style={{ color: r.color }}>{r.label}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, padding: '10px 14px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#F87171', marginBottom: 4 }}>Verdict</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Insufficient documentation for HCC 85 · Patient flagged for review</div>
        </div>
      </div>
    </div>
  );
}

function ClassifyVisual() {
  return (
    <div style={{ width: '100%' }}>
      <div className="lp-cls-row">
        <div className="lp-cls-card flagged">
          <div className="lp-cls-label">🚩 Flagged</div>
          <div className="lp-cls-num">1,247</div>
          <div className="lp-cls-hint">Documentation gaps or high HCC suspicion detected</div>
          <div className="lp-cls-bar" />
        </div>
        <div className="lp-cls-card unflagged">
          <div className="lp-cls-label">✅ Unflagged</div>
          <div className="lp-cls-num">3,891</div>
          <div className="lp-cls-hint">Fully documented and ready for risk scoring</div>
          <div className="lp-cls-bar" />
        </div>
      </div>
      <div style={{ marginTop: 14, padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>Routing</div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Flagged → AI Agent Analyzer</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34D399' }} />
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Unflagged → ML Risk Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AgentVisual() {
  return (
    <div className="lp-card">
      <div className="lp-card-header">
        <div className="lp-card-dot" style={{ background: '#EF4444' }} />
        <div className="lp-card-dot" style={{ background: '#F59E0B' }} />
        <div className="lp-card-dot" style={{ background: '#10B981' }} />
        <span className="lp-card-title">AI Agent Report · Patient #4821</span>
      </div>
      <div className="lp-card-body">
        <div className="lp-report-header">
          <div className="lp-report-avatar">🤖</div>
          <div>
            <div className="lp-report-from">HELIZA Agent</div>
            <div className="lp-report-sub">Flagged · HCC 85 — Systolic Heart Failure</div>
          </div>
        </div>
        <div className="lp-report-finding">
          <div className="lp-report-finding-label">Finding</div>
          <div className="lp-report-finding-text">HCC 85 code (I50.32) present in claims but no supporting clinical notes found in encounter records for the review period.</div>
        </div>
        <div className="lp-report-finding">
          <div className="lp-report-finding-label">Missing Documentation</div>
          <div className="lp-report-finding-text">Cardiology encounter note · Echocardiogram report · Treating physician attestation</div>
        </div>
        <div className="lp-report-actions">
          <button className="lp-report-btn view">View Full Report</button>
          <button className="lp-report-btn followup">Mark for Follow-up</button>
        </div>
      </div>
    </div>
  );
}

function RiskVisual() {
  const patients = [
    { name: 'James K. — HCC 85', score: 91, color: '#EF4444' },
    { name: 'Maria L. — HCC 19', score: 76, color: '#F59E0B' },
    { name: 'Robert S. — HCC 108', score: 68, color: '#F59E0B' },
    { name: 'Anna T. — HCC 22', score: 45, color: '#34D399' },
    { name: 'David M. — HCC 136', score: 38, color: '#34D399' },
  ];
  return (
    <div className="lp-card">
      <div className="lp-card-header">
        <div className="lp-card-dot" style={{ background: '#EF4444' }} />
        <div className="lp-card-dot" style={{ background: '#F59E0B' }} />
        <div className="lp-card-dot" style={{ background: '#10B981' }} />
        <span className="lp-card-title">ML Risk Score · Priority Queue</span>
      </div>
      <div className="lp-card-body">
        <div className="lp-risk-list">
          {patients.map(p => (
            <div key={p.name} className="lp-risk-row">
              <span className="lp-risk-name" style={{ width: 140 }}>{p.name}</span>
              <div className="lp-risk-bar-bg">
                <div className="lp-risk-bar-fill" style={{ width: `${p.score}%`, background: p.color }} />
              </div>
              <span className="lp-risk-score" style={{ color: p.color }}>{p.score}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 100, background: 'rgba(52,211,153,0.12)', color: '#34D399', fontWeight: 700 }}>Proceed</span>
          <span style={{ fontSize: 11, padding: '4px 10px', borderRadius: 100, background: 'rgba(251,177,60,0.12)', color: '#FBB13C', fontWeight: 700 }}>Mark for Review</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const slideRefs = useRef([]);
  const [active, setActive] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [animated, setAnimated] = useState(new Set([0])); // hero is visible by default

  /* ── Track active slide via scroll position ── */
  const handleScroll = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / el.clientHeight);
    const clamped = Math.max(0, Math.min(TOTAL - 1, idx));
    setActive(clamped);
    setScrolled(el.scrollTop > 10);
    setAnimated(prev => {
      if (prev.has(clamped)) return prev;
      const next = new Set(prev);
      next.add(clamped);
      return next;
    });
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /* ── Jump to slide on dot click ── */
  const goTo = useCallback((idx) => {
    const el = rootRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(TOTAL - 1, idx));
    el.scrollTo({ top: clamped * el.clientHeight, behavior: 'smooth' });
  }, []);

  /* ── Keyboard navigation (window-level, since div won't get keys by default) ── */
  useEffect(() => {
    const handleKey = (e) => {
      // Don't intercept if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const el = rootRef.current;
      if (!el) return;
      const current = Math.round(el.scrollTop / el.clientHeight);

      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          goTo(current + 1);
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          goTo(current - 1);
          break;
        case 'Home':
          e.preventDefault();
          goTo(0);
          break;
        case 'End':
          e.preventDefault();
          goTo(TOTAL - 1);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goTo]);

  const cls = (i, extra = '') =>
    `lp-animate${animated.has(i) ? ' in' : ''} ${extra}`;

  return (
    <div className="lp-root" ref={rootRef}>

      {/* ── NAV ── */}
      <nav className={`lp-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="lp-logo">
          <div className="lp-logo-box">HZ</div>
          <span className="lp-logo-name">HELIZA</span>
        </div>
        <button className="lp-signin" onClick={() => navigate('/login')}>
          Sign in <span>→</span>
        </button>
      </nav>

      {/* ── PROGRESS DOTS ── */}
      <div className="lp-progress">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className={`lp-dot ${active === i ? 'active' : ''}`}
            onClick={() => goTo(i)}
            title={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* ══ SLIDE 0 — HERO ══ */}
      <section className="lp-slide" ref={el => slideRefs.current[0] = el}>
        <div className="lp-inner">
          {/* LEFT — headline + description + CTA */}
          <div>
            <p className={`lp-tag ${cls(0)}`}>Medicare Advantage · Risk Adjustment</p>
            <h1 className={`lp-h1 ${cls(0, 'lp-animate-delay-1')}`}>
              Zero-gap<br />
              <span style={{ color: '#3B82F6' }}>HCC</span><br />
              Analysis.
            </h1>
            <p className={`lp-body ${cls(0, 'lp-animate-delay-2')}`} style={{ maxWidth: 440 }}>
              HELIZA maps ICD-10 codes to HCC categories, surfaces documentation gaps, and predicts risk scores — so every chronic condition is coded and risk-adjusted with precision.
            </p>
            <div className={`lp-cta ${cls(0, 'lp-animate-delay-3')}`}>
              <button className="lp-btn-primary" onClick={() => navigate('/login')}>Open Platform</button>
              <button className="lp-btn-secondary" onClick={() => goTo(1)}>See Workflow ↓</button>
            </div>
          </div>

          {/* RIGHT — stats panel */}
          <div className={`lp-visual ${cls(0, 'lp-animate-delay-2')}`} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
              borderRadius: 20,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              {[
                { val: '70K+', lbl: 'ICD-10 codes mapped', accent: '#3B82F6' },
                { val: '86',   lbl: 'HCC risk categories', accent: '#7C3AED' },
                { val: 'CMS',  lbl: 'Regulatory compliant', accent: '#10B981' },
                { val: 'AI',   lbl: 'Agent-powered review', accent: '#F59E0B' },
              ].map(({ val, lbl, accent }) => (
                <div key={lbl} style={{
                  background: 'rgba(255,255,255,0.03)',
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}>
                  <span style={{
                    fontSize: 44,
                    fontWeight: 900,
                    letterSpacing: '-2px',
                    color: accent,
                    lineHeight: 1,
                  }}>{val}</span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.35)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    lineHeight: 1.4,
                  }}>{lbl}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 14, textAlign: 'center', letterSpacing: '0.05em' }}>
              HELIZA · Health Evidence &amp; Liability Intelligence for Zero-gap Analysis
            </p>
          </div>
        </div>

        <div className="lp-scroll-hint">
          <span>Scroll</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </section>

      {/* ══ SLIDE 1 — CSV UPLOAD ══ */}
      <section className="lp-slide" ref={el => slideRefs.current[1] = el}>
        <div className="lp-inner">
          <div>
            <p className={`lp-tag ${cls(1)}`}>Step 01 · Data Ingestion</p>
            <h2 className={`lp-h2 ${cls(1, 'lp-animate-delay-1')}`}>Reviewer uploads<br />the claims CSV.</h2>
            <p className={`lp-body ${cls(1, 'lp-animate-delay-2')}`}>
              The insurance reviewer uploads a patient claims CSV containing ICD-10 diagnosis codes. HELIZA instantly validates the file structure and prepares the dataset for analysis.
            </p>
            <div className={`lp-detail ${cls(1, 'lp-animate-delay-3')}`}>
              <p>Supports standard CMS claims formats with automatic schema detection</p>
              <p>Immediate row-level validation with error highlighting and reporting</p>
              <p>Secure, encrypted ingestion pipeline — data never leaves your environment</p>
            </div>
          </div>
          <div className={`lp-visual ${cls(1, 'lp-animate-delay-2')}`}>
            <UploadVisual />
          </div>
        </div>
      </section>

      {/* ══ SLIDE 2 — HCC MAPPING ══ */}
      <section className="lp-slide" ref={el => slideRefs.current[2] = el}>
        <div className="lp-inner">
          <div className={`lp-visual ${cls(2, 'lp-animate-delay-1')}`}>
            <HccVisual />
          </div>
          <div>
            <p className={`lp-tag ${cls(2)}`}>Step 02 · HCC Mapping</p>
            <h2 className={`lp-h2 ${cls(2, 'lp-animate-delay-1')}`}>ICD-10 codes map<br />to HCC groups.</h2>
            <p className={`lp-body ${cls(2, 'lp-animate-delay-2')}`}>
              Each diagnosis code is cross-referenced against the CMS-HCC crosswalk, assigning every patient to the correct Hierarchical Condition Category — the foundation of risk adjustment in Medicare Advantage.
            </p>
            <div className={`lp-detail ${cls(2, 'lp-animate-delay-3')}`}>
              <p>Uses the official CMS-HCC Version 28 crosswalk table</p>
              <p>Hierarchy and exclusion rules applied automatically</p>
              <p>Produces per-patient HCC group assignments with RAF weight estimates</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SLIDE 3 — SIGNAL ANALYSIS ══ */}
      <section className="lp-slide" ref={el => slideRefs.current[3] = el}>
        <div className="lp-inner">
          <div>
            <p className={`lp-tag ${cls(3)}`}>Step 03 · Signal Analysis</p>
            <h2 className={`lp-h2 ${cls(3, 'lp-animate-delay-1')}`}>Documentation gaps<br />and HCC suspicion<br />are scored.</h2>
            <p className={`lp-body ${cls(3, 'lp-animate-delay-2')}`}>
              HELIZA cross-references each patient's HCC assignment against their available clinical documentation. Encounter history, claim patterns, and comorbidity likelihood are scored to detect undercoded conditions.
            </p>
            <div className={`lp-detail ${cls(3, 'lp-animate-delay-3')}`}>
              <p>Documentation completeness score computed per HCC per patient</p>
              <p>HCC suspicion model flags conditions likely present but undocumented</p>
            </div>
          </div>
          <div className={`lp-visual ${cls(3, 'lp-animate-delay-2')}`}>
            <SignalVisual />
          </div>
        </div>
      </section>

      {/* ══ SLIDE 4 — CLASSIFY ══ */}
      <section className="lp-slide" ref={el => slideRefs.current[4] = el}>
        <div className="lp-inner">
          <div className={`lp-visual ${cls(4, 'lp-animate-delay-1')}`} style={{ alignItems: 'flex-start' }}>
            <ClassifyVisual />
          </div>
          <div>
            <p className={`lp-tag amber ${cls(4)}`}>Step 04 · Classification</p>
            <h2 className={`lp-h2 ${cls(4, 'lp-animate-delay-1')}`}>Every patient<br />is routed to<br />the right track.</h2>
            <p className={`lp-body ${cls(4, 'lp-animate-delay-2')}`}>
              Based on documentation completeness and HCC suspicion scores, patients are automatically split into two parallel review lanes — Flagged and Unflagged — each with its own workflow.
            </p>
          </div>
        </div>
      </section>

      {/* ══ SLIDE 5 — FLAGGED PATH ══ */}
      <section className="lp-slide" ref={el => slideRefs.current[5] = el}>
        <div className="lp-inner">
          <div>
            <p className={`lp-tag red ${cls(5)}`}>Step 05 · Flagged Path</p>
            <h2 className={`lp-h2 ${cls(5, 'lp-animate-delay-1')}`}>AI Agent analyzes<br />each flagged case<br />and explains why.</h2>
            <p className={`lp-body ${cls(5, 'lp-animate-delay-2')}`}>
              Flagged patients go to the HELIZA AI Agent. It investigates HCC signals, documentation gaps, and claim history — then produces a structured explanation report the reviewer acts on.
            </p>
            <div className={`lp-detail ${cls(5, 'lp-animate-delay-3')}`} style={{ borderLeftColor: 'rgba(239,68,68,0.4)' }}>
              <p>Reviewer reads the report and marks the case for follow-up</p>
              <p>Missing documents are located, uploaded, and verified</p>
              <p>Once verified, patient moves from Flagged → Unflagged lane</p>
            </div>
          </div>
          <div className={`lp-visual ${cls(5, 'lp-animate-delay-2')}`}>
            <AgentVisual />
          </div>
        </div>
      </section>

      {/* ══ SLIDE 6 — UNFLAGGED PATH ══ */}
      <section className="lp-slide" ref={el => slideRefs.current[6] = el}>
        <div className="lp-inner">
          <div className={`lp-visual ${cls(6, 'lp-animate-delay-1')}`}>
            <RiskVisual />
          </div>
          <div>
            <p className={`lp-tag green ${cls(6)}`}>Step 06 · Unflagged Path</p>
            <h2 className={`lp-h2 ${cls(6, 'lp-animate-delay-1')}`}>ML model scores<br />risk and surfaces<br />who needs attention.</h2>
            <p className={`lp-body ${cls(6, 'lp-animate-delay-2')}`}>
              Patients with complete documentation enter the prediction pipeline. An ML model computes a risk score per HCC group and ranks patients by priority — highest-risk members at the top.
            </p>
            <div className={`lp-detail ${cls(6, 'lp-animate-delay-3')}`} style={{ borderLeftColor: 'rgba(52,211,153,0.4)' }}>
              <p>AI agent explains the risk score rationale and supporting evidence</p>
              <p>Reviewer marks satisfied cases for review, then proceeds to CMS submission</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SLIDE 7 — PRICING ══ */}
      <section className="lp-slide" ref={el => slideRefs.current[7] = el}>
        <div className="lp-inner" style={{ gridTemplateColumns: '1fr', maxWidth: 1100, alignItems: 'start', paddingTop: 80 }}>
          <div className={`lp-animate${animated.has(7) ? ' in' : ''}`}>
            <p className="lp-tag" style={{ justifyContent: 'center' }}>Pricing</p>
            <h2 className="lp-h2" style={{ textAlign: 'center', marginBottom: 8 }}>Choose your plan.</h2>
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.35)', fontSize: 15, marginBottom: 40 }}>Scale HELIZA to the size of your member population.</p>
            <div className="lp-pricing-grid">
              {[
                {
                  name: 'Basic',
                  price: '$500',
                  period: '/month',
                  highlight: false,
                  features: [
                    'HCC Mapping (ICD-10 → HCC)',
                    'Flagged / Unflagged Classification',
                    'Up to 10,000 patient records',
                    'Standard support',
                  ],
                  missing: [
                    'Risk Score Prediction',
                    'AI Agent Analysis',
                    'Unlimited cloud storage',
                  ],
                  cta: 'Get Started',
                },
                {
                  name: 'Standard',
                  price: '$1,000',
                  period: '/month',
                  highlight: true,
                  features: [
                    'HCC Mapping (ICD-10 → HCC)',
                    'Flagged / Unflagged Classification',
                    'Risk Score Prediction (unflagged)',
                    'Up to 25,000 patient records',
                    'Priority support',
                  ],
                  missing: [
                    'AI Agent Analysis',
                    'Unlimited cloud storage',
                  ],
                  cta: 'Most Popular',
                },
                {
                  name: 'Premium',
                  price: '$2,000',
                  period: '/month',
                  highlight: false,
                  features: [
                    'HCC Mapping (ICD-10 → HCC)',
                    'Flagged / Unflagged Classification',
                    'Risk Score Prediction (unflagged)',
                    'AI Agent Analysis (flagged)',
                    'Unlimited cloud storage',
                    'Dedicated support',
                  ],
                  missing: [],
                  cta: 'Contact Sales',
                },
              ].map((plan) => (
                <div key={plan.name} style={{
                  background: plan.highlight ? 'rgba(37,99,235,0.12)' : 'rgba(255,255,255,0.03)',
                  border: plan.highlight ? '1.5px solid rgba(59,130,246,0.5)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 18,
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}>
                  {plan.highlight && (
                    <div style={{
                      position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                      background: '#2563EB', color: '#fff',
                      fontSize: 10, fontWeight: 800, letterSpacing: '0.12em',
                      textTransform: 'uppercase', padding: '4px 14px', borderRadius: 100,
                    }}>Most Popular</div>
                  )}
                  <p style={{ fontSize: 13, fontWeight: 700, color: plan.highlight ? '#60A5FA' : 'rgba(255,255,255,0.5)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{plan.name}</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                    <span style={{ fontSize: 40, fontWeight: 900, color: '#fff', letterSpacing: '-2px' }}>{plan.price}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{plan.period}</span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ color: '#34D399', fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                    {plan.missing.map(f => (
                      <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: 13, flexShrink: 0, marginTop: 1 }}>—</span>
                        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', lineHeight: 1.4, textDecoration: 'line-through' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/login')}
                    style={{
                      width: '100%', padding: '11px 0',
                      background: plan.highlight ? '#2563EB' : 'rgba(255,255,255,0.06)',
                      color: plan.highlight ? '#fff' : 'rgba(255,255,255,0.6)',
                      border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                  >{plan.cta}</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ SLIDE 8 — FINAL ══ */}
      <section className="lp-slide" ref={el => slideRefs.current[8] = el}>
        <div className="lp-inner center">
          <div>
            <p className={`lp-tag ${cls(8)}`} style={{ justifyContent: 'center' }}>End of Workflow</p>
            <h2 className={`lp-h1 ${cls(8, 'lp-animate-delay-1')}`} style={{ letterSpacing: '-3px', marginTop: 16 }}>
              Zero gaps.<br />
              <span style={{ color: '#3B82F6' }}>Every HCC</span><br />
              documented.
            </h2>
            <p className={`lp-body ${cls(8, 'lp-animate-delay-2')}`} style={{ maxWidth: 520, margin: '0 auto 40px' }}>
              HELIZA ensures every chronic condition is coded, documented, and risk-adjusted — compliantly, completely, and automatically.
            </p>
            <div className={`lp-cta ${cls(8, 'lp-animate-delay-3')}`} style={{ justifyContent: 'center' }}>
              <button className="lp-btn-primary" style={{ fontSize: 16, padding: '16px 36px' }} onClick={() => navigate('/login')}>
                Open HELIZA →
              </button>
            </div>
            <p className={cls(8, 'lp-animate-delay-4')} style={{ marginTop: 20, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>
              Authorized healthcare professionals only
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
