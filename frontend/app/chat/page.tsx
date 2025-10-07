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

    // helper: create conversation on server with retry/backoff
    async function createConversationOnServer(titleText: string) {
      const title = titleText.length > 60 ? titleText.slice(0, 57) + '\u2026' : titleText;
      let lastErr: any = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res: any = await apiFetch('/conversations/', { method: 'POST', body: JSON.stringify({ title }) });
          if (res && res.id) return String(res.id);
          lastErr = new Error('Server response missing id');
        } catch (err: any) {
          lastErr = err;
          await new Promise((r) => setTimeout(r, 120 * attempt));
        }
      }
      throw lastErr;
    }

    let createdOnServer = false;

    // create conversation if needed
    if (!cid) {
      try {
        const newCid = await createConversationOnServer(text);
        cid = newCid;
        createdOnServer = true;
        // persist the pending message so that when the router updates and
        // the component reloads messages from localStorage it won't wipe
        // the just-sent user message. Also mark lastCidRef to avoid
        // the load effect from overwriting state.
        try {
          const raw = localStorage.getItem(msgsKey(cid));
          const arr = raw ? JSON.parse(raw) : [];
          arr.push(userMsg);
          localStorage.setItem(msgsKey(cid), JSON.stringify(arr));
        } catch (e) {
          // ignore local write errors
        }
        try { lastCidRef.current = cid; } catch (e) {}
        try { await router.replace(`/chat?cid=${cid}`); } catch (e) {}
        try { const url = new URL(window.location.href); url.searchParams.set('cid', cid); window.history.replaceState({}, '', url.toString()); } catch (e) {}
      } catch (err: any) {
        console.error('createConversationOnServer failed:', err);
        // fallback to local conv creation
        const newId = Date.now().toString();
        const createdAt = new Date().toISOString();
        const convs = loadConversationsRaw();
        const preview = text.length > 40 ? text.slice(0, 37) + '\u2026' : text;
        convs.unshift({ id: newId, createdAt, preview });
        saveConversationsRaw(convs);
        cid = newId;
        try { const url = new URL(window.location.href); url.searchParams.set('cid', cid); window.history.replaceState({}, '', url.toString()); } catch (e) {}
        const errMsg = err?.message || String(err) || 'Unknown error';
        setError(`Server unavailable — message will be saved locally. (${errMsg})`);
      }
    }

  setMessages((m) => [...m, userMsg]);
    setLoading(true);

    try {
      if (!createdOnServer) {
        // save locally
        try {
          const raw = localStorage.getItem(msgsKey(cid!));
          const arr = raw ? JSON.parse(raw) : [];
          arr.push({ role: 'user', text, createdAt: new Date().toISOString() });
          localStorage.setItem(msgsKey(cid!), JSON.stringify(arr));
        } catch (e) {
          console.error('Failed to save message locally:', e);
        }
        return;
      }

      // try post message
      let serverResp: any = null;
      try {
        serverResp = await apiFetch(`/conversations/${cid}/messages`, { method: 'POST', body: JSON.stringify({ role: 'user', text }) });
      } catch (err: any) {
        const msg = err?.message || String(err);
        console.warn('Post message failed:', msg);
        if (msg.includes('404') || msg.toLowerCase().includes('conversation not found')) {
          // try recreate once
          try {
            const newCid = await createConversationOnServer(text);
            cid = newCid;
            try { await router.replace(`/chat?cid=${cid}`); } catch (e) {}
            try { const url = new URL(window.location.href); url.searchParams.set('cid', cid); window.history.replaceState({}, '', url.toString()); } catch (e) {}
            serverResp = await apiFetch(`/conversations/${cid}/messages`, { method: 'POST', body: JSON.stringify({ role: 'user', text }) });
          } catch (err2: any) {
            console.error('Retry after recreate failed:', err2);
            throw err2;
          }
        } else {
          throw err;
        }
      }

      if (serverResp && serverResp.role === 'assistant' && serverResp.text) {
        const botMsg = { role: 'assistant', text: serverResp.text };
        setMessages((m) => [...m, botMsg]);
        try { window.dispatchEvent(new Event('conversations:updated')); } catch (e) {}
      } else {
        setError('Server did not return an assistant response. Please try again.');
        console.error('Server response missing assistant:', serverResp);
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
              {m.emotions && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
                  Emotions: <pre style={{ display: 'inline' }}>{JSON.stringify(m.emotions)}</pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

  <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', padding: 12, display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
  <textarea placeholder="Write a short message about how you're feeling..." value={text} onChange={(e) => setText(e.target.value)} rows={2} style={{ flex: 1, resize: 'none', padding: 10, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)' }} />
        <button onClick={send} disabled={loading} style={{ padding: '10px 14px', background: loading ? '#cfeefc' : '#9fe0ff', border: 'none', borderRadius: 8 }}>{loading ? 'Sending...' : 'Send'}</button>
      </div>
    </div>
    );
  }
