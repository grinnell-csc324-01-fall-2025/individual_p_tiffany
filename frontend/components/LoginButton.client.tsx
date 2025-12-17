'use client';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

export default function LoginButtonClient() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demopass');
  const [msg, setMsg] = useState<string>('');

  async function handleAuth(path: string) {
    try {
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
      setMsg('✓ Login successful');
      setTimeout(() => setIsOpen(false), 1000);
    } catch (error) {
      setMsg('Connection error');
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 16px',
          background: '#4a90e2',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
        }}
      >
        Login
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '40px',
            right: 0,
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            minWidth: '280px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <input
              placeholder="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleAuth('/auth/register')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Register
              </button>
              <button
                onClick={() => handleAuth('/auth/login')}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#4a90e2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Login
              </button>
            </div>
            {msg && (
              <div
                style={{
                  fontSize: '13px',
                  color: msg.includes('✓') ? '#22c55e' : '#ef4444',
                  textAlign: 'center',
                }}
              >
                {msg}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
