import { useState } from "react";
import { CatalogDevelopment, initialCatalogItems } from "./CatalogDevelopment";
import { activeView, primaryViews, type ViewId } from "./workbench";

const applicationStages = ["New evidence", "Drafting", "Decision review"];
const placements = ["Resume", "Cover letter", "Interview"] as const;
type Placement = (typeof placements)[number];
const applications = [
  { id: "product", title: "Product strategy", initials: "PS", catalogItem: "market-entry", signal: "Market entry decision", detail: "Clarified a launch decision with cross-functional research", readiness: "Source-backed · Reusable" },
  { id: "operating", title: "Operating systems", initials: "OS", catalogItem: "gaps", signal: "Operating cadence", detail: "Operating cadence outcome reference", readiness: "Needs evidence and human review" },
] as const;
type ApplicationId = typeof applications[number]["id"];
type ApplicationContext = { placement: Placement; query: string };

export default function App() {
  const [view, setView] = useState<ViewId>("today");
  const [applicationId, setApplicationId] = useState<ApplicationId>("product");
  const [applicationContexts, setApplicationContexts] = useState<Record<ApplicationId, ApplicationContext>>({
    product: { placement: "Resume", query: "" },
    operating: { placement: "Resume", query: "" },
  });
  const application = applications.find((item) => item.id === applicationId)!;
  const { placement, query: applicationQuery } = applicationContexts[applicationId];
  function updateApplicationContext(patch: Partial<ApplicationContext>) {
    setApplicationContexts((contexts) => ({ ...contexts, [applicationId]: { ...contexts[applicationId], ...patch } }));
  }
  const [todayStarted, setTodayStarted] = useState(false);
  const [notice, setNotice] = useState("");
  const [catalogItems, setCatalogItems] = useState(initialCatalogItems);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [gateMessages, setGateMessages] = useState<Record<string, string>>({});
  const [returnToApplication, setReturnToApplication] = useState(false);
  const current = activeView(view);
  function openCatalog(fromApplication = false) {
    setReturnToApplication(fromApplication);
    if (fromApplication) setExpandedItems([application.catalogItem]);
    setView("knowledge");
  }

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
              onClick={() => { setView(item.id); setReturnToApplication(false); }}
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

      <section className="main-area" onClick={(event) => {
        const button = (event.target as HTMLElement).closest("button");
        const label = button?.getAttribute("aria-label") ?? button?.textContent?.trim();
        if (label && label !== "New application") setNotice(`Mock action recorded: ${label}`);
      }}>
        <header className="topbar">
          <div>
            <p className="eyebrow">CAREER OPERATING SYSTEM</p>
            <h1>{current.label}</h1>
          </div>
          <div className="top-actions">
            <span className="status"><i /> Evidence synced</span>
            <button className="quiet-button" onClick={() => setNotice("Mock application created")} type="button">New application</button>
          </div>
        </header>

        {notice && <p className="mock-notice" role="status">{notice}</p>}
        <nav className="top-nav" aria-label="Workbench shortcuts">
          {primaryViews.map((item) => (
            <button
              aria-pressed={view === item.id}
              key={item.id}
              onClick={() => { setView(item.id); setReturnToApplication(false); }}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {["today", "sources", "catalog"].includes(view) && <div className="catalog-entry"><button className="quiet-button" type="button" onClick={() => openCatalog()}>Open Catalog Development</button></div>}
        {view === "knowledge" && returnToApplication && <div className="catalog-entry"><button className="quiet-button" type="button" onClick={() => { setView("applications"); setReturnToApplication(false); }}>Return to {application.title} application</button></div>}
        {view === "today" && <TodayView started={todayStarted} onStart={() => setTodayStarted(true)} />}
        {view === "applications" && <ApplicationWorkspace application={application} onSelectApplication={setApplicationId} placement={placement} setPlacement={(value) => updateApplicationContext({ placement: value })} query={applicationQuery} setQuery={(value) => updateApplicationContext({ query: value })} onOpenCatalog={() => openCatalog(true)} />}
        {view === "knowledge" && <CatalogDevelopment items={catalogItems} setItems={setCatalogItems} expanded={expandedItems} setExpanded={setExpandedItems} messages={gateMessages} setMessages={setGateMessages} />}
        {view === "catalog" && <CatalogView />}
        {view === "deliverables" && <DeliverablesView />}
        {(view === "activity" || view === "decisions") && <ActivityView decisionMode={view === "decisions"} />}
        {view === "sources" && <SourcesView />}
      </section>
    </main>
  );
}

function TodayView({ started, onStart }: { started: boolean; onStart: () => void }) {
  return <section className="single-view">
    <p className="eyebrow">PERSONAL WORK QUEUE</p>
    <h2>Today’s priorities</h2>
    <p className="intro">Three focused steps keep the current application moving without losing the broader career record.</p>
    <button className="primary-button" onClick={onStart} type="button">{started ? "Priority in progress" : "Start next priority"}</button>
    <div className="bundle">
      <div className="deliverable"><span className="doc-mark" /><div><strong>Review market-entry evidence</strong><p>Product strategy · 15 minutes · due next</p></div><span className="pill amber">Next</span></div>
      <div className="deliverable"><span className="doc-mark" /><div><strong>Confirm claim scope</strong><p>Product strategy · waiting for your decision</p></div><span className="pill">Queued</span></div>
      <div className="deliverable"><span className="doc-mark" /><div><strong>Read interview brief</strong><p>Operating systems · prepared for Thursday</p></div><span className="pill">Later</span></div>
    </div>
  </section>;
}

function ApplicationWorkspace({
  application,
  onSelectApplication,
  placement,
  setPlacement,
  query,
  setQuery,
  onOpenCatalog,
}: {
  application: typeof applications[number];
  onSelectApplication: (id: ApplicationId) => void;
  placement: Placement;
  setPlacement: (placement: Placement) => void;
  onOpenCatalog: () => void;
  query: string;
  setQuery: (query: string) => void;
}) {
  return <div className="workspace">
    <section className="panel applications-panel">
      <div className="panel-heading"><div><p className="eyebrow">APPLICATION RECORDS</p><h2>Application pipeline</h2></div><button type="button">+ Add</button></div>
      <input aria-label="Search applications" className="application-search" onInput={(event) => setQuery(event.currentTarget.value)} placeholder="Search applications" type="search" value={query} />
      {applications.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())).map((item) => <button key={item.id} aria-label={`Open ${item.title} application`} aria-pressed={application.id === item.id} className={`application ${application.id === item.id ? "active" : ""}`} onClick={() => onSelectApplication(item.id)} type="button"><span className="avatar">{item.initials}</span><span><strong>{item.title}</strong><small>Stage: evidence placement</small></span></button>)}
      <div className="stage-list">
        {applicationStages.map((stage, index) => <div key={stage}><span>{index + 1}</span>{stage}</div>)}
      </div>
      <button className="all-link" type="button">View all applications →</button>
    </section>

    <section className="panel decision-panel">
      <div className="panel-heading"><div><p className="eyebrow">DECISION SPACE</p><h2>{application.title}</h2></div><span className="pill amber">Needs review</span></div>
      <p className="intro">Project the strongest verified signals into each application surface before drafting.</p>
      <article className="decision-card emphasis"><div><span className="card-kicker">NEXT DECISION</span><h3>Review {application.signal} evidence</h3><p>Use the outcome narrative where it supports the reader’s next question.</p></div><button type="button">Review</button></article>
      <article className="decision-card"><div><span className="card-kicker">CONSTRAINT</span><h3>Keep claim scope narrow</h3><p>One proof point per proposition; retain traceability.</p></div><span className="pill">Confirmed</span></article>
      <article className="decision-card"><div><span className="card-kicker">BUNDLE CHECK</span><h3>Three deliverables linked</h3><p>Resume, letter, and interview notes share the same evidence base.</p></div><span className="number">3</span></article>
    </section>

    <section className="panel evidence-panel">
      <div className="panel-heading"><div><p className="eyebrow">EVIDENCE PLACEMENT</p><h2>{application.title}</h2></div><span className="source-count">Synthetic context</span></div>
      <div className="evidence-block"><span className="signal">MOCK SIGNAL</span><h3>{application.detail}</h3><p>{application.readiness}</p></div>
      <button className="quiet-button" type="button" onClick={onOpenCatalog}>Open in Catalog Development</button>
      <p className="placement-label">Project this evidence into</p>
      <div className="choice-row" role="group" aria-label="Evidence placement">
        {placements.map((option) => <button className={placement === option ? "chosen" : ""} key={option} onClick={() => setPlacement(option)} type="button">{option}</button>)}
      </div>
      <div className="projection"><span>Projection</span><strong>{placement}</strong><p>{placement === "Resume" ? "A concise accomplishment with outcome context." : placement === "Cover letter" ? "A narrative bridge between strategy and motivation." : "A story prompt with decision, action, and result."}</p></div>
      <button className="primary-button" type="button">Add to {placement}</button>
    </section>
  </div>;
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

function Deliverable({ name, detail }: { name: string; detail: string }) { return <div className="deliverable"><span className="doc-mark" /> <div><strong>{name}</strong><p>{detail}</p></div><button type="button">Open</button></div>; }
function Timeline({ title, detail }: { title: string; detail: string }) { return <div className="timeline-item"><span /><div><strong>{title}</strong><p>{detail}</p><small>Today · mock activity</small></div></div>; }
