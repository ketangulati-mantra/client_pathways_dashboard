import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
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
  {
    id: 'meditation',
    name: 'Meditation & Soundscapes',
    icon: Headphones,
    color: '#2563eb',
    bg: '#eff6ff',
    badge: '100+ Sessions',
    desc: 'Guided audio sessions for sleep, anxious moments, and deep focus.'
  },
  {
    id: 'journaling',
    name: 'Prompted Journaling',
    icon: BookMarked,
    color: '#06b6d4',
    bg: '#ecfeff',
    badge: 'CBT Prompts',
    desc: 'Structured thought-unloading and gratitude exercises backed by psychology.'
  },
  {
    id: 'yoga',
    name: 'Yoga & Mindfulness',
    icon: HeartPulse,
    color: '#10b981',
    bg: '#f0fdf4',
    badge: 'Somatic Release',
    desc: 'Nervous system resets, posture realignment, and breathwork flows.'
  },
  {
    id: 'assessments',
    name: 'Clinical Assessments',
    icon: ClipboardList,
    color: '#6366f1',
    bg: '#eef2ff',
    badge: 'Validated Tests',
    desc: 'PHQ-9, GAD-7, and custom self-checks to gauge baseline improvements.'
  },
  {
    id: 'trackers',
    name: 'Mood & Habit Trackers',
    icon: Smile,
    color: '#f59e0b',
    bg: '#fffbeb',
    badge: 'Daily Insights',
    desc: 'Identify subtle triggers, sleep correlations, and emotional patterns.'
  },
  {
    id: 'ai',
    name: 'Mantra AI Care Companion',
    icon: BrainCircuit,
    color: '#8b5cf6',
    bg: '#f5f3ff',
    badge: '24/7 Grounding',
    desc: 'Instant, empathetic grounding exercises and pathway recommendations.'
  },
  {
    id: 'selfcare',
    name: 'Self-Care Library',
    icon: ShieldCheck,
    color: '#0284c7',
    bg: '#f0f9ff',
    badge: 'Articles & Guides',
    desc: 'Clinician-authored guides for navigating tough interpersonal moments.'
  }
];

export default function ToolsEcosystem() {
  const [hoveredTool, setHoveredTool] = useState(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Ecosystem Visual Layout */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '24px',
        padding: '32px 28px',
        boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)',
        position: 'relative'
      }}>
        {/* Central Anchor Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '28px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1.5px solid #93c5fd',
            borderRadius: '9999px',
            padding: '10px 24px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.08)'
          }}>
            <Sparkles size={18} color="#2563eb" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e40af' }}>
              Your Core Pathway Anchor
            </span>
          </div>
        </div>

        {/* Orbiting / Surrounding Tools Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}>
          {ECOSYSTEM_TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isHovered = hoveredTool === tool.id;
            return (
              <motion.div
                key={tool.id}
                onMouseEnter={() => setHoveredTool(tool.id)}
                onMouseLeave={() => setHoveredTool(null)}
                whileHover={{ y: -3, scale: 1.01 }}
                style={{
                  background: isHovered ? '#f8fafc' : '#ffffff',
                  border: isHovered ? `1px solid ${tool.color}` : '1px solid #f1f5f9',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: isHovered
                    ? '0 8px 20px -4px rgba(15, 23, 42, 0.06)'
                    : '0 1px 3px rgba(15, 23, 42, 0.02)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: tool.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: tool.color
                  }}>
                    <Icon size={18} />
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: tool.color,
                    background: tool.bg,
                    padding: '2px 8px',
                    borderRadius: '9999px'
                  }}>
                    {tool.badge}
                  </span>
                </div>

                <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                  {tool.name}
                </h5>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', lineHeight: 1.45 }}>
                  {tool.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
