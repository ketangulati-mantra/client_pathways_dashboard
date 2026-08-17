import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { useToast } from './Toast';
import {
  ArrowLeft,
  BookOpen,
  Award,
  Clock,
  Play,
  ChevronDown,
  Check,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  Sparkles,
  X,
  ChevronRight,
  Trophy,
  TrendingUp,
  Video as VideoIcon,
  ClipboardList,
  ShieldAlert,
  Smartphone,
  Loader2
} from 'lucide-react';

/* ==========================================================================
   1. BUTTON COMPONENT
   ========================================================================== */
export const Button = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  className = '',
  icon: Icon = null,
  ...props
}) => {
  return (
    <button
      className={`btn-academy btn-academy-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

import { goToDashboard, goBack, handleExit, navigateToNativeScreen } from '../mantra/navigation';

/* ==========================================================================
   2. LESSON HEADER COMPONENT
   ========================================================================== */
export const Header = ({
  title,
  progress = null,
  points = null,
  onBack,
  isCompleted = false
}) => {
  const { t } = useTranslation('shared');
  const isDone = isCompleted || progress === 100;

  return (
    <header className="academy-header">
      <div className="academy-header-top">
        <button
          className="academy-header-back-btn"
          onClick={() => goBack(onBack)}
          aria-label="Go back to dashboard"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="academy-header-logo">
          <img src="https://res.cloudinary.com/hxbamdqf/image/upload/v1784698269/Mantra_logo_yptwwe.svg" alt="Mantra Logo" style={{ height: '24px', display: 'block' }} />
        </div>

        <div style={{ width: 40 }} /> {/* balance back button */}
      </div>

      <div className="academy-header-title-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <h1 className="academy-header-title" style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span>{title}</span>
          {isDone && (
            <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} color="#15803d" /> Completed
            </span>
          )}
        </h1>
        {points !== null && (
          <span className="overview-meta-badge points" style={{ marginLeft: 'auto', padding: '4px 10px', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <Award size={14} style={{ color: 'var(--color-accent-orange)', flexShrink: 0 }} />
            <span>{t('header.points_earned', { points })}</span>
          </span>
        )}
      </div>

      {progress !== null && (
        <Progress value={progress} />
      )}
    </header>
  );
};

/* ==========================================================================
   3. PROGRESS INDICATOR
   ========================================================================== */
export const Progress = ({ value = 0 }) => {
  const { t } = useTranslation('shared');

  const roundedValue = Math.min(Math.max(Math.round(value), 0), 100);

  return (
    <div className="academy-progress-container">
      <div className="academy-progress-bar-bg">
        <div
          className="academy-progress-bar-fill"
          style={{ width: `${roundedValue}%` }}
        />
      </div>
      <div className="academy-progress-meta">
        <span>{t('progress.lesson_progress')}</span>
        <span>{t('progress.completed', { percent: roundedValue })}</span>
      </div>
    </div>
  );
};

/* ==========================================================================
   4. LESSON OVERVIEW CARD
   ========================================================================== */
export const OverviewCard = ({
  title = "About this Lesson",
  description,
  duration,
  points,
  className = ""
}) => {
  const { t } = useTranslation('shared');

  return (
    <div className={`academy-card academy-overview-card ${className}`}>
      <h3 className="overview-title">{title}</h3>
      <p className="overview-desc">{description}</p>

      <div className="overview-meta-grid">
        {duration && (
          <div className="overview-meta-badge">
            <Clock size={14} />
            <span>{duration}</span>
          </div>
        )}
        {points && (
          <div className="overview-meta-badge points">
            <Award size={14} />
            {t('overview.points', { points })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ==========================================================================
   5. VIDEO SECTION
   ========================================================================== */
export const VideoSection = ({
  title,
  duration,
  posterUrl = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
  videoUrl = null,
  onPlay,
  onCompleted,
  isCompleted
}) => {
  const { t } = useTranslation('shared');

  const [isPlaying, setIsPlaying] = useState(false);
  const iframeRef = useRef(null);

  const handlePlayClick = () => {
    setIsPlaying(true);
    if (onPlay) onPlay();
    if (onCompleted && !isCompleted) onCompleted();
  };

  const isYouTube = videoUrl && (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be'));
  const isVimeo = videoUrl && videoUrl.includes('vimeo.com');

  const getEmbedUrl = () => {
    if (!videoUrl) return '';
    if (isYouTube) {
      return `${videoUrl.replace('watch?v=', 'embed/')}${videoUrl.includes('?') ? '&' : '?'}autoplay=1`;
    }
    if (isVimeo) {
      const match = videoUrl.match(/vimeo\.com\/(\d+)/);
      return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : videoUrl;
    }
    return videoUrl;
  };

  return (
    <div className="academy-video-container">
      {!isPlaying ? (
        <>
          <img src={posterUrl} alt="Video thumbnail" className="academy-video-poster" />
          <div className="academy-video-gradient-overlay" />
          <button
            className="academy-video-play-btn"
            onClick={handlePlayClick}
            aria-label="Play Lesson Video"
          >
            <Play size={32} fill="currentColor" />
          </button>

          <div className="academy-video-overlay-info">
            <h4>{title}</h4>
            <p>{t('video.lesson_duration', { duration })}</p>
          </div>
        </>
      ) : (
        <div style={{ width: '100%', height: '100%' }}>
          {videoUrl ? (
            (isYouTube || isVimeo) ? (
              <iframe
                ref={isVimeo ? iframeRef : null}
                width="100%"
                height="100%"
                src={getEmbedUrl()}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ border: 'none', display: 'block' }}
              />
            ) : (
              <video
                src={videoUrl}
                controls
                autoPlay
                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', display: 'block' }}
              />
            )
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1e293b, #0f172a)',
              color: '#fff',
              padding: '20px'
            }}>
              <Loader2 className="spinner" size={40} style={{ color: 'var(--color-primary-light)', marginBottom: '16px' }} />
              <h4 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{t('video.streaming')}</h4>
              <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '8px' }}>{t('video.simulation')}</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPlaying(false)}
                style={{ marginTop: '16px', padding: '6px 12px', fontSize: '0.8rem' }}
              >
                {t('video.reset')}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   6. INFORMATION CARDS
   ========================================================================== */
export const InfoCard = ({
  title,
  description,
  icon: Icon = BookOpen,
  className = ""
}) => {
  return (
    <div className={`academy-card academy-info-card ${className}`}>
      <div className="info-card-header">
        <div className="info-card-icon-container">
          <Icon size={20} />
        </div>
        <h4 className="info-card-title">{title}</h4>
      </div>
      <p className="info-card-body">{description}</p>
    </div>
  );
};

/* ==========================================================================
   7. EXPANDABLE CARDS (ACCORDION)
   ========================================================================== */
export const ExpandableCard = ({
  title,
  children,
  isOpenDefault = false
}) => {
  const [isOpen, setIsOpen] = useState(isOpenDefault);

  return (
    <div className={`academy-accordion-item ${isOpen ? 'active' : ''}`}>
      <button
        className="academy-accordion-header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <ChevronDown size={20} className="academy-accordion-icon" />
      </button>

      <div className="academy-accordion-content">
        <div className="academy-accordion-body">
          {children}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   8. INTERACTIVE CHECKLIST
   ========================================================================== */
export const Checklist = ({
  items = [],
  onChange
}) => {
  const [checkedIds, setCheckedIds] = useState([]);

  const handleToggle = (id) => {
    let updated;
    if (checkedIds.includes(id)) {
      updated = checkedIds.filter(item => item !== id);
    } else {
      updated = [...checkedIds, id];
    }
    setCheckedIds(updated);
    if (onChange) {
      onChange(updated, items.length);
    }
  };

  return (
    <div className="academy-checklist">
      {items.map((item) => {
        const isChecked = checkedIds.includes(item.id);
        return (
          <div
            key={item.id}
            className={`checklist-item ${isChecked ? 'checked' : ''}`}
            onClick={() => handleToggle(item.id)}
          >
            <div className="checklist-checkbox" aria-hidden="true">
              <Check size={16} strokeWidth={3} />
            </div>

            <div className="checklist-content text-left">
              <span className="checklist-label">{item.label}</span>
              {item.helpText && <span className="checklist-help">{item.helpText}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ==========================================================================
   9. TIMELINE COMPONENT
   ========================================================================== */
export const Timeline = ({
  steps = [],
  currentStepIndex = 0
}) => {
  return (
    <div className="academy-timeline">
      {steps.map((step, idx) => {
        const isActive = idx === currentStepIndex;
        const isCompleted = idx < currentStepIndex;

        let statusClass = '';
        if (isActive) statusClass = 'active';
        else if (isCompleted) statusClass = 'completed';

        return (
          <div key={idx} className={`timeline-step ${statusClass}`}>
            <div className="timeline-node">
              {isCompleted ? (
                <Check size={12} strokeWidth={3} />
              ) : (
                <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{idx + 1}</span>
              )}
            </div>

            <div className="timeline-step-content">
              <span className="timeline-step-title">{step.title}</span>
              {step.description && <span className="timeline-step-desc">{step.description}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ==========================================================================
   10. SCENARIO CARD
   ========================================================================== */
export const ScenarioCard = ({
  scenario,
  options = [],
  onSelectOption
}) => {
  const { t } = useTranslation('shared');

  const [selectedId, setSelectedId] = useState(null);

  const handleSelect = (option) => {
    setSelectedId(option.id);
    if (onSelectOption) {
      onSelectOption(option);
    }
  };

  return (
    <div className="academy-card academy-scenario-card text-left">
      <span className="scenario-badge">{t('scenario.badge')}</span>
      <p className="scenario-prompt">{scenario}</p>

      <div className="scenario-options">
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          return (
            <button
              key={option.id}
              className={`scenario-option-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              <span>{option.text}</span>
              <ChevronRight size={18} />
            </button>
          );
        })}
      </div>

      {selectedId !== null && options.find(o => o.id === selectedId)?.feedback && (
        <div className="scenario-feedback">
          <strong>{t('scenario.outcome')}</strong>
          {options.find(o => o.id === selectedId).feedback}
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   11. QUIZ COMPONENT
   ========================================================================== */
export const QuizCard = ({
  id,
  question,
  options = [],
  questions = [],
  onSubmitQuiz,
  onComplete,
  hasVideo = false,
  videoWatched = false
}) => {
  const { t } = useTranslation('shared');

  const { showToast } = useToast();
  const isMulti = questions && questions.length > 0;
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [selectedIndices, setSelectedIndices] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelectSingle = (idx) => {
    if (isSubmitted) return;
    setSelectedIdx(idx);
  };

  const handleSelectMulti = (qIdx, optIdx) => {
    if (isSubmitted) return;
    setSelectedIndices(prev => ({
      ...prev,
      [qIdx]: optIdx
    }));
  };

  const handleSubmit = () => {
    if (isSubmitted) return;
    if (isMulti) {
      if (Object.keys(selectedIndices).length < questions.length) return;
      setIsSubmitted(true);
    } else {
      if (selectedIdx === null) return;
      setIsSubmitted(true);
    }
  };

  const handleSubmitDone = () => {
    if (hasVideo && !videoWatched) {
      showToast(t('quiz.warning_watch_video'), 'warning', 3000);
      setIsSubmitted(false);
      return;
    }
    if (onSubmitQuiz) onSubmitQuiz(true);
    if (onComplete) onComplete(true);
  };

  const handleReset = () => {
    setSelectedIdx(null);
    setSelectedIndices({});
    setIsSubmitted(false);
  };

  // Score count helper
  const getScore = () => {
    let score = 0;
    questions.forEach((q, qIdx) => {
      const selectedOptIdx = selectedIndices[qIdx];
      if (q.options[selectedOptIdx]?.isCorrect) {
        score++;
      }
    });
    return score;
  };

  if (isMulti) {
    return (
      <div className="academy-card academy-quiz-card text-left animate-fade-in" style={{ borderTop: '4px solid var(--color-primary)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '24px' }}>
          {t('quiz.mcq_title')}
        </h2>

        {!isSubmitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {questions.map((q, qIdx) => (
              <div key={qIdx} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {q.question}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '4px' }}>
                  {q.options.map((option, optIdx) => {
                    const isSelected = selectedIndices[qIdx] === optIdx;
                    return (
                      <label
                        key={optIdx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          fontSize: '0.95rem',
                          color: 'var(--text-secondary)',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        <input
                          type="radio"
                          name={`question_${id}_${qIdx}`}
                          checked={isSelected}
                          onChange={() => handleSelectMulti(qIdx, optIdx)}
                          style={{
                            width: '18px',
                            height: '18px',
                            accentColor: 'var(--color-primary)',
                            cursor: 'pointer'
                          }}
                        />
                        <span>{option.text}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}

            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={Object.keys(selectedIndices).length < questions.length}
              style={{ alignSelf: 'flex-start', marginTop: '10px', padding: '12px 32px' }}
            >{t('quiz.submit')}</Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-scale-in">
            <div>
              <p style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 500, marginBottom: '12px' }}>
                {t('quiz.thank_you')}
              </p>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {t('quiz.score', { score: getScore(), total: questions.length })}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
              {questions.map((q, qIdx) => {
                const selectedOptIdx = selectedIndices[qIdx];
                const selectedOption = q.options[selectedOptIdx];
                const correctOption = q.options.find(o => o.isCorrect);

                return (
                  <div key={qIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      Q. {q.question}
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      <strong>{t('quiz.correct_answer')}</strong>{correctOption?.text}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: selectedOption?.isCorrect ? 'var(--color-success)' : 'var(--color-error)' }}>
                      <strong>{t('quiz.your_answer')}</strong>{selectedOption?.text || t('quiz.not_answered')}
                    </p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '10px' }}>
              {getScore() === questions.length ? (
                <Button
                  variant="primary"
                  onClick={handleSubmitDone}
                  style={{ padding: '12px 32px' }}
                >{t('quiz.done')}</Button>
              ) : null}

              {getScore() !== questions.length && (
                <Button
                  variant="secondary"
                  onClick={handleReset}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    background: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >{t('quiz.try_again')}</Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Single Question Legacy Rendering
  const selectedOption = selectedIdx !== null ? options[selectedIdx] : null;

  return (
    <div className="academy-card academy-quiz-card text-left animate-fade-in">
      <span className="quiz-question-number">{t('quiz.practice_question')}</span>
      <h3 className="quiz-question-text">{question}</h3>

      <div className="quiz-options">
        {options.map((option, idx) => {
          let optionClass = '';
          if (idx === selectedIdx) {
            optionClass = 'selected';
          }
          if (isSubmitted) {
            if (option.isCorrect) {
              optionClass = 'correct';
            } else if (idx === selectedIdx) {
              optionClass = 'incorrect';
            }
          }

          return (
            <div
              key={idx}
              className={`quiz-option ${optionClass}`}
              onClick={() => handleSelectSingle(idx)}
            >
              <div className="quiz-option-radio" />
              <span>{option.text}</span>
            </div>
          );
        })}
      </div>

      {!isSubmitted ? (
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={selectedIdx === null}
          style={{ alignSelf: 'flex-start', marginTop: '10px' }}
        >{t('quiz.submit_answer')}</Button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
          <div className={`quiz-feedback-box ${selectedOption?.isCorrect ? 'correct' : 'incorrect'}`}>
            {selectedOption?.isCorrect ? (
              <>
                <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
                <div>
                  <strong>{t('quiz.correct')}</strong>
                  {selectedOption.feedback || t('quiz.default_correct_feedback')}
                </div>
              </>
            ) : (
              <>
                <AlertCircle size={20} style={{ flexShrink: 0 }} />
                <div>
                  <strong>{t('quiz.incorrect')}</strong>
                  {selectedOption?.feedback || t('quiz.default_incorrect_feedback')}
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {selectedOption?.isCorrect ? (
              <Button
                variant="primary"
                onClick={handleSubmitDone}
                style={{ padding: '10px 24px' }}
              >{t('quiz.done')}</Button>
            ) : null}

            {!selectedOption?.isCorrect && (
              <Button
                variant="secondary"
                onClick={handleReset}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  background: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >{t('quiz.try_again')}</Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   12. ACHIEVEMENT / COMPLETION SCREEN
   ========================================================================== */
export const CompletionScreen = ({
  points,
  rewardPoints,
  title,
  subtitle,
  onClose
}) => {
  const { t } = useTranslation('shared');
  const actualPoints = rewardPoints !== undefined ? rewardPoints : (points !== undefined ? points : 10);

  const displayTitle = title || t('completion.title') || 'Task Complete!';
  const displaySubtitle = subtitle || t('completion.subtitle') || 'You have successfully finished this task.';

  // Generate random confetti pieces positions
  const confettiCount = 30;
  const confettiArray = Array.from({ length: confettiCount });

  // Freeze scroll on mount, restore on unmount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return createPortal(
    <div className="academy-completion-overlay">
      {/* Confetti Animation */}
      {confettiArray.map((_, idx) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 3;
        const color = ['#ff9e00', '#009fe3', '#7f22d0', '#10b981', '#ef4444'][Math.floor(Math.random() * 5)];
        const size = Math.random() * 8 + 4;

        return (
          <div
            key={idx}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              animationDelay: `${delay}s`,
              backgroundColor: color,
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '0'
            }}
          />
        );
      })}

      <div className="academy-completion-card">
        <div className="completion-icon-wrapper">
          <Trophy size={28} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 className="completion-title">{displayTitle}</h2>
          <p className="completion-desc">{displaySubtitle}</p>
        </div>

        <div className="completion-points-badge animate-scale-in">
          <Sparkles size={16} fill="currentColor" />
          <span>+{actualPoints} POINTS</span>
        </div>



        <Button
          variant="primary"
          onClick={() => {
            if (onClose) {
              onClose();
            } else {
              navigateToNativeScreen('Home');
              handleExit();
            }
          }}
          style={{ width: '100%', marginTop: '8px' }}
        >
          Take to portal
        </Button>

      </div>
    </div>,
    document.body
  );
};

/* ==========================================================================
   13. BOTTOM NAVIGATION
   ========================================================================== */
export const BottomNav = ({
  activeTab = 'academy',
  onTabChange
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: ClipboardList },
    { id: 'academy', label: 'Academy', icon: BookOpen },
    { id: 'rankings', label: 'Rankings', icon: Trophy }
  ];

  return (
    <nav className="academy-bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            onClick={() => onTabChange && onTabChange(tab.id)}
          >
            <Icon size={20} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

/* ==========================================================================
   14. SYSTEM FEEDBACK STATES
   ========================================================================== */
export const FeedbackStates = ({
  type = 'loading',
  title,
  description,
  onRetry
}) => {
  if (type === 'loading') {
    return (
      <div className="academy-state-container academy-state-loading">
        <div className="state-icon-container">
          <Loader2 className="spinner" size={32} />
        </div>
        <h4 className="state-title">{title || "Loading Lesson..."}</h4>
        <p className="state-desc">{description || "Setting up your custom sandbox study plan. Please wait."}</p>
      </div>
    );
  }

  if (type === 'empty') {
    return (
      <div className="academy-state-container academy-state-empty">
        <div className="state-icon-container">
          <BookOpen size={32} />
        </div>
        <h4 className="state-title">{title || "No Content Available"}</h4>
        <p className="state-desc">{description || "There are no tasks or lessons assigned to your portal profile at this time."}</p>
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="academy-state-container academy-state-error">
        <div className="state-icon-container">
          <ShieldAlert size={32} />
        </div>
        <h4 className="state-title">{title || "Connection Error"}</h4>
        <p className="state-desc">{description || "Failed to load Academy portal data. Check your network or credentials."}</p>
        {onRetry && (
          <Button variant="secondary" onClick={onRetry} style={{ marginTop: '8px' }}>
            Reload Session
          </Button>
        )}
      </div>
    );
  }

  return null;
};

/* ==========================================================================
   ACADEMY TEMPLATE COMPONENTS
   ========================================================================== */

import ErrorBoundary from './ErrorBoundary';

export { ErrorBoundary };

export const LessonHero = ({ theme = 'primary', icon: Icon, category, title, description, duration, points }) => {
  return (
    <div className={`academy-hero-card theme-${theme}`}>
      <div className="hero-icon-wrapper">
        {Icon && <Icon size={24} />}
      </div>
      <div className="hero-category">{category}</div>
      <h1 className="hero-title">{title}</h1>
      {description && <p className="hero-desc">{description}</p>}

      {(duration || points !== undefined) && (
        <div className="hero-meta-chips">
          {category && (
            <span className="hero-chip">
              <ClipboardList size={14} /> {category}
            </span>
          )}
          {duration && (
            <span className="hero-chip">
              <Clock size={14} /> {duration}
            </span>
          )}
          {points !== undefined && (
            <span className="hero-chip points">
              <Trophy size={14} /> +{points} Points
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const StepTimeline = ({ steps = [] }) => {
  return (
    <div className="academy-timeline">
      {steps.map((step, idx) => (
        <div key={idx} className="timeline-item">
          <div className="timeline-marker">{idx + 1}</div>
          <div className="timeline-content">
            <h4 className="timeline-title">{step.title}</h4>
            {step.description && <p className="timeline-desc">{step.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export const FeatureGrid = ({ features = [] }) => {
  return (
    <div className="academy-feature-grid">
      {features.map((feat, idx) => (
        <div key={idx} className="feature-card">
          <div className="feature-icon">{feat.icon && <feat.icon size={24} />}</div>
          <h4 className="feature-title">{feat.title}</h4>
          {feat.description && <p className="feature-desc">{feat.description}</p>}
        </div>
      ))}
    </div>
  );
};

export const BenefitCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="academy-benefit-card">
      <div className="benefit-icon">{Icon && <Icon size={24} />}</div>
      <div className="benefit-content">
        <h4 className="benefit-title">{title}</h4>
        {description && <p className="benefit-desc">{description}</p>}
      </div>
    </div>
  );
};


export const InfoCallout = ({ type = 'info', title, text }) => {
  const Icon = type === 'warning' ? AlertCircle : (type === 'tip' ? Sparkles : HelpCircle);
  return (
    <div className={`academy-callout callout-${type}`}>
      <Icon size={24} className="callout-icon" />
      <div className="callout-content">
        {title && <h4 className="callout-title">{title}</h4>}
        {text && <p className="callout-text">{text}</p>}
      </div>
    </div>
  );
};

export const CompletionCard = ({ onComplete, points = 5, buttonText = "✓ Mark Lesson as Complete", isComplete = false }) => {
  if (isComplete) return null;
  return (
    <div className="academy-completion-card">
      <div className="completion-card-inner">
        <h3 className="completion-title">Ready to complete this lesson?</h3>
        <p className="completion-desc">Click below to mark this activity as completed and earn your points.</p>
        <Button
          variant="primary"
          onClick={onComplete}
          className="completion-btn"
          style={{ width: '100%', marginBottom: '12px' }}
        >
          {buttonText}
        </Button>
        <div className="completion-points-badge">
          <Award size={16} />
          <span>+{points} Points</span>
        </div>
      </div>
    </div>
  );
};

export { ToastProvider, useToast } from './Toast';

export { default as SubmissionForm } from './forms/SubmissionForm';
export { default as InterestForm } from './forms/InterestForm';

