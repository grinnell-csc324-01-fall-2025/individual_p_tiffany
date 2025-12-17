'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const CONVS_KEY = 'aluv_conversations_v1';

export default function ChatHistory() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = localStorage.getItem(CONVS_KEY);
      const convs = raw ? JSON.parse(raw) : [];
      setConversations(convs);
    } catch (e) {
      setConversations([]);
    }
  }, [mounted]);

  const handleNewChat = () => {
    router.push('/chat?new=1');
  };

  const handleSelectChat = (cid: string) => {
    router.push(`/chat?cid=${cid}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        onClick={handleNewChat}
        style={{
          padding: '10px 12px',
          background: '#4a90e2',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          width: '100%',
          textAlign: 'center',
        }}
      >
        + New Chat
      </button>

      {conversations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#888', textTransform: 'uppercase' }}>
            History
          </div>
          {conversations.map((conv: any) => (
            <button
              key={conv.id}
              onClick={() => handleSelectChat(conv.id)}
              style={{
                padding: '10px 12px',
                background: 'transparent',
                color: '#333',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: '13px',
                textAlign: 'left',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {conv.title || `Chat ${conv.id.slice(0, 6)}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
