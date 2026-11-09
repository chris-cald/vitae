import { useState } from "react";
import { CatalogDevelopment } from "./CatalogDevelopment";
import { activeView, primaryViews, type ViewId } from "./workbench";
import {
  createConnected,
  createApplication,
  getApp,
  eligible,
  place,
  assemble,
  reviewBundle,
  transition,
  resolveClaim,
  refreshProjection,
  removeProjection,
  nextAction,
  references,
  criteria,
  assetGaps,
  grounded,
  remediationAsset,
  missingBundleSurfaces,
  type Connected,
  type Application,
  type Surface,
  type Status,
  type Bundle,
} from "./connected";

const surfaces: { label: string; id: Surface }[] = [
  { label: "Resume", id: "resume" },
  { label: "Cover letter", id: "communication" },
  { label: "Interview", id: "interview" },
];
export default function App() {
  const [state, setState] = useState(createConnected),
    [view, setView] = useState<ViewId>("today"),
    [appId, setAppId] = useState("app-a");
  const [expanded, setExpanded] = useState<string[]>([]),
    [returnTo, setReturnTo] = useState<string>(),
    [error, setError] = useState("");
  const [creating, setCreating] = useState(false),
    [target, setTarget] = useState({ title: "", requirements: "" });
  const app = getApp(state, appId);
  function run(action: (s: Connected) => void) {
    const draft = structuredClone(state);
    try {
      action(draft);
      setState(draft);
      setError("");
    } catch (e) {
      setError(`Blocked: ${e instanceof Error ? e.message : "Invalid action"}`);
    }
  }
  function update(patch: Partial<Application>) {
    run((s) => Object.assign(getApp(s, appId), patch));
  }
  function navigate(id: ViewId) {
    setView(id);
    setReturnTo(undefined);
    setError("");
  }
  function catalog(id?: string, returning = true) {
    setExpanded(id ? [id] : returning ? [remediationAsset(state, app)] : []);
    setReturnTo(returning ? appId : undefined);
    setView("knowledge");
    setError("");
  }
  function begin(kind: Status | "follow-up") {
    update({
      action: {
        kind,
        date: "",
        channel: "",
        detail: "",
        token: `${app.id}-${kind}-${state.nextId}`,
      },
    });
  }
  function startCreation() {
    setTarget({ title: "", requirements: "" });
    setCreating(true);
    setError("");
  }
  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span>V</span> vitae
        </div>
        <p className="sidebar-label">WORKBENCH</p>
        <nav aria-label="Primary workbench views">
          {primaryViews.map((item) => (
            <button
              className={`nav-item ${view === item.id ? "selected" : ""}`}
              aria-current={view === item.id ? "page" : undefined}
              key={item.id}
              onClick={() => navigate(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <strong>Mock workspace</strong>
          <span>Synthetic · in memory · no API calls</span>
        </div>
      </aside>
      <section className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">CAREER OPERATING SYSTEM</p>
            <h1>{activeView(view).label}</h1>
          </div>
          <div className="top-actions">
            <span className="status">Synthetic session only</span>
            <button className="quiet-button" onClick={startCreation}>
              New application
            </button>
          </div>
        </header>
        {error && (
          <p className="mock-notice" role="alert">
            {error}
          </p>
        )}
        {creating && (
          <section className="single-view" aria-label="Create synthetic Target">
            <h2>Create synthetic Target</h2>
            <p>
              Use invented context only. Target requirements are not factual
              evidence.
            </p>
            <label>
              Target title
              <input
                aria-label="Target title"
                value={target.title}
                onInput={(e) =>
                  setTarget({ ...target, title: e.currentTarget.value })
                }
              />
            </label>
            <label>
              Target requirements
              <textarea
                aria-label="Target requirements"
                value={target.requirements}
                onInput={(e) =>
                  setTarget({ ...target, requirements: e.currentTarget.value })
                }
              />
            </label>
            <button
              onClick={() =>
                run((s) => {
                  const created = createApplication(s, target, true)!;
                  setAppId(created.id);
                  setCreating(false);
                  setView("applications");
                })
              }
            >
              Confirm creation
            </button>
            <button
              onClick={() => {
                setCreating(false);
                setError("");
              }}
            >
              Cancel creation
            </button>
          </section>
        )}
        {["today", "sources", "catalog"].includes(view) && (
          <div className="catalog-entry">
            <button onClick={() => catalog(undefined, false)}>
              Open Catalog Development
            </button>
          </div>
        )}
        {view === "knowledge" && (
          <>
            {returnTo && (
              <button
                className="quiet-button"
                onClick={() => {
                  setAppId(returnTo);
                  setReturnTo(undefined);
                  setView("applications");
                  setError("");
                }}
              >
                Return to {getApp(state, returnTo).title} application
              </button>
            )}
            <CatalogDevelopment
              state={state}
              run={run}
              expanded={expanded}
              setExpanded={setExpanded}
            />
          </>
        )}
        {view === "today" && (
          <section className="single-view">
            <h2>Today’s priorities</h2>
            <p className="intro">
              Live work queue from this synthetic session.
            </p>
            {state.applications.map((a) => (
              <article className="decision-card" key={a.id}>
                <div>
                  <h3>{a.title}</h3>
                  <p>
                    {a.status} · {nextAction(a)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAppId(a.id);
                    navigate("applications");
                  }}
                >
                  Work on {a.title}
                </button>
              </article>
            ))}
            <button onClick={() => navigate("applications")}>
              Start next priority
            </button>
          </section>
        )}
        {(view === "applications" || view === "catalog") && (
          <div className="workspace">
            <section className="panel applications-panel">
              <div className="panel-heading">
                <h2>Application pipeline</h2>
                <button onClick={startCreation}>+ Add</button>
              </div>
              <label>
                Search applications
                <input
                  type="search"
                  aria-label="Search applications"
                  value={app.query}
                  onInput={(e) => update({ query: e.currentTarget.value })}
                />
              </label>
              {state.applications
                .filter((a) =>
                  a.title.toLowerCase().includes(app.query.toLowerCase())
                )
                .map((a) => (
                  <article data-application={a.id} key={a.id}>
                    <button
                      className={`application ${
                        appId === a.id ? "active" : ""
                      }`}
                      aria-label={`Open ${a.title} application`}
                      aria-expanded={appId === a.id && a.expanded}
                      aria-controls={`application-${a.id}`}
                      onClick={() => {
                        setAppId(a.id);
                        run((s) => {
                          getApp(s, a.id).expanded = true;
                        });
                      }}
                    >
                      <span>{a.title}</span>
                      <small>{a.status}</small>
                    </button>
                  </article>
                ))}
              <button onClick={() => update({ query: "" })}>
                View all applications →
              </button>
            </section>
            <section
              className="panel decision-panel"
              id={`application-${app.id}`}
            >
              <h2>{app.title}</h2>
              <button onClick={() => update({ expanded: !app.expanded })}>
                {app.expanded ? "Collapse" : "Expand"} application details
              </button>
              {app.expanded && (
                <>
                  <p>Canonical status: {app.status}</p>
                  <p>Working step: {nextAction(app)}</p>
                  <h3>Target requirements</h3>
                  <p>{app.requirements}</p>
                  <p>Target/JD context only — never factual evidence.</p>
                  <h3>Supporting assets</h3>
                  <ul>
                    {app.projections.map((p) => (
                      <li key={p.id}>
                        {p.assetId}@{p.sourceRevision} · {p.surface} ·{" "}
                        {p.stale ? "Stale" : "Grounded"}
                        <p>{p.scope}</p>
                        <small>{p.referenceIds.join(", ")}</small>
                        {p.stale && (
                          <button onClick={() => catalog(p.assetId)}>
                            Remediate {p.assetId} on {p.surface}
                          </button>
                        )}
                        <button
                          onClick={() =>
                            run((s) => refreshProjection(s, app.id, p.id))
                          }
                        >
                          Review and refresh {p.surface} projection
                        </button>
                        <button
                          onClick={() =>
                            run((s) => removeProjection(s, app.id, p.id))
                          }
                        >
                          Remove {p.surface} projection
                        </button>
                      </li>
                    ))}
                  </ul>
                  <h3>Gaps</h3>
                  <p>
                    {app.unsupported ||
                      (!app.projections.length
                        ? "No factual support placed"
                        : "Check source revisions and bundle review")}
                  </p>
                  <button onClick={() => catalog()}>
                    Remediate support gap
                  </button>
                  {app.unsupported && (
                    <>
                      <button
                        onClick={() =>
                          run((s) => resolveClaim(s, app.id, "exclude"))
                        }
                      >
                        Exclude unsupported claim
                      </button>
                      <button
                        onClick={() =>
                          run((s) =>
                            resolveClaim(
                              s,
                              app.id,
                              "supported",
                              app.selectedAsset
                            )
                          )
                        }
                      >
                        Replace with selected supported scope
                      </button>
                    </>
                  )}
                  <label>
                    Notes reference
                    <input
                      aria-label="Application notes"
                      value={app.noteDraft}
                      onInput={(e) =>
                        update({ noteDraft: e.currentTarget.value })
                      }
                    />
                  </label>
                  <button
                    onClick={() =>
                      run((s) => {
                        const a = getApp(s, app.id);
                        if (!a.noteDraft.trim())
                          throw Error("Supply a synthetic note reference");
                        if (!a.notes.includes(a.noteDraft.trim()))
                          a.notes.push(a.noteDraft.trim());
                        a.noteDraft = "";
                      })
                    }
                  >
                    Save note reference
                  </button>
                  <p>Notes (not evidence): {app.notes.join(", ") || "None"}</p>
                  <h3>Bundle</h3>
                  <p>
                    Fit review:{" "}
                    {app.fit.stale ? "Stale / not reviewed" : "Current"} · Next
                    action: {nextAction(app)}
                  </p>
                  <button onClick={() => run((s) => assemble(s, app.id))}>
                    Assemble bundle
                  </button>
                  <button onClick={() => run((s) => reviewBundle(s, app.id))}>
                    Review bundle
                  </button>
                  {app.bundle && <BundleDetails bundle={app.bundle} />}{" "}
                  {app.submitted && (
                    <details>
                      <summary>Immutable submitted snapshot</summary>
                      <BundleDetails bundle={app.submitted} />
                    </details>
                  )}
                  <div className="actions">
                    <button onClick={() => begin("ready")}>Mark ready</button>
                    <button onClick={() => begin("submitted")}>Submit</button>
                    <button onClick={() => begin("interviewing")}>
                      Record interview
                    </button>
                    <button onClick={() => begin("follow-up")}>
                      Record follow-up
                    </button>
                    <button onClick={() => begin("closed")}>
                      Record outcome
                    </button>
                    <button onClick={() => begin("withdrawn")}>Withdraw</button>
                  </div>
                  {app.action && (
                    <fieldset>
                      <legend>Confirm {app.action.kind}</legend>
                      <p>
                        Only confirmation records a material event. Missing
                        information blocks transition.
                      </p>
                      {app.action.kind !== "ready" && (
                        <>
                          <label>
                            Action date
                            <input
                              type="date"
                              aria-label="Action date"
                              value={app.action.date}
                              onInput={(e) =>
                                update({
                                  action: {
                                    ...app.action!,
                                    date: e.currentTarget.value,
                                  },
                                })
                              }
                            />
                          </label>
                          {app.action.kind === "submitted" ? (
                            <label>
                              Submission channel
                              <input
                                aria-label="Submission channel"
                                value={app.action.channel}
                                onInput={(e) =>
                                  update({
                                    action: {
                                      ...app.action!,
                                      channel: e.currentTarget.value,
                                    },
                                  })
                                }
                              />
                            </label>
                          ) : (
                            <label>
                              Action detail
                              <input
                                aria-label="Action detail"
                                value={app.action.detail}
                                onInput={(e) =>
                                  update({
                                    action: {
                                      ...app.action!,
                                      detail: e.currentTarget.value,
                                    },
                                  })
                                }
                              />
                            </label>
                          )}
                        </>
                      )}
                      <button
                        onClick={() =>
                          run((s) => {
                            transition(s, app.id, app.action!.kind, {
                              ...app.action!,
                              confirmed: true,
                            });
                            getApp(s, app.id).action = undefined;
                            s.nextId++;
                          })
                        }
                      >
                        Confirm {app.action.kind}
                      </button>
                      <button onClick={() => update({ action: undefined })}>
                        Cancel action
                      </button>
                    </fieldset>
                  )}
                  <h3>Decisions</h3>
                  <ul>
                    {app.decisions.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                  <h3>Material events</h3>
                  <Events application={app} />
                </>
              )}
            </section>
            <section className="panel evidence-panel">
              <p className="eyebrow">EVIDENCE PLACEMENT</p>
              <h2>{app.title}</h2>
              <p className="intro">
                Eligible factual CatalogAssets only. Projections are derived
                wording, never evidence.
              </p>
              <button onClick={() => catalog()}>
                Open in Catalog Development
              </button>
              <div
                className="choice-row"
                role="group"
                aria-label="Evidence placement"
              >
                {surfaces.map((surface) => (
                  <button
                    key={surface.id}
                    className={app.surface === surface.id ? "chosen" : ""}
                    aria-pressed={app.surface === surface.id}
                    onClick={() => update({ surface: surface.id })}
                  >
                    {surface.label}
                  </button>
                ))}
              </div>
              <label>
                Select factual asset
                <select
                  aria-label="Select factual asset"
                  value={app.selectedAsset}
                  onChange={(e) =>
                    update({ selectedAsset: e.currentTarget.value })
                  }
                >
                  {state.assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title} · {eligible(a) ? "Eligible" : "Not eligible"}
                    </option>
                  ))}
                </select>
              </label>
              <div className="projection">
                <span>Projection draft</span>
                <strong>
                  {surfaces.find((p) => p.id === app.surface)!.label}
                </strong>
                <p>
                  {state.assets.find((a) => a.id === app.selectedAsset)
                    ?.scope || "No supported claim scope"}
                </p>
              </div>
              <button
                className="primary-button"
                onClick={() =>
                  run((s) => place(s, app.id, app.surface, app.selectedAsset))
                }
              >
                Add to {surfaces.find((p) => p.id === app.surface)!.label}
              </button>
            </section>
          </div>
        )}
        {view === "sources" && (
          <section className="single-view">
            <h2>Traceable signal ledger</h2>
            <p>
              All references are synthetic metadata. Notes and Target context
              are ineligible factual sources.
            </p>
            {references.map((r) => (
              <article
                className="list-card"
                id={`reference-${r.id}`}
                key={r.id}
              >
                <strong>{r.title}</strong>
                <span>
                  {r.id} · supports {r.criterion}
                </span>
              </article>
            ))}
            {state.assets.map((a) => {
              const placements = state.applications.flatMap((application) =>
                application.projections
                  .filter((p) => p.assetId === a.id)
                  .map((projection) => ({ application, projection }))
              );
              return (
                <article
                  className="catalog-card"
                  aria-label={`${a.title} source links`}
                  key={a.id}
                >
                  <h3>{a.title}</h3>
                  <p>
                    {a.kind} · {eligible(a) ? "Eligible" : "Not eligible"} ·
                    revision {a.revision}
                  </p>
                  <p>Claim scope: {a.scope || "No claim scope supplied"}</p>
                  {!eligible(a) && (
                    <p>
                      {a.disposition === "discard"
                        ? `Reviewed discard — not factual evidence: ${a.discardReason}`
                        : assetGaps(a).join("; ") ||
                          "Current human review and publication required"}
                    </p>
                  )}
                  <h4>Current criterion/reference associations</h4>
                  {criteria.map((criterion) => (
                    <section
                      aria-label={`${criterion} support`}
                      key={criterion}
                    >
                      <h4>{criterion}</h4>
                      <p>{a[criterion] || "No criterion statement supplied"}</p>
                      {a.evidence[criterion].length ? (
                        <ul>
                          {a.evidence[criterion].map((id) => {
                            const reference = references.find(
                              (r) => r.id === id && r.criterion === criterion
                            );
                            return (
                              <li key={id}>
                                {reference ? (
                                  <a href={`#reference-${reference.id}`}>
                                    {reference.id} · {reference.title}
                                  </a>
                                ) : (
                                  `${id} — unsupported reference for ${criterion}`
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p>No supporting reference</p>
                      )}
                    </section>
                  ))}
                  <h4>Current application placements</h4>
                  {placements.length ? (
                    <ul aria-label="Current application placements">
                      {placements.map(({ application, projection }) => {
                        const surface = surfaces.find(
                          (item) => item.id === projection.surface
                        )!.label;
                        return (
                          <li key={projection.id}>
                            <p>
                              {application.title} · {surface} ·{" "}
                              {grounded(state, projection)
                                ? "Grounded"
                                : "Stale — source review/publication and projection refresh required"}
                            </p>
                            <p>
                              Placed source: {projection.assetId}@
                              {projection.sourceRevision}
                            </p>
                            <p>
                              Placed reference snapshot:{" "}
                              {projection.referenceIds.join(", ")}
                            </p>
                            <button
                              onClick={() => {
                                setAppId(application.id);
                                run((s) =>
                                  Object.assign(getApp(s, application.id), {
                                    surface: projection.surface,
                                    selectedAsset: a.id,
                                    expanded: true,
                                  })
                                );
                                navigate("applications");
                              }}
                            >
                              Open {application.title} {surface} placement
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p>No application placements</p>
                  )}
                  <button onClick={() => catalog(a.id, false)}>
                    Inspect {a.title}
                  </button>
                </article>
              );
            })}
          </section>
        )}
        {view === "deliverables" && (
          <section className="single-view">
            <h2>Application bundles</h2>
            {state.applications.map((a) => (
              <article key={a.id}>
                <h3>{a.title}</h3>
                {a.bundle ? (
                  <BundleDetails bundle={a.bundle} />
                ) : (
                  <p>No bundle assembled</p>
                )}
                <p>{nextAction(a)}</p>
                {a.submitted && (
                  <details>
                    <summary>Submitted snapshot · {a.title}</summary>
                    <BundleDetails bundle={a.submitted} />
                  </details>
                )}
                <button
                  onClick={() => {
                    setAppId(a.id);
                    navigate("applications");
                  }}
                >
                  Open {a.title} bundle workspace
                </button>
              </article>
            ))}
          </section>
        )}
        {view === "decisions" && (
          <section className="single-view">
            <h2>Evidence decisions</h2>
            {state.applications.map((a) => (
              <article key={a.id}>
                <h3>{a.title}</h3>
                <p>
                  {a.unsupported || "No unresolved synthetic claim"} ·{" "}
                  {nextAction(a)}
                </p>
                <ul>
                  {a.decisions.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    setAppId(a.id);
                    navigate("applications");
                  }}
                >
                  Resolve {a.title}
                </button>
              </article>
            ))}
          </section>
        )}
        {view === "activity" && (
          <section className="single-view">
            <h2>Application lifecycle</h2>
            {state.applications.map((a) => (
              <article key={a.id}>
                <h3>
                  {a.title} · {a.status}
                </h3>
                <Events application={a} />
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
function Events({ application }: { application: Application }) {
  return application.events.length ? (
    <ol>
      {application.events.map((e) => (
        <li key={e.id}>
          {e.date} · {e.kind} · {e.detail}
        </li>
      ))}
    </ol>
  ) : (
    <p>No confirmed material events.</p>
  );
}
function BundleDetails({ bundle: b }: { bundle: Bundle }) {
  return (
    <div className="bundle">
      <p>
        Revision {b.revision} ·{" "}
        {b.stale ? "Stale" : b.reviewed ? "Reviewed" : "Needs review"}
      </p>
      <h4>JD-context summary (targeting only)</h4>
      <p>{b.context}</p>
      {surfaces.map((surface) => (
        <section key={surface.id}>
          <h4>{surface.label} blocks</h4>
          {b.blocks
            .filter((block) => block.surface === surface.id)
            .map((block, i) => (
              <div className="projection" key={i}>
                <p>{block.text}</p>
                <p>
                  {block.unresolved
                    ? "UNRESOLVED CONFIRMATION — not evidence"
                    : `Eligible provenance: ${block.assetId}@${block.sourceRevision}`}
                </p>
                <small>{block.referenceIds.join(", ")}</small>
              </div>
            ))}
          {!b.blocks.some((block) => block.surface === surface.id) && (
            <p>
              No factual block placed.{" "}
              {surface.id !== "interview" &&
                "Required: choose this surface, add eligible support, then reassemble."}
            </p>
          )}
        </section>
      ))}
      {missingBundleSurfaces(b).length > 0 && (
        <p>
          Missing required factual surfaces:{" "}
          {missingBundleSurfaces(b).join(", ")}. Review and readiness are
          blocked.
        </p>
      )}
      <h4>Manifest</h4>
      <ul>
        {b.manifest.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
      <h4>Source/support summary</h4>
      <p>{b.support.join(", ") || "No factual support"}</p>
      <h4>Unsupported claims</h4>
      <p>{b.unsupported.join("; ") || "None"}</p>
    </div>
  );
}
