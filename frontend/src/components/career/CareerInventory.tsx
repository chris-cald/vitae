import { useEffect, useState } from 'react';
import {
  CareerInventory,
  fetchCareerInventory,
  harvestCareerInventory,
  primeCareerInventorySeed,
} from '@/lib/api';

export function CareerInventoryPanel() {
  const [inventory, setInventory] = useState<CareerInventory | null>(null);
  const [error, setError] = useState('');

  const refresh = async () => {
    try {
      setError('');
      setInventory(await fetchCareerInventory());
    } catch {
      setError('Career inventory is unavailable.');
    }
  };

  useEffect(() => { void refresh(); }, []);

  const harvest = async (sourceId: string) => {
    try {
      await harvestCareerInventory(sourceId);
      await refresh();
    } catch {
      setError('Could not harvest the synthetic source.');
    }
  };

  const prime = async (seedId: string) => {
    try {
      await primeCareerInventorySeed(seedId);
      await refresh();
    } catch {
      setError('Could not prime this Seed.');
    }
  };

  return (
    <section aria-labelledby="career-inventory-heading" className="mt-8 border-t pt-6">
      <h3 id="career-inventory-heading" className="font-semibold mb-2">Career Inventory</h3>
      <p className="text-sm text-muted-foreground mb-3">
        Synthetic source metadata only. Harvested Seeds remain outside the Catalog and cannot supply generation inputs.
      </p>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {!inventory ? <p className="text-sm">Loading inventory…</p> : <>
        <p className="text-sm mb-3">
          {inventory.counts.sources} source · {inventory.counts.seeds} Seeds · {inventory.counts.catalogAssets} CatalogAssets
        </p>
        <ul className="space-y-2">
          {inventory.sources.map(source => (
            <li key={source.id} className="flex items-center justify-between gap-2 text-sm">
              <span>{source.title} ({source.sourceType})</span>
              <button className="px-3 py-1 rounded bg-secondary" onClick={() => void harvest(source.id)}>Harvest</button>
            </li>
          ))}
          {inventory.seeds.map(seed => (
            <li key={seed.id} className="flex items-center justify-between gap-2 text-sm">
              <span>{seed.id} · {seed.status}</span>
              {seed.status === 'harvested' && <button className="px-3 py-1 rounded bg-secondary" onClick={() => void prime(seed.id)}>Prime</button>}
            </li>
          ))}
        </ul>
        {inventory.actions.length > 0 && <p className="mt-3 text-xs text-muted-foreground">
          Synthetic decision history: {inventory.actions.map(action => `${action.action}: ${action.status}`).join(', ')}
        </p>}
      </>}
    </section>
  );
}
