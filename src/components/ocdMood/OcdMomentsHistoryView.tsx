import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, BarChart2, Plus, Calendar, ChevronDown, ChevronUp, History } from 'lucide-react';
import MoodGlyph from './MoodGlyph';
import OcdTrendsVisualizer from './OcdTrendsVisualizer';
import OcdCalendarView from './OcdCalendarView';
import OcdEntryDetailModal from './OcdEntryDetailModal';
import {
  OcdMoodLog,
  getMoodLabel,
  getExperienceLabel
} from '../../services/ocdMoodService';

interface OcdMomentsHistoryViewProps {
  logs: OcdMoodLog[];
  onStartNewCheckIn: () => void;
  onUpdateLog: (id: string | number, updatedData: { mood: number; ocdImpact: number; experiences: string[]; note: string }) => Promise<void>;
  onDeleteLog: (id: string | number) => Promise<void>;
}

export default function OcdMomentsHistoryView({
  logs,
  onStartNewCheckIn,
  onUpdateLog,
  onDeleteLog
}: OcdMomentsHistoryViewProps) {
  const { t } = useTranslation('ocd_mood_check_in');
  const [historyTab, setHistoryTab] = useState<'moments' | 'trends'>('moments');
  const [trendsRange, setTrendsRange] = useState<14 | 30 | 90>(14);
  const [selectedDetailLog, setSelectedDetailLog] = useState<OcdMoodLog | null>(null);
  const [showAllPastLogs, setShowAllPastLogs] = useState<boolean>(false);

  // Split logs into today's logs and past logs
  const { todayLogs, pastLogs } = React.useMemo(() => {
    const now = new Date();
    const tLogs: OcdMoodLog[] = [];
    const pLogs: OcdMoodLog[] = [];

    logs.forEach((log) => {
      const d = new Date(log.createdAt);
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      if (isToday) {
        tLogs.push(log);
      } else {
        pLogs.push(log);
      }
    });

    return { todayLogs: tLogs, pastLogs: pLogs };
  }, [logs]);

  // Filter logs for trends range
  const filteredTrendsLogs = React.useMemo(() => {
    const cutoff = Date.now() - trendsRange * 24 * 60 * 60 * 1000;
    return logs.filter((l) => new Date(l.createdAt).getTime() >= cutoff);
  }, [logs, trendsRange]);

  const handleSelectDateLogs = (logsOnDate: OcdMoodLog[]) => {
    if (logsOnDate.length > 0) {
      setSelectedDetailLog(logsOnDate[0]);
    }
  };

  const formatRelativeDay = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    const timeStr = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

    if (isToday) return `TODAY · ${timeStr}`;
    if (isYesterday) return `YESTERDAY · ${timeStr}`;

    const dateFormatted = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    return `${dateFormatted.toUpperCase()} · ${timeStr}`;
  };

  const renderLogCard = (log: OcdMoodLog) => (
    <motion.div
      key={log.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="ocd-timeline-card"
      onClick={() => setSelectedDetailLog(log)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#64748B' }}>
          {formatRelativeDay(log.createdAt)}
        </span>
        <span className="ocd-moment-impact-tag">
          OCD impact {log.ocdImpact} / 5
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <MoodGlyph level={log.mood} isSelected size={32} />
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#18243A' }}>
          {getMoodLabel(log.mood)}
        </span>
      </div>

      {log.experiences && log.experiences.length > 0 && log.experiences[0] !== 'NONE' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '8px' }}>
          {log.experiences.map((exp) => (
            <span key={exp} className="ocd-moment-chip" style={{ fontSize: '11.5px', padding: '3px 8px' }}>
              {getExperienceLabel(exp)}
            </span>
          ))}
        </div>
      )}

      {log.note && (
        <div style={{ fontSize: '13.5px', fontStyle: 'italic', color: '#475569', lineHeight: 1.45, borderLeft: '2px solid #CBD5E1', paddingLeft: '8px', marginTop: '6px' }}>
          "{log.note}"
        </div>
      )}
    </motion.div>
  );

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Editorial Title */}
      <span className="ocd-mood-badge">{t('badge', { defaultValue: 'SELF-MONITORING RECORD' })}</span>
      <h2 className="ocd-mood-heading" style={{ fontSize: '32px' }}>
        {t('history.title', { defaultValue: 'Your OCD Moments' })}
      </h2>
      <p className="ocd-mood-subcopy" style={{ marginBottom: '14px' }}>
        {t('history.subtitle', { defaultValue: 'A record of how things have felt over time.' })}
      </p>

      {/* Segmented Tab Bar: MOMENTS / TRENDS */}
      <div className="ocd-history-tabs">
        <button
          type="button"
          onClick={() => setHistoryTab('moments')}
          className={`ocd-history-tab-btn ${historyTab === 'moments' ? 'active' : ''}`}
        >
          {t('history.tab_moments', { defaultValue: 'Moments' })}
        </button>
        <button
          type="button"
          onClick={() => setHistoryTab('trends')}
          className={`ocd-history-tab-btn ${historyTab === 'trends' ? 'active' : ''}`}
        >
          {t('history.tab_trends', { defaultValue: 'Trends' })}
        </button>
      </div>

      {/* ================================================================ */}
      {/* TAB 1: MOMENTS (TODAY'S LOG + CALENDAR + PAST LOGS TOGGLE) */}
      {/* ================================================================ */}
      {historyTab === 'moments' && (
        <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* New Check-in Shortcut CTA */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={onStartNewCheckIn}
              className="ocd-mood-btn"
              style={{ padding: '8px 18px', minHeight: '38px', fontSize: '12.5px' }}
            >
              <Plus size={14} />
              <span>{t('history.btn_new_check_in', { defaultValue: 'New Check-In' })}</span>
            </button>
          </div>

          {/* Mini Calendar View */}
          <OcdCalendarView logs={logs} onSelectDateLogs={handleSelectDateLogs} />

          {/* SECTION: TODAY'S LOG ONLY */}
          <div style={{ width: '100%', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.12em', color: '#005387', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '4px' }}>
              {t('history.today_title', { defaultValue: "Today's Log" })}
            </div>

            {todayLogs.length > 0 ? (
              <div className="ocd-timeline-list">
                {todayLogs.map(renderLogCard)}
              </div>
            ) : (
              <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '24px 20px', textAlign: 'center', boxSizing: 'border-box' }}>
                <p style={{ fontSize: '14.5px', color: '#64748B', margin: '0 0 14px 0', fontWeight: 500 }}>
                  {t('history.no_log_today', { defaultValue: 'No check-in logged for today yet.' })}
                </p>
                <button
                  type="button"
                  onClick={onStartNewCheckIn}
                  className="ocd-mood-btn"
                  style={{ padding: '8px 20px', minHeight: '40px', fontSize: '13px' }}
                >
                  <span>{t('history.btn_check_in_now', { defaultValue: "Log today's check-in" })}</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>

          {/* SECTION: BUTTON TO VIEW PAST LOGS */}
          {pastLogs.length > 0 && (
            <div style={{ width: '100%', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setShowAllPastLogs((prev) => !prev)}
                className="ocd-mood-btn secondary"
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  border: '1.5px solid #E2E8F0',
                  background: '#FFFFFF',
                  color: '#18243A',
                  fontSize: '13.5px',
                  fontWeight: 700
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <History size={16} color="#005387" />
                  <span>
                    {showAllPastLogs
                      ? t('history.btn_hide_past', { defaultValue: 'Hide past check-ins' })
                      : t('history.btn_view_past', { count: pastLogs.length, defaultValue: `View past check-ins (${pastLogs.length})` })}
                  </span>
                </div>
                {showAllPastLogs ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              <AnimatePresence>
                {showAllPastLogs && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden', marginTop: '12px' }}
                  >
                    <div className="ocd-timeline-list">
                      {pastLogs.map(renderLogCard)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 2: TRENDS */}
      {/* ================================================================ */}
      {historyTab === 'trends' && (
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <div className="ocd-trends-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontFamily: 'Georgia, serif', color: '#18243A' }}>
                  {t('history.trends_title', { defaultValue: 'Your check-ins' })}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: '#64748B' }}>
                  {t('history.trends_subtitle', { defaultValue: 'See how your entries have varied over time.' })}
                </p>
              </div>

              {/* Time Range Selector */}
              <div className="ocd-trends-filter-pills">
                {([14, 30, 90] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setTrendsRange(r)}
                    className={`ocd-trends-filter-pill ${trendsRange === r ? 'active' : ''}`}
                  >
                    {r}d
                  </button>
                ))}
              </div>
            </div>

            <OcdTrendsVisualizer logs={filteredTrendsLogs} days={trendsRange} />
          </div>
        </div>
      )}

      {/* Detail & Edit Modal */}
      {selectedDetailLog && (
        <OcdEntryDetailModal
          log={selectedDetailLog}
          onClose={() => setSelectedDetailLog(null)}
          onUpdate={async (id, data) => {
            await onUpdateLog(id, data);
            setSelectedDetailLog((prev) => (prev ? { ...prev, ...data } : null));
          }}
          onDelete={async (id) => {
            await onDeleteLog(id);
            setSelectedDetailLog(null);
          }}
        />
      )}
    </div>
  );
}
