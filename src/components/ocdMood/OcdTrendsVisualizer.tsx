import React, { useMemo } from 'react';
import { OcdMoodLog, getMoodLabel } from '../../services/ocdMoodService';

interface OcdTrendsVisualizerProps {
  logs: OcdMoodLog[];
  days: number;
}

export default function OcdTrendsVisualizer({ logs, days }: OcdTrendsVisualizerProps) {
  // Sort ascending for chronology
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [logs]);

  if (sortedLogs.length < 2) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748B' }}>
        <p style={{ fontSize: '14.5px', margin: '0 0 6px 0', color: '#18243A', fontWeight: 600 }}>
          Not enough check-ins yet
        </p>
        <p style={{ fontSize: '13px', margin: 0 }}>
          Add a few more check-ins to see your history charted here.
        </p>
      </div>
    );
  }

  // Generate SVG coordinates
  const svgWidth = 320;
  const svgHeight = 110;
  const paddingX = 24;
  const paddingY = 16;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const pointsCount = sortedLogs.length;

  const getPoints = (getValue: (l: OcdMoodLog) => number) => {
    return sortedLogs.map((log, index) => {
      const x = paddingX + (index / (pointsCount - 1)) * chartWidth;
      // Value 1 to 5 mapped to chartHeight (1 is bottom, 5 is top)
      const val = getValue(log);
      const normalized = (val - 1) / 4; // 0..1
      const y = svgHeight - paddingY - normalized * chartHeight;
      return { x, y, val, date: log.createdAt };
    });
  };

  const moodPoints = getPoints(l => l.mood);
  const impactPoints = getPoints(l => l.ocdImpact);

  const buildPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    return points.reduce((acc, curr, idx) => {
      return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Mood Over Time Chart */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#005387', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Mood Pattern
          </span>
          <span style={{ fontSize: '11.5px', color: '#64748B' }}>1 (Very low) – 5 (Very good)</span>
        </div>

        <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '12px 8px', border: '1px solid #E2E8F0' }}>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height={svgHeight} style={{ overflow: 'visible' }}>
            {/* Horizontal Grid lines */}
            {[1, 3, 5].map((lvl) => {
              const y = svgHeight - paddingY - ((lvl - 1) / 4) * chartHeight;
              return (
                <line
                  key={lvl}
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              );
            })}

            {/* Line graph */}
            <path
              d={buildPath(moodPoints)}
              fill="none"
              stroke="#0284C7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data point dots */}
            {moodPoints.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill="#FFFFFF"
                stroke="#005387"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>
      </div>

      {/* OCD Impact Over Time Chart */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#BE123C', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            OCD Impact Pattern
          </span>
          <span style={{ fontSize: '11.5px', color: '#64748B' }}>1 (Not much) – 5 (A lot)</span>
        </div>

        <div style={{ background: '#F8FAFC', borderRadius: '14px', padding: '12px 8px', border: '1px solid #E2E8F0' }}>
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height={svgHeight} style={{ overflow: 'visible' }}>
            {/* Horizontal Grid lines */}
            {[1, 3, 5].map((lvl) => {
              const y = svgHeight - paddingY - ((lvl - 1) / 4) * chartHeight;
              return (
                <line
                  key={lvl}
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              );
            })}

            {/* Line graph */}
            <path
              d={buildPath(impactPoints)}
              fill="none"
              stroke="#F43F5E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data point dots */}
            {impactPoints.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill="#FFFFFF"
                stroke="#BE123C"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>
      </div>

      <p style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'center', margin: 0 }}>
        Neutral self-monitoring view over the last {days} days.
      </p>
    </div>
  );
}
