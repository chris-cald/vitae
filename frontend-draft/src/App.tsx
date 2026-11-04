import { useState } from "react";
import { activeView, primaryViews, type ViewId } from "./workbench";

const applicationStages = ["New evidence", "Drafting", "Decision review"];
const placements = ["Resume", "Cover letter", "Interview"] as const;
type Placement = (typeof placements)[number];

export default function App() {
  const [view, setView] = useState<ViewId>("today");
  const [placement, setPlacement] = useState<Placement>("Resume");
  const current = activeView(view);

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand"><span>V</span> vitae</div>
        <p className="sidebar-label">WORKBENCH</p>
        <nav aria-label="Primary workbench views">
          {primaryViews.map((item) => (
            <button
              aria-current={view === item.id ? "page" : undefined}
              className={`nav-item ${view === item.id ? "selected" : ""}`}
              key={item.id}
              onClick={() => setView(item.id)}
              type="button"
            >
              <span className="nav-dot" />{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <strong>Mock workspace</strong>
          <span>Local-only draft · no API calls</span>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">CAREER OPERATING SYSTEM</p>
            <h1>{current.label}</h1>
          </div>
          <div className="top-actions">
            <span className="status"><i /> Evidence synced</span>
            <button className="quiet-button" type="button">New application</button>
          </div>
        </header>

        <nav className="top-nav" aria-label="Workbench shortcuts">
          {primaryViews.map((item) => (
            <button
              aria-pressed={view === item.id}
              key={item.id}
              onClick={() => setView(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {(view === "today" || view === "applications") && (
          <ApplicationWorkspace placement={placement} setPlacement={setPlacement} />
        )}
        {view === "knowledge" && <KnowledgeView />}
        {view === "catalog" && <CatalogView />}
        {view === "deliverables" && <DeliverablesView />}
        {(view === "activity" || view === "decisions") && <ActivityView decisionMode={view === "decisions"} />}
        {view === "sources" && <SourcesView />}
      </section>
    </main>
  );
}

function ApplicationWorkspace({
  placement,
  setPlacement,
}: {
  placement: Placement;
  setPlacement: (placement: Placement) => void;
}) {
  return <div className="workspace">
    <section className="panel applications-panel">
      <div className="panel-heading"><div><p className="eyebrow">APPLICATIONS</p><h2>Active focus</h2></div><button type="button">+ Add</button></div>
      <button className="application active" type="button"><span className="avatar">PS</span><span><strong>Product strategy</strong><small>Stage: evidence placement</small></span><b>72</b></button>
      <button className="application" type="button"><span className="avatar slate">OS</span><span><strong>Operating systems</strong><small>Next: reconcile brief</small></span><b>64</b></button>
      <div className="stage-list">
        {applicationStages.map((stage, index) => <div key={stage}><span>{index + 1}</span>{stage}</div>)}
      </div>
      <button className="all-link" type="button">View all applications →</button>
    </section>

    <section className="panel decision-panel">
      <div className="panel-heading"><div><p className="eyebrow">DECISION SPACE</p><h2>Product strategy</h2></div><span className="pill amber">Needs review</span></div>
      <p className="intro">Project the strongest verified signals into each application surface before drafting.</p>
      <article className="decision-card emphasis"><div><span className="card-kicker">NEXT DECISION</span><h3>Place market-entry evidence</h3><p>Use the outcome narrative where it supports the reader’s next question.</p></div><button type="button">Review</button></article>
      <article className="decision-card"><div><span className="card-kicker">CONSTRAINT</span><h3>Keep claim scope narrow</h3><p>One proof point per proposition; retain traceability.</p></div><span className="pill">Confirmed</span></article>
      <article className="decision-card"><div><span className="card-kicker">BUNDLE CHECK</span><h3>Three deliverables linked</h3><p>Resume, letter, and interview notes share the same evidence base.</p></div><span className="number">3</span></article>
    </section>

    <section className="panel evidence-panel">
      <div className="panel-heading"><div><p className="eyebrow">EVIDENCE PLACEMENT</p><h2>Product strategy</h2></div><span className="source-count">4 sources</span></div>
      <div className="evidence-block"><span className="signal">VERIFIED SIGNAL</span><h3>Clarified a launch decision with cross-functional research</h3><p>Confidence: high · Source-backed · Reusable</p></div>
      <p className="placement-label">Project this evidence into</p>
      <div className="choice-row" role="group" aria-label="Evidence placement">
        {placements.map((option) => <button className={placement === option ? "chosen" : ""} key={option} onClick={() => setPlacement(option)} type="button">{option}</button>)}
      </div>
      <div className="projection"><span>Projection</span><strong>{placement}</strong><p>{placement === "Resume" ? "A concise accomplishment with outcome context." : placement === "Cover letter" ? "A narrative bridge between strategy and motivation." : "A story prompt with decision, action, and result."}</p></div>
      <button className="primary-button" type="button">Add to {placement}</button>
    </section>
  </div>;
}

function KnowledgeView() {
  return <section className="single-view"><p className="eyebrow">CAREER KNOWLEDGE</p><h2>Evidence library</h2><p className="intro">Reusable, source-backed signals are kept separate from application-specific projections.</p><div className="metric-grid"><Metric value="18" label="Verified signals" /><Metric value="6" label="Decision patterns" /><Metric value="4" label="Reusable narratives" /></div><div className="list-card"><strong>Market entry decision</strong><span>Strategy · Research · High confidence</span><button type="button">Open evidence →</button></div></section>;
}

function CatalogView() {
  return <section className="single-view"><p className="eyebrow">CATALOG / PROJECTION BUILDER</p><h2>Build a targeted projection</h2><div className="builder"><div><span>1</span><strong>Select evidence</strong><p>Market entry decision</p></div><div><span>2</span><strong>Choose audience</strong><p>Product strategy reviewer</p></div><div><span>3</span><strong>Choose surface</strong><p>Resume accomplishment</p></div></div><button className="primary-button" type="button">Create draft projection</button></section>;
}

function DeliverablesView() {
  return <section className="single-view"><p className="eyebrow">DELIVERABLE BUNDLE</p><h2>Product strategy package</h2><div className="bundle"><Deliverable name="Resume" detail="3 evidence projections · ready to review" /><Deliverable name="Cover letter" detail="1 narrative thread · draft" /><Deliverable name="Interview brief" detail="4 source-backed stories · prepared" /></div><button className="primary-button" type="button">Review bundle</button></section>;
}

function ActivityView({ decisionMode }: { decisionMode: boolean }) {
  return <section className="single-view"><p className="eyebrow">{decisionMode ? "DECISION RECONCILIATION" : "ACTIVITY TIMELINE"}</p><h2>{decisionMode ? "Resolve evidence choices" : "Application lifecycle"}</h2><div className="timeline"><Timeline title="Evidence mapped" detail="Market-entry signal linked to Product strategy" /><Timeline title="Decision requested" detail="Choose the best surface for the verified outcome" /><Timeline title={decisionMode ? "Reconcile projection" : "Deliverable review"} detail={decisionMode ? "Confirm claim scope before bundle generation" : "Bundle remains ready for final review"} /></div></section>;
}

function SourcesView() {
  return <section className="single-view"><p className="eyebrow">SOURCES & EVIDENCE</p><h2>Traceable signal ledger</h2><div className="source-table"><div className="table-head"><span>Signal</span><span>Reliability</span><span>Use</span></div><div><strong>Launch research</strong><span>High</span><span>Resume, interview</span></div><div><strong>Stakeholder alignment</strong><span>High</span><span>Cover letter</span></div><div><strong>Operating cadence</strong><span>Medium</span><span>Interview</span></div></div></section>;
}

function Metric({ value, label }: { value: string; label: string }) { return <div className="metric"><strong>{value}</strong><span>{label}</span></div>; }
function Deliverable({ name, detail }: { name: string; detail: string }) { return <div className="deliverable"><span className="doc-mark" /> <div><strong>{name}</strong><p>{detail}</p></div><button type="button">Open</button></div>; }
function Timeline({ title, detail }: { title: string; detail: string }) { return <div className="timeline-item"><span /><div><strong>{title}</strong><p>{detail}</p><small>Today · mock activity</small></div></div>; }
