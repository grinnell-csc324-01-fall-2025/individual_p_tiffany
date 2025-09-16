'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export default function AuthBox() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demopass');
  const [msg, setMsg] = useState<string>('');

  async function call(path: string) {
    const res = await fetch(`${API}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.detail || 'error');
      return;
    }
    localStorage.setItem('token', data.access_token);
    setMsg('ok, token saved');
  }

  return (
    <div style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
      <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => call('/auth/register')}>Register</button>
        <button onClick={() => call('/auth/login')}>Login</button>
      </div>
      <div>{msg}</div>
    </div>
  );
}
