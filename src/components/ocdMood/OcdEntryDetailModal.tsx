import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Edit3, Check } from 'lucide-react';
import MoodGlyph from './MoodGlyph';
import {
  OcdMoodLog,
  getMoodLabel,
  getExperienceLabel,
  MOOD_LEVELS,
  OCD_EXPERIENCE_OPTIONS
} from '../../services/ocdMoodService';

interface OcdEntryDetailModalProps {
  log: OcdMoodLog | null;
  onClose: () => void;
  onUpdate: (id: string | number, updatedData: { mood: number; ocdImpact: number; experiences: string[]; note: string }) => Promise<void>;
  onDelete: (id: string | number) => Promise<void>;
}

export default function OcdEntryDetailModal({
  log,
  onClose,
  onUpdate,
  onDelete
}: OcdEntryDetailModalProps) {
  if (!log) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit form state
  const [editMood, setEditMood] = useState(log.mood);
  const [editImpact, setEditImpact] = useState(log.ocdImpact);
  const [editExperiences, setEditExperiences] = useState<string[]>(log.experiences || []);
  const [editNote, setEditNote] = useState(log.note || '');

  const dateObj = new Date(log.createdAt);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  });

  const handleToggleExperience = (expId: string) => {
    if (expId === 'NONE') {
      setEditExperiences(['NONE']);
      return;
    }
    setEditExperiences((prev) => {
      const filtered = prev.filter((x) => x !== 'NONE');
      if (filtered.includes(expId)) {
        const next = filtered.filter((x) => x !== expId);
        return next.length === 0 ? ['NONE'] : next;
      }
      return [...filtered, expId];
    });
  };

  const handleSaveEdit = async () => {
    try {
      setIsSubmitting(true);
      await onUpdate(log.id, {
        mood: editMood,
        ocdImpact: editImpact,
        experiences: editExperiences.length > 0 ? editExperiences : ['NONE'],
        note: editNote.trim()
      });
      setIsEditing(false);
    } catch (e) {
      console.error('Update error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await onDelete(log.id);
      onClose();
    } catch (e) {
      console.error('Delete error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ocd-modal-overlay" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="ocd-modal-card"
        style={{ position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-Right Small Round Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="ocd-modal-close-btn"
        >
          <X size={14} strokeWidth={2.4} />
        </button>

        {/* Header with Title */}
        <div style={{ marginBottom: '16px', paddingRight: '36px' }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, letterSpacing: '0.12em', color: '#64748B', textTransform: 'uppercase' }}>
            {formattedDate} · {formattedTime}
          </div>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', fontFamily: 'Georgia, serif', color: '#18243A' }}>
            {isEditing ? 'Edit Moment' : 'Moment Detail'}
          </h3>
        </div>

        {/* Read-Only View */}
        {!isEditing && (
          <div>
            {/* Mood & Impact Header Card */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '14px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MoodGlyph level={log.mood} isSelected size={40} />
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#18243A' }}>
                    {getMoodLabel(log.mood)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Mood level {log.mood} of 5
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: '#0369A1', textTransform: 'uppercase' }}>
                  OCD Impact
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#005387' }}>
                  {log.ocdImpact} <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 500 }}>/ 5</span>
                </div>
              </div>
            </div>

            {/* Experiences */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                What stood out
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {log.experiences && log.experiences.length > 0 ? (
                  log.experiences.map((exp) => (
                    <span key={exp} className="ocd-moment-chip">
                      {getExperienceLabel(exp)}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '13.5px', color: '#94A3B8', fontStyle: 'italic' }}>None selected</span>
                )}
              </div>
            </div>

            {/* Note */}
            {log.note && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                  Note
                </div>
                <div style={{ background: '#FAFAFA', borderLeft: '3px solid #005387', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', color: '#334155', fontStyle: 'italic', lineHeight: 1.5 }}>
                  "{log.note}"
                </div>
              </div>
            )}

            {/* Actions: Edit / Delete */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
              {isConfirmingDelete ? (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: '#BE123C', fontWeight: 600 }}>Confirm delete?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isSubmitting}
                    style={{ background: '#BE123C', color: '#FFFFFF', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    style={{ background: '#E2E8F0', color: '#334155', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '13px', padding: '6px 0' }}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="ocd-mood-btn"
                style={{ padding: '8px 16px', minHeight: '38px', fontSize: '12px', marginLeft: 'auto' }}
              >
                <Edit3 size={13} />
                <span>Edit Moment</span>
              </button>
            </div>
          </div>
        )}

        {/* Edit Form View */}
        {isEditing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Mood selector */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '8px' }}>
                MOOD
              </label>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'space-between' }}>
                {MOOD_LEVELS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setEditMood(m.value)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      borderRadius: '10px',
                      border: editMood === m.value ? '2px solid #005387' : '1px solid #E2E8F0',
                      background: editMood === m.value ? '#F0F9FF' : '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <MoodGlyph level={m.value} isSelected={editMood === m.value} size={28} />
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: editMood === m.value ? '#005387' : '#64748B' }}>
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Impact Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                  OCD IMPACT TODAY
                </label>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#005387' }}>{editImpact} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={editImpact}
                onChange={(e) => setEditImpact(Number(e.target.value))}
                className="ocd-impact-slider"
              />
            </div>

            {/* Experiences Multi-select Chips */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '8px' }}>
                WHAT STOOD OUT
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {OCD_EXPERIENCE_OPTIONS.map((opt) => {
                  const isSelected = editExperiences.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleToggleExperience(opt.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: isSelected ? '1.5px solid #005387' : '1px solid #E2E8F0',
                        background: isSelected ? '#F0F9FF' : '#FFFFFF',
                        color: isSelected ? '#005387' : '#475569',
                        cursor: 'pointer'
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note input */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '6px' }}>
                NOTE
              </label>
              <textarea
                value={editNote}
                onChange={(e) => setEditNote(e.target.value.slice(0, 500))}
                className="ocd-note-textarea"
                style={{ minHeight: '80px' }}
                placeholder="Write a note..."
              />
            </div>

            {/* Form actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="ocd-mood-btn secondary"
                style={{ padding: '8px 18px', minHeight: '38px', fontSize: '12px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="ocd-mood-btn"
                style={{ padding: '8px 20px', minHeight: '38px', fontSize: '12px' }}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
