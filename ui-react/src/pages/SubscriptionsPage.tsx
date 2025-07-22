import { useEffect, useState } from 'react';

interface Subscription {
  id: number;
  name: string;
  price: number;
  billingPeriod: string;
  nextBillingDate: string;
}

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchSubs = () => {
    fetch('/api/subscriptions')
      .then(async (r) => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      })
      .then(setSubs)
      .catch((e) => setError(e.message));
  };

  useEffect(fetchSubs, []);

  return (
    <div>
      <h1>Subscriptions</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget as HTMLFormElement);
          const payload = {
            name: fd.get('name'),
            price: parseFloat(fd.get('price') as string),
            billingPeriod: fd.get('billing') as string,
            nextBillingDate: fd.get('nextDate'),
          };
          fetch('/api/subscriptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
            .then((r) => {
              if (!r.ok) throw new Error('Failed');
              return r.json();
            })
            .then((saved) => setSubs((arr) => [...arr, saved]))
            .catch((err) => alert(err.message));
        }}
      >
        <input name="name" placeholder="Name" required />
        <input name="price" type="number" step="0.01" placeholder="Price" required />
        <select name="billing">
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY" defaultValue="MONTHLY">Monthly</option>
          <option value="YEARLY">Yearly</option>
        </select>
        <input name="nextDate" type="date" required />
        <button type="submit">Add</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {subs.map((s) => (
          <li key={s.id} style={{ marginBottom: '0.25rem' }}>
            {s.name} — ${s.price} / {s.billingPeriod.toLowerCase()}
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
                  .then((upd) =>
                    setSubs((arr) => arr.map((x) => (x.id === upd.id ? upd : x)))
                  );
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
    </div>
  );
} 