'use client';
import { useState } from 'react';

export default function ToolkitClient() {
  const [isExpanded, setIsExpanded] = useState(false);

  const tools = [
    {
      id: 'breathing',
      label: 'Breathing Exercise',
      icon: '🫁',
      description: 'Guided breathing to calm your mind',
    },
    {
      id: 'meditation',
      label: 'Meditation',
      icon: '🧘',
      description: 'Guided meditation exercises',
    },
    {
      id: 'journaling',
      label: 'Journaling',
      icon: '📝',
      description: 'Reflect on your thoughts',
    },
    {
      id: 'affirmations',
      label: 'Affirmations',
      icon: '✨',
      description: 'Daily positive affirmations',
    },
  ];

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <button
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 12px',
          borderRadius: 8,
          color: '#333',
          textDecoration: 'none',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '14px',
          width: '100%',
          justifyContent: 'flex-start',
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"
            stroke="#666"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
        Wellness Kit
      </button>

      {isExpanded && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: 8,
            marginTop: 8,
            minWidth: '220px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 50,
            padding: '8px 0',
          }}
        >
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                // Could navigate or open a modal here
                console.log('Selected tool:', tool.id);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                padding: '12px 16px',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f9f9f9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '16px' }}>{tool.icon}</span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>
                  {tool.label}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#888', marginLeft: '24px' }}>
                {tool.description}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
