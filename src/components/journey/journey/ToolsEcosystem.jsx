import React from 'react';
import {
  Headphones,
  BookMarked,
  HeartPulse,
  BrainCircuit,
  ClipboardList,
  Sparkles,
  Smile,
  ShieldCheck
} from 'lucide-react';

const ECOSYSTEM_TOOLS = [
  { id: 'meditation', name: 'Meditation', icon: Headphones, color: '#2563eb', bg: '#eff6ff' },
  { id: 'journaling', name: 'Journaling', icon: BookMarked, color: '#06b6d4', bg: '#ecfeff' },
  { id: 'yoga', name: 'Yoga & mindfulness', icon: HeartPulse, color: '#10b981', bg: '#f0fdf4' },
  { id: 'assessments', name: 'Assessments', icon: ClipboardList, color: '#6366f1', bg: '#eef2ff' },
  { id: 'trackers', name: 'Trackers & insights', icon: Smile, color: '#f59e0b', bg: '#fffbeb' },
  { id: 'ai', name: 'AI Assistant', icon: BrainCircuit, color: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'selfcare', name: 'Self-care resources', icon: ShieldCheck, color: '#0284c7', bg: '#f0f9ff' }
];

export default function ToolsEcosystem() {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '20px',
      padding: '24px 20px',
      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563eb', background: '#eff6ff', padding: '4px 12px', borderRadius: '9999px' }}>
          Your Plan • Main Experience
        </span>
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
          Supporting Resources
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '10px'
      }}>
        {ECOSYSTEM_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <div
              key={tool.id}
              style={{
                background: '#f8fafc',
                border: '1px solid #f1f5f9',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: tool.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tool.color,
                flexShrink: 0
              }}>
                <Icon size={16} />
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                {tool.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
