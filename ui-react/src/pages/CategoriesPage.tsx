import { useEffect, useState } from 'react';

interface Category {
  id: number;
  name: string;
  color: string;
  activeSubscriptionCount?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchCats = () => {
    fetch('/api/categories')
      .then(async (r) => {
        if (!r.ok) throw new Error(`API ${r.status}`);
        return r.json();
      })
      .then(setCategories)
      .catch((e) => setError(e.message));
  };

  useEffect(fetchCats, []);

  return (
    <div>
      <h1>Categories</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget as HTMLFormElement);
          const payload = {
            name: fd.get('catName'),
            color: fd.get('catColor'),
          } as const;
          fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
            .then((r) => {
              if (!r.ok) throw new Error('Failed');
              return r.json();
            })
            .then((saved) => setCategories((arr) => [...arr, saved]))
            .catch((err) => alert(err.message));
        }}
      >
        <input name="catName" placeholder="Name" required />
        <input name="catColor" type="color" defaultValue="#ff6b6b" />
        <button type="submit">Add</button>
      </form>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
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
            {c.name}
            <button
              style={{ marginLeft: 8 }}
              onClick={() => {
                const newName = prompt('New name', c.name);
                if (!newName) return;
                const newColor = prompt('Hex color (#rrggbb)', c.color) || c.color;
                fetch(`/api/categories/${c.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: newName, color: newColor }),
                })
                  .then((r) => r.json())
                  .then((upd) => setCategories((cats) => cats.map((x) => (x.id === upd.id ? upd : x))));
              }}
            >Edit</button>
            <button
              style={{ marginLeft: 4 }}
              onClick={() => {
                if (!confirm('Delete category?')) return;
                fetch(`/api/categories/${c.id}`, { method: 'DELETE' })
                  .then(() => setCategories((cats) => cats.filter((x) => x.id !== c.id)));
              }}
            >Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
} 