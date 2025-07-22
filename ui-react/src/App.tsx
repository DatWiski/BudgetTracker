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
      <h2>Add Subscription</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget as HTMLFormElement);
          const payload = {
            name: data.get('name'),
            price: parseFloat(data.get('price') as string),
            billingPeriod: data.get('billing') as string,
            nextBillingDate: data.get('nextDate'),
          } as const;

          fetch('/api/subscriptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
            .then((r) => {
              if (!r.ok) throw new Error('Failed');
              return r.json();
            })
            .then((saved) => setSubs((s) => [...s, saved]))
            .catch((err) => alert(err.message));
        }}
      >
        <input name="name" placeholder="Name" required />
        <input name="price" type="number" step="0.01" placeholder="Price" required />
        <select name="billing">
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY" selected>Monthly</option>
          <option value="YEARLY">Yearly</option>
        </select>
        <input name="nextDate" type="date" required />
        <button type="submit">Add</button>
      </form>

      <h2>Subscriptions</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {subs.map((s) => (
          <li key={s.id} style={{ marginBottom: '0.25rem' }}>
            {s.name} — ${s.price} / {s.billingPeriod?.toLowerCase()}
            <button
              style={{ marginLeft: 8 }}
              onClick={() => {
                const newName = prompt('New name', s.name);
                if (!newName) return;
                fetch(`/api/subscriptions/${s.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...s, name: newName }),
                })
                  .then((r) => r.json())
                  .then((upd) => setSubs((arr) => arr.map((x) => (x.id === upd.id ? upd : x))));
              }}
            >
              Edit
            </button>
            <button
              style={{ marginLeft: 4 }}
              onClick={() => {
                if (!confirm('Delete?')) return;
                fetch(`/api/subscriptions/${s.id}`, { method: 'DELETE' })
                  .then(() => setSubs((arr) => arr.filter((x) => x.id !== s.id)));
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;
