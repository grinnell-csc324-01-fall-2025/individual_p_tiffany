"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '../../lib/api';

const CONVS_KEY = 'aluv_conversations_v1';

function loadConversationsRaw() {
  try {
    const raw = localStorage.getItem(CONVS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveConversationsRaw(v: any[]) {
  localStorage.setItem(CONVS_KEY, JSON.stringify(v));
}

function msgsKey(cid: string) {
  return `aluv_conv_msgs_${cid}`;
}

export default function ChatPage() {
  const search = useSearchParams();
  const router = useRouter();
  let cid = search ? search.get('cid') : null;
  const isNew = search ? search.get('new') === '1' : false;
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [tone, setTone] = useState<'calming' | 'cheerful' | 'casual'>('calming');
  const lastCidRef = useRef<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!cid) return;
    // if we've already loaded this cid, skip
    if (lastCidRef.current === cid) return;
    lastCidRef.current = cid;
    try {
      const raw = localStorage.getItem(msgsKey(cid));
      if (raw) setMessages(JSON.parse(raw));
      else setMessages([]);
    } catch (e) {
      setMessages([]);
    }
  }, [cid]);

  // If user navigated to /chat?new=1, clear any loaded messages and reset loadedRef
  useEffect(() => {
    if (isNew) {
      setMessages([]);
      lastCidRef.current = null;
      // also remove cid from URL if present
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('cid');
        window.history.replaceState({}, '', url.toString());
      } catch (e) {}
    }
  }, [isNew]);

  // clear any error when switching conversations
  useEffect(() => {
    setError(null);
  }, [cid]);

  useEffect(() => {
    if (!cid) return;
    try {
      localStorage.setItem(msgsKey(cid), JSON.stringify(messages));
      // update preview in conversations list
      const convs = loadConversationsRaw();
      const idx = convs.findIndex((c: any) => c.id === cid);
      const preview = messages.length ? messages[messages.length - 1].text : 'New conversation';
      if (idx >= 0) {
        convs[idx].preview = preview;
        convs[idx].createdAt = convs[idx].createdAt || new Date().toISOString();
      }
      saveConversationsRaw(convs);
    } catch (e) {
      // ignore
    }
  }, [messages, cid]);

  async function send() {
    if (!text) return;
    setError(null);
    const userMsg = { role: 'user', text, createdAt: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      // Call the /chat/demo endpoint with tone parameter
      const response = await apiFetch('/chat/demo', {
        method: 'POST',
        body: JSON.stringify({ text, tone }),
      });

      if (response && response.guidance) {
        const botMsg = { role: 'assistant', text: response.guidance, emotions: response.emotions };
        setMessages((m) => [...m, botMsg]);
      } else {
        setError('No response from server. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.message || 'Server error: failed to send message. Please try again later.';
      setError(msg);
      console.error('Send message failed:', err);
    } finally {
      setLoading(false);
      setText('');
    }
  }

  return (
  <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', borderRadius: 8 }}>
      <div style={{ padding: '8px 16px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>
          {!mounted ? (
            'Conversation'
          ) : (
            (() => {
              try {
                if (!cid) return 'Conversation';
                const convs = loadConversationsRaw();
                const c = convs.find((x: any) => x.id === cid);
                if (!c || !c.preview) return 'Conversation';
                const summary = c.preview.length > 40 ? c.preview.slice(0, 37) + '\u2026' : c.preview;
                return `Discussion: ${summary}`;
              } catch (e) {
                return 'Conversation';
              }
            })()
          )}
        </div>
        {/* right-hand header slot removed (no timestamp) */}
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
        {error && (
          <div style={{ background: '#ffecec', color: '#a33', padding: 10, borderRadius: 8, marginBottom: 12 }} role="alert">
            {error}
          </div>
        )}
        {messages.length === 0 && (
          <div style={{ color: '#0b5f8a' }}>
            <h3>Welcome to the chat</h3>
            <p>How's your day? Let's chat together — say something brief and press Send.</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
            <div style={{ maxWidth: '70%', background: m.role === 'user' ? '#cfeefc' : '#ffffff', padding: 12, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: 12, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
        {/* Tone selector buttons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#666' }}>Tone:</span>
          {(['calming', 'cheerful', 'casual'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              style={{
                padding: '6px 12px',
                background: tone === t ? '#4a90e2' : '#f0f0f0',
                color: tone === t ? '#fff' : '#333',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: tone === t ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Message input */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <textarea placeholder="Write a short message about how you're feeling..." value={text} onChange={(e) => setText(e.target.value)} rows={2} style={{ flex: 1, resize: 'none', padding: 10, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)' }} />
          <button onClick={send} disabled={loading} style={{ padding: '10px 14px', background: loading ? '#cfeefc' : '#9fe0ff', border: 'none', borderRadius: 8 }}>{loading ? 'Sending...' : 'Send'}</button>
        </div>
      </div>
    </div>
    );
  }
