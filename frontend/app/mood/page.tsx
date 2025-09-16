'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function MoodPage() {
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState('');
  const [rows, setRows] = useState<any[]>([]);

  async function load() {
    const data = await apiFetch('/mood', { method: 'GET' });
    setRows(data);
  }

  async function save() {
    await apiFetch('/mood', {
      method: 'POST',
      body: JSON.stringify({ mood_score: mood, note }),
    });
    setNote('');
    await load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h2>Mood</h2>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label>Mood (1–5): </label>
        <input type="number" min={1} max={5} value={mood} onChange={(e) => setMood(parseInt(e.target.value || '3', 10))} />
        <input placeholder="note (optional)" value={note} onChange={(e) => setNote(e.target.value)} style={{ flex: 1 }} />
        <button onClick={save}>Save</button>
      </div>

      <h3 style={{ marginTop: 16 }}>Recent</h3>
      <ul>
        {rows.map((r) => (
          <li key={r.id}>{r.date}: mood={r.mood_score} {r.note ? `– ${r.note}` : ''}</li>
        ))}
      </ul>
    </div>
  );
}
