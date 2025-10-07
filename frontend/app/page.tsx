import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 48, width: '80%', maxWidth: 1000 }}>
        {/* Left: circular logo */}
        <div style={{ width: 360, height: 360, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 24px rgba(0,0,0,0.08)' }}>
          <img src="/logo-circle.png" alt="logo" style={{ width: 300, height: 300, borderRadius: '50%', objectFit: 'cover' }} />
        </div>

  {/* Right: slogan as main title (shifted down by 10% of its height) */}
  <div style={{ flex: 1, textAlign: 'left', transform: 'translateY(10%)' }}>
          <h1 style={{ color: '#0b5f8a', marginTop: 0, fontSize: 48, lineHeight: 1.05, fontWeight: 700 }}>
            AI therapy with heart:
          </h1>
          <p style={{ maxWidth: 560, margin: '8px 0 18px 0', color: '#264653', fontSize: 36, fontStyle: 'italic', fontFamily: 'cursive' }}>
            a safe place to be you.
          </p>
          <div style={{ marginTop: 18 }}>
            <Link href="/chat">
              <button style={{ padding: '14px 28px', background: '#bfe8ff', border: 'none', borderRadius: 12, fontSize: 18, minWidth: 170, cursor: 'pointer' }}>
                Continue to Chat
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
