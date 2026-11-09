export type ViewId =
  | "today"
  | "applications"
  | "knowledge"
  | "catalog"
  | "deliverables"
  | "activity"
  | "decisions"
  | "sources";

export const primaryViews: { id: ViewId; label: string; hint: string }[] = [
  { id: "today", label: "Today", hint: "Priority work" },
  { id: "applications", label: "Applications", hint: "Application workspace" },
  { id: "knowledge", label: "Career knowledge", hint: "Reusable evidence" },
  { id: "catalog", label: "Catalog", hint: "Projection builder" },
  { id: "deliverables", label: "Deliverables", hint: "Ready-to-send bundle" },
  { id: "activity", label: "Activity", hint: "Lifecycle timeline" },
  { id: "decisions", label: "Decisions", hint: "Reconciliation queue" },
  { id: "sources", label: "Sources & evidence", hint: "Traceable signals" },
];

export const activeView = (id: ViewId) =>
  primaryViews.find((view) => view.id === id) ?? primaryViews[0];
