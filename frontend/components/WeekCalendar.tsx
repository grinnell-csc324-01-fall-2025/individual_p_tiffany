'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../lib/api';

interface WeekCalendarProps {
  weekId: string;
}

interface MoodEntry {
  id: string;
  date: string;
  mood_score: number;
  note: string;
}

export default function WeekCalendar({ weekId }: WeekCalendarProps) {
  const router = useRouter();
  const [moodData, setMoodData] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodEntry | null>(null);

  useEffect(() => {
    loadMoodData();
  }, [weekId]);

  async function loadMoodData() {
    try {
      setLoading(true);
      const data = await apiFetch('/mood', { method: 'GET' });
      setMoodData(data || []);
    } catch (error) {
      console.error('Failed to load mood data:', error);
      setMoodData([]);
    } finally {
      setLoading(false);
    }
  }

  // Generate 7 days for the week
  const getDaysOfWeek = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getMoodForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return moodData.find((m) => m.date === dateStr);
  };

  const getMoodColor = (score: number) => {
    switch (score) {
      case 5:
        return '#22c55e'; // green
      case 4:
        return '#84cc16'; // lime
      case 3:
        return '#f59e0b'; // amber
      case 2:
        return '#f97316'; // orange
      case 1:
        return '#ef4444'; // red
      default:
        return '#e5e7eb'; // gray
    }
  };

  const days = getDaysOfWeek();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return <div style={{ padding: '20px', color: '#666' }}>Loading mood data...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px 0' }}>
      {/* Week Calendar Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        {days.map((day, idx) => {
          const mood = getMoodForDate(day);
          const isToday = day.toDateString() === new Date().toDateString();

          return (
            <div
              key={idx}
              onClick={() => {
                setSelectedDate(day.toISOString().split('T')[0]);
                setSelectedMood(mood || null);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                borderRadius: '8px',
                background: mood ? getMoodColor(mood.mood_score) : '#f3f4f6',
                border: isToday ? '2px solid #000' : '1px solid #e5e7eb',
                cursor: 'pointer',
                minHeight: '100px',
                transition: 'transform 0.2s, box-shadow 0.2s',
                color: mood && mood.mood_score >= 3 ? '#fff' : '#333',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
                {dayNames[day.getDay()]}
              </div>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>
                {day.getDate()}
              </div>
              {mood ? (
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: '700',
                  }}
                >
                  {mood.mood_score}/5
                </div>
              ) : (
                <div style={{ fontSize: '12px', opacity: 0.6 }}>No entry</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail View */}
      {selectedDate && (
        <div
          style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0 }}>
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
              }}
            >
              ✕
            </button>
          </div>

          {selectedMood ? (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Mood:</strong>{' '}
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    background: getMoodColor(selectedMood.mood_score),
                    color: '#fff',
                    borderRadius: '4px',
                    marginLeft: '8px',
                  }}
                >
                  {selectedMood.mood_score}/5
                </span>
              </div>
              {selectedMood.note && (
                <div>
                  <strong>Note:</strong>
                  <p style={{ margin: '8px 0', color: '#555' }}>{selectedMood.note}</p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ color: '#888' }}>No mood entry for this day.</div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
          Mood Scale:
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { score: 5, label: 'Excellent', color: '#22c55e' },
            { score: 4, label: 'Good', color: '#84cc16' },
            { score: 3, label: 'Neutral', color: '#f59e0b' },
            { score: 2, label: 'Poor', color: '#f97316' },
            { score: 1, label: 'Very Poor', color: '#ef4444' },
          ].map((item) => (
            <div key={item.score} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  background: item.color,
                }}
              />
              <span style={{ fontSize: '12px', color: '#666' }}>
                {item.score} - {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        style={{
          marginTop: '16px',
          padding: '8px 16px',
          background: '#e5e7eb',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        ← Back
      </button>
    </div>
  );
}
