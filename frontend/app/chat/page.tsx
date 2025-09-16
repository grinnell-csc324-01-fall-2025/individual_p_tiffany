'use client';
import { useState } from 'react';
import { apiFetch } from '../../lib/api';

export default function ChatPage() {
  const [text, setText] = useState('I feel anxious before exams.');
  const [out, setOut] = useState<any>(null);

  async function send() {
    const res = await apiFetch('/chat/analyze', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    setOut(res);
  }

  return (
    <div>
      <h2>Chat</h2>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} style={{ width: '100%' }} />
      <div style={{ marginTop: 8 }}>
        <button onClick={send}>Analyze</button>
      </div>
      {out && (
        <div style={{ marginTop: 12 }}>
          <pre>{JSON.stringify(out.emotions, null, 2)}</pre>
          <p><b>Guidance:</b></p>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{out.guidance}</pre>
          {out.risk && <p style={{ color: 'red' }}>Risk keywords detected.</p>}
        </div>
      )}
    </div>
  );
}
