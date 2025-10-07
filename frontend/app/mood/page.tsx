'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { useSearchParams } from 'next/navigation';
import WeekCalendar from '../../components/WeekCalendar';

const WEEKS_KEY = 'aluv_weeks_v1';

function loadWeeks() {
  try { const raw = localStorage.getItem(WEEKS_KEY); return raw ? JSON.parse(raw) : []; } catch(e) { return []; }
}

function saveWeeks(ws: any[]) { try { localStorage.setItem(WEEKS_KEY, JSON.stringify(ws)); } catch(e){} }

export default function MoodPage() {
  const [mood, setMood] = useState(3);
  const [note, setNote] = useState('');
  const [rows, setRows] = useState<any[]>([]);
  const search = useSearchParams();
  const week = search ? search.get('week') : null;
  const [weeks, setWeeks] = useState<any[]>([]);

  async function load() {
    const data = await apiFetch('/mood', { method: 'GET' });
    setRows(data);
  }

  useEffect(() => { load(); setWeeks(loadWeeks()); }, []);

  // if week param present, render calendar
  if (week) {
    return (
      <div>
        <h2>Feelings Calendar — Week</h2>
        <WeekCalendar weekId={week} />
      </div>
    );
  }

  async function save() {
    await apiFetch('/mood', {
      method: 'POST',
      body: JSON.stringify({ mood_score: mood, note }),
    });
    setNote('');
    await load();
  }

  return (
    <div>
      <h2>Feelings Calender</h2>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label>Mood (1–5): </label>
        <input type="number" min={1} max={5} value={mood} onChange={(e) => setMood(parseInt(e.target.value || '3', 10))} />
        <input placeholder="note (optional)" value={note} onChange={(e) => setNote(e.target.value)} style={{ flex: 1 }} />
        <button onClick={save}>Save</button>
      </div>

      <h3 style={{ marginTop: 16 }}>Weeks</h3>
      {weeks.length === 0 && <div style={{ color: '#666' }}>No weeks yet. Use "Start a new week" in the sidebar.</div>}
      <ul>
        {weeks.map((w:any) => (
          <li key={w.id}><a href={`/mood?week=${w.id}`}>Week starting {w.start || w.createdAt || w.id}</a></li>
        ))}
      </ul>

      <h3 style={{ marginTop: 16 }}>Recent</h3>
      <ul>
        {rows.map((r) => (
          <li key={r.id}>{r.date}: mood={r.mood_score} {r.note ? `– ${r.note}` : ''}</li>
        ))}
      </ul>
    </div>
  );
}
