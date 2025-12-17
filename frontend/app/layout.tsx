import LoginButtonClient from '../components/LoginButton.client';
import dynamic from 'next/dynamic';

const ChatHistoryClient = dynamic(() => import('../components/ChatHistory'), { ssr: false });
const ToolkitClient = dynamic(() => import('../components/Toolkit.client'), { ssr: false });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Inter, system-ui, sans-serif', margin: 0 }}>
        {/* top-right login button and settings (client-only) */}
        <div id="top-login" style={{ position: 'fixed', right: 20, top: 18, zIndex: 60, display: 'flex', gap: 12, alignItems: 'center' }}>
          {/* Settings button */}
          <button
            style={{
              width: 40,
              height: 40,
              borderRadius: 6,
              background: '#f0f0f0',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
            title="Settings"
          >
            ⚙️
          </button>
          {/* Render client wrapper (dynamic import) */}
          {/* @ts-ignore */}
          <LoginButtonClient />
        </div>
        <div style={{ display: 'flex', minHeight: '100vh', background: '#eaf6ff' }}>
          <aside style={{ width: 260, padding: 20, borderRight: '1px solid rgba(0,0,0,0.06)', background: '#f3fbff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img id="site-logo" src="/logo.png" alt="logo" style={{ width: 56, height: 56, borderRadius: 6, objectFit: 'cover' }} />
              <div>
                <div style={{ fontWeight: 700 }}>Aluv</div>
                <div id="site-slogan" style={{ fontSize: 12, color: '#666' }}>Your AI therapist</div>
              </div>
            </div>

            <nav style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Chat history client component (handles New Chat navigation) */}
              {/* @ts-ignore */}
              <ChatHistoryClient />

              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, color: '#333', textDecoration: 'none', background: 'transparent' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M3 12l2-2 4 4 8-8 4 4v6H3z" stroke="#444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                  Home
                </a>

                <a href="/mood" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, color: '#333', textDecoration: 'none', background: 'transparent' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    {/* sunny, positive icon */}
                    <circle cx="12" cy="12" r="4" stroke="#f6b93b" strokeWidth="1.2" fill="#f6b93b" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="#f6b93b" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Feelings Calender
                </a>

                {/* Toolkit client (hover-expand) */}
                <div style={{ position: 'relative' }}>
                  {/* @ts-ignore - client component rendered only on client */}
                  <ToolkitClient />
                </div>
              </div>
            </nav>
          </aside>

          <main style={{ flex: 1, padding: 28 }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
