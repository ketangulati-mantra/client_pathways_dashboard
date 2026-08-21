import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  PictureInPicture,
  RotateCcw,
  RotateCw
} from 'lucide-react';

export default function CustomVideoPlayer({ videoUrl, posterUrl, onEnded }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const hideControlsTimeout = useRef(null);

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(console.error);
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || isScrubbing) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration || 0);
  };

  // Seek logic based on click or drag position
  const seekToPosition = useCallback((clientX) => {
    if (!progressBarRef.current || !videoRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetTime = pos * duration;
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  }, [duration]);

  // Forward / Rewind delta
  const skipSeconds = (delta) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration || 1000, videoRef.current.currentTime + delta));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    showControlsTemporarily();
  };

  const handlePointerDown = (e) => {
    setIsScrubbing(true);
    seekToPosition(e.clientX);

    const onPointerMove = (moveEvent) => {
      seekToPosition(moveEvent.clientX);
    };

    const onPointerUp = (upEvent) => {
      setIsScrubbing(false);
      seekToPosition(upEvent.clientX);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume || 1;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleSpeedSelect = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.error('PiP error', err);
    }
  };

  const showControlsTemporarily = () => {
    setIsControlsVisible(true);
    if (hideControlsTimeout.current) clearTimeout(hideControlsTimeout.current);
    if (isPlaying && !isScrubbing) {
      hideControlsTimeout.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 2500);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight' || e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        skipSeconds(5);
      } else if (e.key === 'ArrowLeft' || e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        skipSeconds(-5);
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, volume, duration]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={showControlsTemporarily}
      onMouseEnter={() => setIsControlsVisible(true)}
      onMouseLeave={() => isPlaying && !isScrubbing && setIsControlsVisible(false)}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        background: '#090d16',
        borderRadius: isFullscreen ? '0px' : '18px',
        overflow: 'hidden',
        boxShadow: isFullscreen ? 'none' : '0 12px 36px rgba(15, 23, 42, 0.12)',
        border: isFullscreen ? 'none' : '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        playsInline
        preload="metadata"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          cursor: 'pointer'
        }}
      />

      {/* Floating Big Play Button When Paused */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          aria-label="Play video"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(37, 99, 235, 0.94)',
            border: '3px solid rgba(255, 255, 255, 0.9)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)',
            transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 4
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)')}
        >
          <Play size={28} fill="currentColor" style={{ marginLeft: '4px' }} />
        </button>
      )}

      {/* Custom Bottom Controls Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px 16px 10px',
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.4) 60%, transparent)',
          opacity: isControlsVisible || !isPlaying || isScrubbing ? 1 : 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: isControlsVisible || !isPlaying || isScrubbing ? 'auto' : 'none',
          zIndex: 5,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        {/* Generous Hit-Area Scrubbable Progress Timeline */}
        <div
          ref={progressBarRef}
          onPointerDown={handlePointerDown}
          style={{
            position: 'relative',
            width: '100%',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            touchAction: 'none'
          }}
        >
          {/* Track background */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: isScrubbing ? '6px' : '4px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '9999px',
              transition: 'height 0.15s ease'
            }}
          >
            {/* Filled progress */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${progressPercent}%`,
                background: '#2563eb',
                borderRadius: '9999px'
              }}
            />
            {/* Scrubber handle */}
            <div
              style={{
                position: 'absolute',
                left: `${progressPercent}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: isScrubbing ? '14px' : '11px',
                height: isScrubbing ? '14px' : '11px',
                borderRadius: '50%',
                background: '#ffffff',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
                transition: 'width 0.15s ease, height 0.15s ease'
              }}
            />
          </div>
        </div>

        {/* Lower Controls Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#ffffff' }}>
          {/* Left Controls (Play, Skip, Volume, Time) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={togglePlay}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={19} /> : <Play size={19} fill="currentColor" />}
            </button>

            {/* Quick Skip Backward 5s */}
            <button
              onClick={() => skipSeconds(-5)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                opacity: 0.9
              }}
              title="Rewind 5s (←)"
              aria-label="Rewind 5 seconds"
            >
              <RotateCcw size={16} />
            </button>

            {/* Quick Skip Forward 5s */}
            <button
              onClick={() => skipSeconds(5)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                opacity: 0.9
              }}
              title="Forward 5s (→)"
              aria-label="Forward 5 seconds"
            >
              <RotateCw size={16} />
            </button>

            {/* Volume Control */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
              <button
                onClick={toggleMute}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                aria-label="Mute"
              >
                {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                style={{
                  width: '46px',
                  accentColor: '#2563eb',
                  cursor: 'pointer',
                  height: '3px'
                }}
              />
            </div>

            {/* Timestamp */}
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.92)',
              whiteSpace: 'nowrap',
              marginLeft: '4px'
            }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls (Speed, PiP, Fullscreen) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
            {/* Speed Selector */}
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                borderRadius: '6px',
                padding: '2px 8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {playbackSpeed}x
            </button>

            {/* Speed Popover Menu */}
            {showSpeedMenu && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '36px',
                  right: '50px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  zIndex: 20,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                }}
              >
                {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSpeedSelect(s)}
                    style={{
                      background: playbackSpeed === s ? '#2563eb' : 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            )}

            {/* Picture-in-Picture */}
            <button
              onClick={togglePiP}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Picture in picture"
              aria-label="Picture in picture"
            >
              <PictureInPicture size={17} />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              style={{
                background: 'none',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Fullscreen (f)"
              aria-label="Fullscreen"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
