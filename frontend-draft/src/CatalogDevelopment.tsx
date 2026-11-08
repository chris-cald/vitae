import { useLayoutEffect, useRef, useState } from "react";
import {
  criteria,
  stages,
  references,
  assetGaps,
  eligible,
  grounded,
  triageAsset,
  primeAsset,
  editAsset,
  discardAsset,
  reviewAsset,
  publishAsset,
  type Connected,
  type Asset,
  type Criterion,
} from "./connected";

type AssetDraft = Pick<Asset, "scope" | Criterion | "evidence">;
function editable(a: Asset): AssetDraft {
  return {
    scope: a.scope,
    objective: a.objective,
    responsibility: a.responsibility,
    outcome: a.outcome,
    significance: a.significance,
    evidence: a.evidence,
  };
}

export function CatalogDevelopment({
  state,
  run,
  expanded,
  setExpanded,
}: {
  state: Connected;
  run: (action: (s: Connected) => void) => void;
  expanded: string[];
  setExpanded: (ids: string[]) => void;
}) {
  const [discardReasons, setDiscardReasons] = useState<Record<string, string>>(
    {}
  );
  const [drafts, setDrafts] = useState<Record<string, AssetDraft>>({});
  const focusAfterCommit = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (focusAfterCommit.current) {
      document.getElementById(focusAfterCommit.current)?.focus();
      focusAfterCommit.current = null;
    }
  }, [state.assets, drafts]);
  function requireSaved(dirty: boolean, action: (s: Connected) => void) {
    run((s) => {
      if (dirty) throw Error("Save or cancel unsaved edits before this action");
      action(s);
    });
  }
  function clearDraft(id: string) {
    setDrafts((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }
  return (
    <section
      className="catalog-development"
      aria-label="Catalog Development board"
    >
      <p className="eyebrow">CAREER KNOWLEDGE · SYNTHETIC EVIDENCE LIBRARY</p>
      <h2>Catalog Development</h2>
      <p className="intro">
        Work readiness, not entity types: choose disposition, build
        corroborating support, review validation, approve publication. Factual
        CatalogAssets and derived wording Projections remain distinct.
      </p>
      <div className="catalog-board">
        {stages.map((stage) => (
          <section className="catalog-column" aria-label={stage} key={stage}>
            <h3>{stage}</h3>
            {state.assets
              .filter((a) => a.stage === stage)
              .map((a) => {
                const open = expanded.includes(a.id),
                  gaps = assetGaps(a);
                const draft = drafts[a.id] || editable(a);
                const dirty =
                  JSON.stringify(draft) !== JSON.stringify(editable(a));
                return (
                  <article
                    className="catalog-card"
                    data-catalog-item={a.id}
                    key={a.id}
                  >
                    <h4>{a.title}</h4>
                    <p>
                      State: {stage} · Kind: {a.kind} · Revision {a.revision}
                    </p>
                    <button
                      aria-expanded={open}
                      aria-controls={`details-${a.id}`}
                      onClick={() =>
                        setExpanded(
                          open
                            ? expanded.filter((id) => id !== a.id)
                            : [...expanded, a.id]
                        )
                      }
                    >
                      {open ? "Collapse" : "Expand"} {a.title}
                    </button>
                    {open && (
                      <div id={`details-${a.id}`}>
                        <dl>
                          <dt>Source metadata</dt>
                          <dd>
                            {a.id} · Synthetic local fixture; no documents
                          </dd>
                          <dt>Supporting evidence</dt>
                          <dd>
                            {criteria
                              .flatMap((c) => a.evidence[c])
                              .join(", ") || "No supporting references yet"}
                          </dd>
                          <dt>Unresolved gaps</dt>
                          <dd>{gaps.join("; ") || "None recorded"}</dd>
                          <dt>Related target</dt>
                          <dd>
                            {state.applications
                              .filter(
                                (app) =>
                                  app.remediation === a.id ||
                                  app.projections.some(
                                    (p) => p.assetId === a.id
                                  )
                              )
                              .map((app) => app.title)
                              .join(", ") || "Reusable career support"}
                          </dd>
                          <dt>Next action</dt>
                          <dd>
                            {a.disposition === "discard"
                              ? "Reviewed discard retained for audit"
                              : eligible(a)
                              ? "Reuse in application evidence placement"
                              : gaps.join("; ") ||
                                "Review current revision, then approve publication"}
                          </dd>
                        </dl>
                        {a.disposition === "discard" ? (
                          <p>
                            Reviewed discard: {a.discardReason}. Not eligible
                            factual evidence.
                          </p>
                        ) : (
                          <>
                            <p>
                              Edits are local until Save revision. Cancel or
                              leaving Catalog discards unsaved edits.
                            </p>
                            {dirty && (
                              <p role="status">
                                Unsaved edits — current published revision is
                                unchanged. Save or cancel before
                                review/publication.
                              </p>
                            )}
                            <button
                              id={`save-revision-${a.id}`}
                              onClick={() => {
                                if (dirty) {
                                  focusAfterCommit.current = `save-revision-${a.id}`;
                                  run((s) => editAsset(s, a.id, draft));
                                }
                                clearDraft(a.id);
                              }}
                            >
                              Save revision
                            </button>
                            <button onClick={() => clearDraft(a.id)}>
                              Cancel edits
                            </button>
                            <label>
                              Claim scope
                              <input
                                aria-label={`Claim scope ${a.id}`}
                                value={draft.scope}
                                onInput={(e) =>
                                  setDrafts({
                                    ...drafts,
                                    [a.id]: {
                                      ...draft,
                                      scope: e.currentTarget.value,
                                    },
                                  })
                                }
                              />
                            </label>
                            <p>
                              Promotion criteria: objective, responsibility,
                              outcome and significance; each needs its own
                              corroborating reference. Human review attests that
                              references support this scope.
                            </p>
                            {stage === "Evidence inbox" && (
                              <button
                                onClick={() =>
                                  requireSaved(dirty, (s) =>
                                    triageAsset(s, a.id)
                                  )
                                }
                              >
                                Move to Triage
                              </button>
                            )}
                            {stage === "Triage" && (
                              <button
                                onClick={() =>
                                  requireSaved(dirty, (s) =>
                                    primeAsset(s, a.id, a.scope)
                                  )
                                }
                              >
                                Develop scoped claim
                              </button>
                            )}
                            {(stage === "Build support" ||
                              stage === "Ready to reuse") && (
                              <>
                                {criteria.map((c) => (
                                  <fieldset key={c}>
                                    <legend>{c}</legend>
                                    <label>
                                      Episode {c}
                                      <input
                                        aria-label={`${c} ${a.id}`}
                                        value={draft[c]}
                                        onInput={(e) =>
                                          setDrafts({
                                            ...drafts,
                                            [a.id]: {
                                              ...draft,
                                              [c]: e.currentTarget.value,
                                            },
                                          })
                                        }
                                      />
                                    </label>
                                    <label>
                                      Corroborating reference
                                      <select
                                        aria-label={`${c} evidence ${a.id}`}
                                        value={draft.evidence[c][0] || ""}
                                        onChange={(e) => {
                                          const value = e.currentTarget.value;
                                          setDrafts({
                                            ...drafts,
                                            [a.id]: {
                                              ...draft,
                                              evidence: {
                                                ...draft.evidence,
                                                [c]: value ? [value] : [],
                                              },
                                            },
                                          });
                                        }}
                                      >
                                        <option value="">
                                          No supporting reference
                                        </option>
                                        {references
                                          .filter((r) => r.criterion === c)
                                          .map((r) => (
                                            <option value={r.id} key={r.id}>
                                              {r.title}
                                            </option>
                                          ))}
                                      </select>
                                    </label>
                                  </fieldset>
                                ))}
                                <p>
                                  Human review:{" "}
                                  {a.reviewed === a.revision
                                    ? "Confirmed for current revision"
                                    : "Required for current revision"}
                                  . Publication:{" "}
                                  {eligible(a)
                                    ? "Approved factual CatalogAsset"
                                    : "Not eligible"}
                                  .
                                </p>
                                <button
                                  onClick={() =>
                                    requireSaved(dirty, (s) =>
                                      reviewAsset(s, a.id)
                                    )
                                  }
                                >
                                  Review current revision
                                </button>
                                <button
                                  onClick={() =>
                                    requireSaved(dirty, (s) =>
                                      publishAsset(s, a.id)
                                    )
                                  }
                                >
                                  Publish CatalogAsset
                                </button>
                              </>
                            )}
                            <details>
                              <summary>Discard / cull</summary>
                              <label>
                                Reason
                                <input
                                  aria-label={`Discard reason ${a.id}`}
                                  value={discardReasons[a.id] || ""}
                                  onInput={(e) =>
                                    setDiscardReasons({
                                      ...discardReasons,
                                      [a.id]: e.currentTarget.value,
                                    })
                                  }
                                />
                              </label>
                              <button
                                onClick={() =>
                                  requireSaved(dirty, (s) =>
                                    discardAsset(
                                      s,
                                      a.id,
                                      discardReasons[a.id] || "",
                                      true
                                    )
                                  )
                                }
                              >
                                Confirm reviewed discard
                              </button>
                            </details>
                          </>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            {state.applications.flatMap((app) =>
              app.projections
                .filter(
                  (p) =>
                    stage ===
                    (grounded(state, p) ? "Ready to reuse" : "Build support")
                )
                .map((p) => (
                  <article className="catalog-card" key={p.id}>
                    <h4>Projection · {app.title}</h4>
                    <p>Derived wording, never factual evidence · {p.surface}</p>
                    <p>{p.scope}</p>
                    <p>
                      {p.assetId}@{p.sourceRevision} ·{" "}
                      {!grounded(state, p)
                        ? "Stale — refresh from reviewed source"
                        : "Grounded wording"}
                    </p>
                  </article>
                ))
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
