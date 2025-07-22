import { useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
  color: string;
  activeSubscriptionCount?: number;
}

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  interface Subscription {
    id: number;
    name: string;
    price: number;
    billingPeriod: string;
  }

  const [subs, setSubs] = useState<Subscription[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`API error ${res.status}`);
        }
        return res.json();
      })
      .then(setCategories)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    fetch('/api/subscriptions')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`API error ${res.status}`);
        }
        return res.json();
      })
      .then(setSubs)
      .catch(() => {/* ignore for now */});
  }, []);

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Categories</h1>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!error && categories.length === 0 && <p>No categories yet.</p>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {categories.map((c) => (
          <li key={c.id} style={{ marginBottom: '0.5rem' }}>
            <span
              style={{
                display: 'inline-block',
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: c.color,
                marginRight: 8,
              }}
            />
            {c.name} ({c.activeSubscriptionCount ?? 0})
          </li>
        ))}
      </ul>
      <h2>Subscriptions</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {subs.map((s) => (
          <li key={s.id} style={{ marginBottom: '0.25rem' }}>
            {s.name} — ${s.price} / {s.billingPeriod?.toLowerCase()}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
