import { useEffect, useRef, useState } from 'react';
import {
  CareerInventory,
  fetchCareerInventory,
  harvestCareerInventory,
  primeCareerInventorySeed,
} from '@/lib/api';
import { RuntimeExecutionControls } from '@/components/career/RuntimeExecutionControls';

export function CareerInventoryPanel() {
  const [inventory, setInventory] = useState<CareerInventory | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const latestRequest = useRef(0);

  const refresh = async () => {
    const request = ++latestRequest.current;
    setLoading(true);
    try {
      const nextInventory = await fetchCareerInventory();
      if (request === latestRequest.current) {
        setInventory(nextInventory);
        setError('');
      }
    } catch {
      if (request === latestRequest.current) setError('Career inventory is unavailable.');
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const request = ++latestRequest.current;
    void fetchCareerInventory()
      .then(nextInventory => {
        if (active && request === latestRequest.current) {
          setInventory(nextInventory);
          setError('');
        }
      })
      .catch(() => {
        if (active && request === latestRequest.current) setError('Career inventory is unavailable.');
      })
      .finally(() => {
        if (active && request === latestRequest.current) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const harvest = async (sourceId: string) => {
    setBusy(true);
    try {
      await harvestCareerInventory(sourceId);
      await refresh();
    } catch {
      setError('Could not harvest the synthetic source.');
    } finally {
      setBusy(false);
    }
  };

  const prime = async (seedId: string) => {
    setBusy(true);
    try {
      await primeCareerInventorySeed(seedId);
      await refresh();
    } catch {
      setError('Could not prime this Seed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-labelledby="career-inventory-heading" className="mt-8 border-t pt-6">
      <h3 id="career-inventory-heading" className="font-semibold mb-2">Career Inventory</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Synthetic source metadata only. Harvested Seeds remain outside the Catalog and cannot supply generation inputs.
      </p>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {loading && !inventory ? <p className="text-sm">Loading inventory…</p> : <>
        {error && <button className="px-3 py-1 rounded bg-secondary" onClick={() => void refresh()}>Retry</button>}
        {inventory && <>
          <p className="text-sm mb-3">
            {inventory.counts.sources} source · {inventory.counts.seeds} Seeds · {inventory.counts.catalogAssets} CatalogAssets
          </p>
          <p className="text-sm mb-3">Book of Work source state: {inventory.bookOfWork.status} ({inventory.bookOfWork.changeCount} changes)</p>
          <RuntimeExecutionControls workflowType="book-of-work-refresh" label="Refresh Book of Work" />
          <ul className="space-y-2">
            {inventory.sources.map(source => (
              <li key={source.id} className="flex items-center justify-between gap-2 text-sm">
                <span>{source.title} ({source.sourceType}) · {source.sourceRef.uri} · {source.capturedAt}</span>
                <button disabled={busy} className="px-3 py-1 rounded bg-secondary" onClick={() => void harvest(source.id)}>Harvest</button>
              </li>
            ))}
            {inventory.seeds.map(seed => (
              <li key={seed.id} className="flex items-center justify-between gap-2 text-sm">
                <span>{seed.id} · {seed.status} · {seed.provenanceRef.uri}</span>
                {seed.status === 'incubating' && <button disabled={busy} className="px-3 py-1 rounded bg-secondary" onClick={() => void prime(seed.id)}>Prime</button>}
              </li>
            ))}
          </ul>
          {inventory.actions.length > 0 && <p className="mt-3 text-xs text-muted-foreground">
            Synthetic decision history: {inventory.actions.map(action => `${action.action}: ${action.status}`).join(', ')}
          </p>}
        </>}
      </>}
    </section>
  );
}
