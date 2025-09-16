export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0 }}>
        <div style={{ maxWidth: 840, margin: '0 auto', padding: 16 }}>
          <h1>AI Psychotherapy Prototype</h1>
          <nav style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <a href="/">Home</a>
            <a href="/chat">Chat</a>
            <a href="/mood">Mood</a>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
