import React, { useState } from 'react';
import { OcdMoodLog, getMoodLabel } from '../../services/ocdMoodService';

interface OcdCalendarViewProps {
  logs: OcdMoodLog[];
  onSelectDateLogs: (logsOnDate: OcdMoodLog[], dateStr: string) => void;
}

export default function OcdCalendarView({ logs, onSelectDateLogs }: OcdCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Group logs by YYYY-MM-DD local string
  const logsByDate = React.useMemo(() => {
    const map: Record<string, OcdMoodLog[]> = {};
    logs.forEach((log) => {
      const d = new Date(log.createdAt);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(log);
    });
    return map;
  }, [logs]);

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const dayHeaders = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="ocd-calendar-box">
      <div className="ocd-calendar-header">
        <button
          type="button"
          onClick={handlePrevMonth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#64748B', padding: '4px 8px' }}
        >
          ←
        </button>
        <span>
          {monthNames[month]} {year}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#64748B', padding: '4px 8px' }}
        >
          →
        </button>
      </div>

      <div className="ocd-calendar-grid">
        {dayHeaders.map((dh) => (
          <div key={dh} className="ocd-calendar-day-header">
            {dh}
          </div>
        ))}

        {/* Empty slots before month start */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Month day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const dayLogs = logsByDate[dateKey] || [];
          const hasLogs = dayLogs.length > 0;

          return (
            <div
              key={dayNum}
              onClick={() => {
                if (hasLogs) {
                  onSelectDateLogs(dayLogs, dateKey);
                }
              }}
              className={`ocd-calendar-cell ${hasLogs ? 'has-log' : ''}`}
              title={hasLogs ? `${dayLogs.length} check-in(s)` : undefined}
            >
              <span>{dayNum}</span>
              {hasLogs && <div className="ocd-calendar-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
