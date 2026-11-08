// Bounded synthetic reference model. No persistence, providers or document access.
export const criteria = [
  "objective",
  "responsibility",
  "outcome",
  "significance",
] as const;
export type Criterion = (typeof criteria)[number];
export const stages = [
  "Evidence inbox",
  "Triage",
  "Build support",
  "Ready to reuse",
] as const;
export type Surface = "resume" | "communication" | "interview";
export type Status =
  | "draft"
  | "ready"
  | "submitted"
  | "interviewing"
  | "closed"
  | "withdrawn";
export type Asset = {
  id: string;
  title: string;
  kind: "SourceAsset" | "Seed" | "CatalogAsset" | "Note";
  stage: (typeof stages)[number];
  scope: string;
  revision: number;
  reviewed?: number;
  published?: number;
  disposition: "pending" | "develop" | "discard";
  discardReason?: string;
  objective: string;
  responsibility: string;
  outcome: string;
  significance: string;
  evidence: Record<Criterion, string[]>;
};
export type Projection = {
  id: string;
  assetId: string;
  referenceIds: string[];
  scope: string;
  sourceRevision: number;
  surface: Surface;
  stale: boolean;
};
export type Bundle = {
  revision: number;
  reviewed: boolean;
  stale: boolean;
  context: string;
  blocks: {
    surface: Surface;
    text: string;
    assetId?: string;
    sourceRevision?: number;
    referenceIds: string[];
    unresolved: boolean;
  }[];
  manifest: string[];
  support: string[];
  unsupported: string[];
};
export type MaterialEvent = {
  id: string;
  kind: string;
  date: string;
  detail: string;
};
export type Application = {
  id: string;
  title: string;
  requirements: string;
  status: Status;
  query: string;
  surface: Surface;
  expanded: boolean;
  notes: string[];
  decisions: string[];
  events: MaterialEvent[];
  projections: Projection[];
  unsupported: string;
  revision: number;
  bundle?: Bundle;
  submitted?: Bundle;
  fit: { stale: boolean; reviewedRevision?: number };
  remediation: string;
  selectedAsset: string;
  noteDraft: string;
  action?: {
    kind: Status | "follow-up";
    date: string;
    channel: string;
    detail: string;
    token: string;
  };
};
export type Connected = {
  assets: Asset[];
  applications: Application[];
  nextId: number;
};
export const references = criteria.map((criterion) => ({
  id: `ref-${criterion}`,
  criterion,
  title: `Synthetic ${criterion} reference`,
}));
const evidence = (): Asset["evidence"] => ({
  objective: [],
  responsibility: [],
  outcome: [],
  significance: [],
});
function seed(id: string, title: string, stage: Asset["stage"]): Asset {
  return {
    id,
    title,
    stage,
    kind: "Seed",
    scope: "",
    revision: 1,
    disposition: stage === "Build support" ? "develop" : "pending",
    objective: "",
    responsibility: "",
    outcome: "",
    significance: "",
    evidence: evidence(),
  };
}
function application(
  id: string,
  title: string,
  requirements: string,
  remediation: string
): Application {
  return {
    id,
    title,
    requirements,
    status: "draft",
    query: "",
    surface: "resume",
    expanded: true,
    notes: [],
    decisions: [],
    events: [],
    projections: [],
    unsupported: "",
    revision: 1,
    fit: { stale: true },
    remediation,
    selectedAsset: remediation,
    noteDraft: "",
  };
}
export function createConnected(): Connected {
  const shared = seed(
    "asset-shared",
    "Market entry decision",
    "Ready to reuse"
  );
  Object.assign(shared, {
    kind: "CatalogAsset",
    scope: "Clarified a synthetic launch decision with research",
    disposition: "develop",
    reviewed: 1,
    published: 1,
  });
  for (const c of criteria) {
    shared[c] = `Synthetic ${c} of launch research`;
    shared.evidence[c] = [`ref-${c}`];
  }
  const incomplete = seed(
    "seed-incomplete",
    "Operating cadence",
    "Build support"
  );
  incomplete.scope = "Established a synthetic operating cadence";
  const unrelated = structuredClone(shared);
  Object.assign(unrelated, {
    id: "asset-unrelated",
    title: "Research synthesis",
    scope: "Synthesized synthetic research into a decision brief",
  });
  const discard = seed("discarded", "Duplicate synthetic reminder", "Triage");
  Object.assign(discard, {
    kind: "Note",
    disposition: "discard",
    discardReason: "Reviewed: reminder contains no factual support",
    reviewed: 1,
  });
  const a = application(
    "app-a",
    "Product strategy",
    "Explain launch decisions and research leadership",
    "asset-shared"
  );
  a.unsupported = "Increased revenue by 80% (unconfirmed synthetic claim)";
  const b = application(
    "app-b",
    "Operating systems",
    "Show operating cadence and delivery outcomes",
    "seed-incomplete"
  );
  const state: Connected = {
    assets: [
      seed("intake", "Workshop reflection", "Evidence inbox"),
      seed("seed", "Stakeholder alignment", "Triage"),
      incomplete,
      unrelated,
      shared,
      discard,
    ],
    applications: [a, b],
    nextId: 3,
  };
  state.assets[0].kind = "SourceAsset";
  place(state, a.id, "interview", shared.id);
  place(state, b.id, "resume", shared.id);
  return state;
}
export function getApp(s: Connected, id: string) {
  const a = s.applications.find((a) => a.id === id);
  if (!a) throw Error("Unknown application");
  return a;
}
export function getAsset(s: Connected, id: string) {
  const a = s.assets.find((a) => a.id === id);
  if (!a) throw Error("Selection is not an eligible factual CatalogAsset");
  return a;
}
export function assetGaps(a: Asset): string[] {
  return [
    ...(!a.scope.trim() ? ["Supply claim scope"] : []),
    ...criteria.flatMap((c) =>
      !a[c].trim() ||
      !a.evidence[c].some((id) =>
        references.some((r) => r.id === id && r.criterion === c)
      )
        ? [`Supply ${c} and its evidence reference`]
        : []
    ),
  ];
}
export function eligible(a: Asset) {
  return (
    a.kind === "CatalogAsset" &&
    a.disposition === "develop" &&
    a.published === a.revision &&
    a.reviewed === a.revision &&
    !assetGaps(a).length
  );
}
// One grounding predicate is shared by readiness, remediation and the board.
export function grounded(s: Connected, p: Projection) {
  const asset = getAsset(s, p.assetId);
  return !p.stale && eligible(asset) && asset.revision === p.sourceRevision;
}
export function remediationAsset(s: Connected, a: Application) {
  const stale = a.projections.filter((p) => !grounded(s, p));
  return (
    (stale.find((p) => p.surface === a.surface) || stale[0])?.assetId ||
    (!eligible(getAsset(s, a.selectedAsset)) ? a.selectedAsset : a.remediation)
  );
}
export function missingBundleSurfaces(b: Bundle) {
  return (["resume", "communication"] as const).filter(
    (surface) =>
      !b.blocks.some(
        (block) =>
          block.surface === surface &&
          !block.unresolved &&
          block.assetId &&
          block.referenceIds.length
      )
  );
}
function invalidate(a: Application) {
  a.revision++;
  a.fit.stale = true;
  if (a.bundle) {
    a.bundle.stale = true;
    a.bundle.reviewed = false;
  }
  if (a.status === "ready") a.status = "draft";
}
export function editAsset(
  s: Connected,
  id: string,
  patch: Partial<Pick<Asset, "scope" | Criterion | "evidence">>
) {
  const a = getAsset(s, id);
  Object.assign(a, structuredClone(patch));
  a.revision++;
  a.reviewed = undefined;
  a.published = undefined;
  if (a.stage === "Ready to reuse") a.stage = "Build support";
  for (const app of s.applications)
    if (app.projections.some((p) => p.assetId === id)) {
      for (const p of app.projections) if (p.assetId === id) p.stale = true;
      invalidate(app);
    }
}
export function primeAsset(s: Connected, id: string, scope: string) {
  const a = getAsset(s, id);
  if (a.disposition === "discard")
    throw Error("Reviewed discard is not eligible for development");
  if (!scope.trim())
    throw Error("Supply claim scope and review the four promotion criteria");
  editAsset(s, id, { scope });
  a.disposition = "develop";
  a.stage = "Build support";
}
export function triageAsset(s: Connected, id: string) {
  const a = getAsset(s, id);
  if (a.stage !== "Evidence inbox")
    throw Error("Only inbox material needs triage");
  a.stage = "Triage";
}
export function discardAsset(
  s: Connected,
  id: string,
  reason: string,
  confirmed: boolean
) {
  if (!confirmed || !reason.trim())
    throw Error("Discard requires a reason and explicit human review");
  const a = getAsset(s, id);
  editAsset(s, id, {});
  a.disposition = "discard";
  a.discardReason = reason;
  a.reviewed = a.revision;
  a.stage = "Triage";
}
export function reviewAsset(s: Connected, id: string) {
  const a = getAsset(s, id);
  if (a.disposition !== "develop")
    throw Error("Choose develop disposition before review");
  const gaps = assetGaps(a);
  if (gaps.length) throw Error(gaps.join("; "));
  a.reviewed = a.revision;
}
export function publishAsset(s: Connected, id: string) {
  const a = getAsset(s, id);
  if (assetGaps(a).length)
    throw Error("Promotion criteria incomplete; human review required");
  if (a.reviewed !== a.revision || a.disposition !== "develop")
    throw Error("Human review of current revision required");
  a.published = a.revision;
  a.kind = "CatalogAsset";
  a.stage = "Ready to reuse";
}
export function createApplication(
  s: Connected,
  target: { title: string; requirements: string },
  confirmed: boolean
) {
  if (!confirmed) return;
  if (!target.title.trim() || !target.requirements.trim())
    throw Error(
      "Target title and requirements are required; context is not evidence"
    );
  const a = application(
    `app-${s.nextId++}`,
    target.title.trim(),
    target.requirements.trim(),
    "seed-incomplete"
  );
  a.events.push({
    id: `${a.id}-created`,
    kind: "created",
    date: "2026-02-01",
    detail: "Synthetic Target confirmed",
  });
  s.applications.push(a);
  return a;
}
export function place(
  s: Connected,
  id: string,
  surface: Surface,
  assetId: string
) {
  const a = getApp(s, id),
    asset = getAsset(s, assetId);
  if (!eligible(asset))
    throw Error(
      "Not eligible: only published, current reviewed CatalogAssets are factual sources. Seeds, Notes, Target context and Projections are not evidence."
    );
  if (a.projections.some((p) => p.assetId === assetId && p.surface === surface))
    throw Error("Asset already placed on this application surface");
  a.projections.push({
    id: `projection-${s.nextId++}`,
    assetId,
    surface,
    scope: asset.scope,
    sourceRevision: asset.revision,
    referenceIds: criteria.flatMap((c) => asset.evidence[c]),
    stale: false,
  });
  invalidate(a);
}
export function removeProjection(
  s: Connected,
  id: string,
  projectionId: string
) {
  const a = getApp(s, id);
  a.projections = a.projections.filter((p) => p.id !== projectionId);
  invalidate(a);
}
export function refreshProjection(
  s: Connected,
  id: string,
  projectionId: string
) {
  const a = getApp(s, id),
    p = a.projections.find((p) => p.id === projectionId);
  if (!p) throw Error("Unknown projection");
  const asset = getAsset(s, p.assetId);
  if (!eligible(asset))
    throw Error("Review and publish current source revision first");
  Object.assign(p, {
    scope: asset.scope,
    sourceRevision: asset.revision,
    referenceIds: criteria.flatMap((c) => asset.evidence[c]),
    stale: false,
  });
  invalidate(a);
}
export function resolveClaim(
  s: Connected,
  id: string,
  mode: "exclude" | "supported",
  assetId?: string
) {
  const a = getApp(s, id);
  if (!a.unsupported) return;
  if (mode === "supported") {
    const asset = getAsset(s, assetId || "");
    if (!eligible(asset))
      throw Error("Select eligible support to revise to its factual scope");
    if (
      !a.projections.some(
        (p) => p.assetId === asset.id && p.surface === a.surface
      )
    )
      place(s, id, a.surface, asset.id);
    a.decisions.push(
      `Replaced unsupported claim with supported scope: ${asset.scope}`
    );
  } else a.decisions.push("Excluded unsupported claim from bundle");
  a.unsupported = "";
  invalidate(a);
}
export function assemble(s: Connected, id: string) {
  const a = getApp(s, id);
  const blocks: Bundle["blocks"] = a.projections.map((p) => {
    return {
      surface: p.surface,
      text: p.scope,
      assetId: p.assetId,
      sourceRevision: p.sourceRevision,
      referenceIds: [...p.referenceIds],
      unresolved: !grounded(s, p),
    };
  });
  if (a.unsupported)
    blocks.push({
      surface: "resume",
      text: a.unsupported,
      referenceIds: [],
      unresolved: true,
    });
  // Assembly replaces the reviewable artifact, so prior readiness no longer applies.
  a.fit.stale = true;
  if (a.status === "ready") a.status = "draft";
  a.bundle = {
    revision: a.revision,
    reviewed: false,
    stale: false,
    context: a.requirements,
    blocks,
    manifest: a.projections.map(
      (p) => `${p.id} → ${p.assetId}@${p.sourceRevision} → ${p.surface}`
    ),
    support: [...new Set(a.projections.flatMap((p) => p.referenceIds))],
    unsupported: blocks.filter((b) => b.unresolved).map((b) => b.text),
  };
}
function currentBundle(s: Connected, a: Application) {
  if (!a.bundle || a.bundle.stale || a.bundle.revision !== a.revision)
    throw Error("Assemble a current bundle first");
  if (
    a.unsupported ||
    a.bundle.unsupported.length ||
    a.projections.some((p) => !grounded(s, p))
  )
    throw Error(
      "Resolve unsupported claims and stale sources; review is not evidence"
    );
  const missing = missingBundleSurfaces(a.bundle);
  if (missing.length)
    throw Error(
      `Bundle missing required factual surfaces: ${missing.join(
        ", "
      )}. Place eligible support on each surface and reassemble.`
    );
  return a.bundle;
}
export function reviewBundle(s: Connected, id: string) {
  const a = getApp(s, id),
    b = currentBundle(s, a);
  b.reviewed = true;
  a.fit = { stale: false, reviewedRevision: a.revision };
  if (!a.decisions.includes(`Reviewed bundle revision ${a.revision}`))
    a.decisions.push(`Reviewed bundle revision ${a.revision}`);
}
export function nextAction(a: Application) {
  if (a.status === "closed" || a.status === "withdrawn")
    return "Inspect immutable history";
  if (a.status === "submitted" || a.status === "interviewing")
    return "Record interview, follow-up or outcome";
  if (!a.bundle || a.bundle.stale) return "Assemble current supported bundle";
  if (a.unsupported || a.bundle.unsupported.length)
    return "Resolve unsupported claims";
  const missing = missingBundleSurfaces(a.bundle);
  if (missing.length)
    return `Place eligible support on ${missing.join(
      " and "
    )}, then reassemble`;
  if (!a.bundle.reviewed) return "Review current bundle";
  return a.status === "ready"
    ? "Confirm submission date and channel"
    : "Mark ready";
}
export function transition(
  s: Connected,
  id: string,
  kind: Status | "follow-up",
  input: {
    confirmed?: boolean;
    date?: string;
    channel?: string;
    detail?: string;
    token?: string;
  }
) {
  const a = getApp(s, id);
  if (input.token && a.events.some((e) => e.id === input.token)) return;
  if (kind === "ready" || kind === "submitted") {
    const b = currentBundle(s, a);
    if (!b.reviewed || a.fit.stale)
      throw Error("Current reviewed bundle required");
  }
  const allowed: Record<Status, string[]> = {
    draft: ["ready", "withdrawn"],
    ready: ["submitted", "withdrawn"],
    submitted: ["interviewing", "follow-up", "closed", "withdrawn"],
    interviewing: ["follow-up", "closed", "withdrawn"],
    closed: [],
    withdrawn: [],
  };
  if (!allowed[a.status].includes(kind))
    throw Error(`Cannot ${kind} from ${a.status}`);
  if (kind !== "ready") {
    if (
      !input.date ||
      !/^\d{4}-\d{2}-\d{2}$/.test(input.date) ||
      !Number.isFinite(Date.parse(input.date)) ||
      new Date(input.date).toISOString().slice(0, 10) !== input.date
    )
      throw Error("A valid action date is required");
    if (kind === "submitted" && !input.channel?.trim())
      throw Error("Submission channel is required");
    if (kind !== "submitted" && !input.detail?.trim())
      throw Error("Action detail is required");
  }
  if (!input.confirmed || !input.token)
    throw Error("Explicit confirmation is required");
  if (kind !== "follow-up") a.status = kind;
  if (kind === "submitted") a.submitted = structuredClone(a.bundle);
  a.events.push({
    id: input.token,
    kind,
    date: input.date || "2026-02-01",
    detail: input.channel || input.detail || "Current bundle ready",
  });
}
