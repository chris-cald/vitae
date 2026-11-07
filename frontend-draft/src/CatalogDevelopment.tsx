export const catalogStages = ["Consider", "Seeds", "Evidence & gaps", "Episodes", "Catalog assets"] as const;
type Stage = typeof catalogStages[number];
export type CatalogItem = {
  id: string;
  title: string;
  stage: Stage;
  source: string;
  evidence: string[];
  gaps: string[];
  target: string;
  reviewed: boolean;
};

// Synthetic identifiers and metadata only; never load documents or remote records.
export const initialCatalogItems: CatalogItem[] = [
  { id: "intake", title: "Workshop reflection", stage: "Consider", source: "SYN-001 · Synthetic reflection · local fixture", evidence: [], gaps: [], target: "Facilitation", reviewed: false },
  { id: "seed", title: "Stakeholder alignment", stage: "Seeds", source: "SYN-002 · Synthetic project index · local fixture", evidence: ["EV-002 · Supporting reference · scope unreviewed"], gaps: [], target: "Product leadership", reviewed: false },
  { id: "gaps", title: "Operating cadence", stage: "Evidence & gaps", source: "SYN-003 · Synthetic activity index · local fixture", evidence: [], gaps: ["Add an outcome evidence reference"], target: "Operating systems", reviewed: false },
  { id: "episode", title: "Research synthesis", stage: "Episodes", source: "SYN-004 · Synthetic research index · local fixture", evidence: ["EV-004 · Outcome reference · mock verified"], gaps: [], target: "Product strategy", reviewed: false },
  { id: "market-entry", title: "Market entry decision", stage: "Catalog assets", source: "SYN-005 · Synthetic launch index · local fixture", evidence: ["EV-005 · Launch decision reference · mock verified"], gaps: [], target: "Product strategy", reviewed: true },
];

function requirements(item: CatalogItem): string[] {
  if (item.stage === "Catalog assets") return [];
  return [
    ...item.gaps,
    ...(["Evidence & gaps", "Episodes"].includes(item.stage) && !item.evidence.length && !item.gaps.length ? ["Add an outcome evidence reference"] : []),
    ...(!item.reviewed ? ["Confirm human review of provenance and claim scope"] : []),
  ];
}

export function CatalogDevelopment({ items, setItems, expanded, setExpanded, messages, setMessages }: {
  items: CatalogItem[];
  setItems: (items: CatalogItem[]) => void;
  expanded: string[];
  setExpanded: (ids: string[]) => void;
  messages: Record<string, string>;
  setMessages: (messages: Record<string, string>) => void;
}) {
  function advance(item: CatalogItem) {
    const missing = requirements(item);
    if (missing.length) {
      setMessages({ ...messages, [item.id]: `Blocked: ${missing.join("; ")}.` });
      return;
    }
    const next = catalogStages[catalogStages.indexOf(item.stage) + 1];
    if (!next) return;
    setItems(items.map((entry) => entry.id === item.id ? { ...entry, stage: next, reviewed: false } : entry));
    setMessages({ ...messages, [item.id]: `Advanced to ${next} · mock only.` });
  }
  return <section className="catalog-development" aria-label="Catalog Development board">
    <p className="eyebrow">CAREER KNOWLEDGE · EVIDENCE LIBRARY</p>
    <h2>Catalog Development</h2>
    <p className="intro">Consider incoming material, develop Seeds, resolve evidence and gaps, formalize Episodes, and curate reusable Catalog assets.</p>
    <p className="intro">Synthetic metadata only. Changes last for this session; no documents are displayed, saved, or sent.</p>
    <div className="catalog-board">
      {catalogStages.map((stage) => <section className="catalog-column" aria-label={stage} key={stage}>
        <h3>{stage} <span className="pill">{items.filter((item) => item.stage === stage).length}</span></h3>
        {items.filter((item) => item.stage === stage).map((item) => {
          const open = expanded.includes(item.id);
          const next = catalogStages[catalogStages.indexOf(stage) + 1];
          const missing = requirements(item);
          return <article className="catalog-card" data-catalog-item={item.id} key={item.id}>
            <h4>{item.title}</h4><p>State: {item.stage}</p>
            <button className="quiet-button" aria-expanded={open} aria-controls={`details-${item.id}`} onClick={() => setExpanded(open ? expanded.filter((id) => id !== item.id) : [...expanded, item.id])} type="button">{open ? "Collapse" : "Expand"} {item.title}</button>
            {open && <div id={`details-${item.id}`}>
              <dl>
                <dt>Source metadata</dt><dd>{item.source}</dd>
                <dt>Supporting evidence</dt><dd>{item.evidence.join("; ") || "No supporting references yet"}</dd>
                <dt>Unresolved gaps</dt><dd>{item.gaps.join("; ") || "None recorded"}</dd>
                <dt>Related target</dt><dd>{item.target}</dd>
                <dt>Next action</dt><dd>{next ? missing.join("; ") || `Advance to ${next}` : "Reuse in application evidence placement"}</dd>
              </dl>
              {next ? <>
                {!item.evidence.length && <label className="evidence-selector">Supply a synthetic outcome reference
                  <select aria-label="Synthetic outcome evidence" value="" onChange={(event) => {
                    if (event.currentTarget.value !== "outcome") return;
                    setItems(items.map((entry) => entry.id === item.id ? {
                      ...entry,
                      evidence: [`EV-SYN-${item.id} · Synthetic outcome reference · local fixture`],
                      gaps: entry.gaps.filter((gap) => gap !== "Add an outcome evidence reference"),
                      reviewed: false,
                    } : entry));
                    setMessages({ ...messages, [item.id]: "Synthetic outcome reference supplied; outcome gap resolved. Confirm human review of the updated evidence." });
                  }}>
                    <option value="">Choose local fixture</option>
                    <option value="outcome">Synthetic outcome reference for {item.title}</option>
                  </select>
                </label>}
                <p>Transition gate: {missing.join("; ") || "Requirements met"}.</p>
                <p>Human review: {item.reviewed ? "Confirmed for this transition" : "Required for this transition"}</p>
                {!item.reviewed && <button className="quiet-button" type="button" onClick={() => {
                  setItems(items.map((entry) => entry.id === item.id ? { ...entry, reviewed: true } : entry));
                  setMessages({ ...messages, [item.id]: "Human review confirmed · mock only. Evidence requirements still apply." });
                }}>Confirm human review</button>}
                <button className="primary-button" type="button" onClick={() => advance(item)}>Advance to {next}</button>
              </> : <p>Catalog-ready · available for mock reuse. No further lifecycle transition.</p>}
              {messages[item.id] && <p role="status">{messages[item.id]}</p>}
            </div>}
          </article>;
        })}
        {!items.some((item) => item.stage === stage) && <p className="intro">No items in this stage.</p>}
      </section>)}
    </div>
  </section>;
}
