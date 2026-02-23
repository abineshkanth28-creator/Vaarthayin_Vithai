
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { useLanguage } from '../LanguageContext';

interface AudioPlayerProps {
  message: Message;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  message, 
  onNext, 
  onPrevious,
  hasNext = false,
  hasPrevious = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showFeedback, setShowFeedback] = useState<'forward' | 'backward' | null>(null);
  const { t } = useLanguage();

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = useCallback(async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          setError(null);
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            await playPromise;
            setIsPlaying(true);
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Audio playback error:', err);
          setError(t.errorOccurred || 'Playback error');
        }
      }
    }
  }, [isPlaying, t]);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
        // Don't set src to empty here as it can cause "no supported sources" errors on quick navigation
        // Just pause is usually enough for cleanup
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load(); // Force reload when URL changes
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setError(null);
          })
          .catch((err) => {
            if (err.name !== 'AbortError') {
              console.error('Auto-play error:', err);
            }
          });
      }
    }
  }, [message.audioUrl]);

  const onAudioError = () => {
    const audio = audioRef.current;
    if (audio && audio.error) {
      console.error('Audio element error:', audio.error);
      let msg = 'Failed to load audio.';
      switch (audio.error.code) {
        case 1: msg = 'Aborted'; break;
        case 2: msg = 'Network error'; break;
        case 3: msg = 'Decoding error'; break;
        case 4: msg = 'Source not supported or invalid link'; break;
      }
      setError(msg);
      setIsPlaying(false);
    }
  };

  const skipTime = (amount: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += amount;
      setShowFeedback(amount > 0 ? 'forward' : 'backward');
      setTimeout(() => setShowFeedback(null), 500);
    }
  };

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 1.5, 2, 0.75];
    const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    setPlaybackSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/message/${message.id}`;
    const shareData = {
      title: message.title,
      text: `${t.appTitle}: ${message.title}\n${message.subtitle || ''}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback for desktop or non-supported browsers
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert(t.linkCopied);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  useEffect(() => {
    // Media Session API for Lock Screen Controls
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: message.title,
        artist: t.appTitle,
        album: message.subtitle || t.messages,
        artwork: [
          { src: message.thumbnail, sizes: '512x512', type: 'image/png' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', handlePlayPause);
      navigator.mediaSession.setActionHandler('pause', handlePlayPause);
      navigator.mediaSession.setActionHandler('seekbackward', () => skipTime(-10));
      navigator.mediaSession.setActionHandler('seekforward', () => skipTime(10));
    }
  }, [message, handlePlayPause, t]);

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Double tap detection logic
  const lastTapRef = useRef<{ time: number; side: 'left' | 'right' | null }>({ time: 0, side: null });
  const handleTouch = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const side = x - rect.left < rect.width / 2 ? 'left' : 'right';

    if (now - lastTapRef.current.time < 300 && lastTapRef.current.side === side) {
      skipTime(side === 'left' ? -10 : 10);
    }
    lastTapRef.current = { time: now, side };
  };

  return (
    <div className="flex flex-col h-full px-6 pt-4 pb-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Cover Art with Gesture Area */}
      <div 
        className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-2xl bg-slate-200 group"
        onClick={handleTouch}
      >
        <img 
          src={message.thumbnail} 
          alt={message.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Gesture Overlays */}
        {showFeedback && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-none">
            <div className="bg-white/90 p-4 rounded-full shadow-lg animate-ping">
              <span className="text-2xl font-bold text-indigo-600">
                {showFeedback === 'forward' ? '+10s' : '-10s'}
              </span>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
      </div>

      {/* Info with Share Button */}
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2 flex-1">
          <h2 className="text-2xl font-bold text-slate-800 leading-tight">
            {message.title}
          </h2>
          {message.subtitle && (
            <p className="text-indigo-600 font-medium">{message.subtitle}</p>
          )}
          <p className="text-slate-400 text-sm font-medium">{message.date}</p>
        </div>
        <button 
          onClick={handleShare}
          className="p-3 rounded-2xl bg-slate-50 text-indigo-600 hover:bg-indigo-50 transition-colors border border-slate-100"
          aria-label={t.share}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        {error && (
          <div className="bg-red-50 border border-red-100 p-3 rounded-xl mb-2">
            <p className="text-xs text-red-600 font-bold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </p>
            <a 
              href={message.audioUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[10px] text-indigo-600 underline mt-1 block font-bold"
            >
              Try opening link directly
            </a>
          </div>
        )}
        <input 
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={onSeek}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-xs font-bold text-slate-400 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button 
          onClick={cycleSpeed}
          className="w-12 h-12 flex flex-col items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
        >
          <span className="text-[10px] uppercase opacity-60">{t.speed}</span>
          <span className="text-sm">{playbackSpeed}x</span>
        </button>

        <div className="flex items-center gap-6">
          <button 
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={`p-3 transition-colors ${hasPrevious ? 'text-slate-700 hover:text-indigo-600' : 'text-slate-200 cursor-not-allowed'}`}
            aria-label={t.previous}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-skip-back"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
          </button>

          <button 
            onClick={handlePlayPause}
            className="w-20 h-20 flex items-center justify-center rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play ml-1"><polygon points="6 3 20 12 6 21 6 3"/></svg>
            )}
          </button>

          <button 
            onClick={onNext}
            disabled={!hasNext}
            className={`p-3 transition-colors ${hasNext ? 'text-slate-700 hover:text-indigo-600' : 'text-slate-200 cursor-not-allowed'}`}
            aria-label={t.next}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-skip-forward"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
          </button>
        </div>

        <div className="w-12" /> {/* Spacer */}
      </div>

      <audio 
        ref={audioRef}
        src={message.audioUrl}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          if (onNext) onNext();
        }}
        onError={onAudioError}
      />
    </div>
  );
};

export default AudioPlayer;
