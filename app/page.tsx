'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings, 
  HelpCircle, 
  Maximize2, 
  Minimize2, 
  Coffee,
  CheckCircle2,
  VolumeX,
  Volume2
} from 'lucide-react';
import { usePomodoroTimer, TimerDisplay, TimerControls, SessionProgress } from '@/features/pomodoro';
import { LoFiSoundBar, soundEngine } from '@/features/soundscapes';
import { IntervalSettings } from '@/features/settings';
import { KeyboardShortcutsModal } from '@/features/shortcuts';
import { ModernClock } from '@/components/ModernClock';

export default function PomodoroPage() {
  const {
    phase,
    status,
    currentSession,
    completedTotalSessions,
    remainingMs,
    totalDurationMs,
    config,
    hasHydrated,
    start,
    pause,
    reset,
    skip,
    updateConfig,
  } = usePomodoroTimer();

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);

  // Keyboard shortcut listener
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore keyboard shortcuts if an input, textarea, or select is active
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable
    ) {
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      if (status === 'running') {
        pause();
      } else {
        start();
      }
    } else if (e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      reset();
    } else if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      skip();
    } else if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      setIsSettingsOpen(prev => !prev);
    } else if (e.key === 'z' || e.key === 'Z') {
      e.preventDefault();
      setIsZenMode(prev => !prev);
    } else if (e.key === 'm' || e.key === 'M') {
      e.preventDefault();
      const nextMute = !isAudioMuted;
      setIsAudioMuted(nextMute);
      soundEngine.setMuted(nextMute);
    } else if (e.key === '?') {
      e.preventDefault();
      setIsShortcutsOpen(prev => !prev);
    } else if (e.key === 'Escape') {
      setIsSettingsOpen(false);
      setIsShortcutsOpen(false);
      setIsZenMode(false);
    }
  }, [status, pause, start, reset, skip, isAudioMuted]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!hasHydrated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F4EFE6] text-[#81766B]">
        <div className="flex flex-col items-center gap-3">
          <Coffee className="w-8 h-8 text-[#5C3D2E] animate-pulse" />
          <span className="text-sm font-serif italic">Pouring fresh coffee...</span>
        </div>
      </main>
    );
  }

  return (
    <main 
      className={`min-h-screen flex flex-col justify-between p-4 sm:p-6 md:p-8 bg-[#F4EFE6] text-[#332B25] transition-colors duration-500 selection:bg-[#E9E0D2] selection:text-[#332B25] ${
        isZenMode ? 'cursor-default' : ''
      }`}
      id="pomodoro-app"
    >
      {/* Top Bar / Header */}
      <header 
        className={`w-full max-w-2xl mx-auto flex items-center justify-between transition-opacity duration-300 ${
          isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        id="app-header"
      >
        {/* Analog Brand Wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#FFFDF8] border border-[#E2D8C9] flex items-center justify-center text-[#5C3D2E] shadow-2xs">
            <Coffee className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif text-lg font-bold tracking-tight text-[#332B25]">
              Pomodoro
            </span>
          </div>
        </div>

        {/* Top Right Utility Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Zen View Mode */}
          <button
            type="button"
            onClick={() => setIsZenMode(true)}
            title="Zen focus view (Z)"
            aria-label="Zen focus view"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#FFFDF8] border border-[#E2D8C9] text-[#81766B] hover:text-[#332B25] hover:bg-[#F8F4EC] transition-all shadow-2xs"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Keyboard Shortcuts */}
          <button
            type="button"
            onClick={() => setIsShortcutsOpen(true)}
            title="Keyboard shortcuts (?)"
            aria-label="Keyboard shortcuts"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#FFFDF8] border border-[#E2D8C9] text-[#81766B] hover:text-[#332B25] hover:bg-[#F8F4EC] transition-all shadow-2xs"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            title="Interval setup (C)"
            aria-label="Interval setup"
            className="flex items-center gap-1.5 px-3 h-9 rounded-xl bg-[#FFFDF8] border border-[#E2D8C9] text-[#5C3D2E] hover:text-[#332B25] hover:bg-[#F8F4EC] transition-all shadow-2xs text-xs font-medium"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </header>

      {/* Center Hero Stage (The Chronometer is the Product) */}
      <section 
        className="flex-1 flex flex-col items-center justify-center w-full max-w-xl mx-auto my-4 sm:my-8 px-2"
        id="chronometer-stage"
      >
        {/* Prominent Timer Dial */}
        <TimerDisplay
          phase={phase}
          status={status}
          remainingMs={remainingMs}
          totalDurationMs={totalDurationMs}
          currentSession={currentSession}
          sessionsUntilLongBreak={config.sessionsUntilLongBreak}
        />

        {/* Primary Tactile Controls */}
        <div className="w-full mt-5 sm:mt-6">
          <TimerControls
            status={status}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onSkip={skip}
          />
        </div>

        {/* Cycle Visual Representation (● ● ○ ○) */}
        <div className="mt-6 sm:mt-7">
          <SessionProgress
            currentSession={currentSession}
            totalSessions={config.sessionsUntilLongBreak}
            phase={phase}
            completedCount={completedTotalSessions}
          />
        </div>
      </section>

      {/* Zen Mode Exit Overlay button */}
      {isZenMode && (
        <div className="fixed top-5 right-5 z-40 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setIsZenMode(false)}
            title="Exit Zen mode (Esc)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF8]/90 border border-[#E2D8C9] text-xs font-medium text-[#81766B] hover:text-[#332B25] shadow-sm backdrop-blur-xs transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit Zen</span>
          </button>
        </div>
      )}

      {/* Bottom Section: Ambient Lo-Fi Sound and Minimalist Status */}
      <footer 
        className={`w-full max-w-xl mx-auto space-y-3 transition-opacity duration-300 ${
          isZenMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        id="app-footer"
      >
        {/* Lo-Fi Background Sound Bar */}
        <LoFiSoundBar />

        {/* Modern Live Datetime Clock */}
        <ModernClock />

        {/* Minimalist Shortcut Hint */}
        <div className="flex items-center justify-center text-[11px] text-[#9A8D7F] px-1">
          <span className="hidden sm:inline">
            Press <kbd className="px-1 py-0.5 font-mono text-[10px] bg-[#EFE8DD] rounded border border-[#DFD3C1]">Space</kbd> to {status === 'running' ? 'pause' : 'start'}
          </span>
        </div>
      </footer>

      {/* Interval Setup Modal */}
      {isSettingsOpen && (
        <IntervalSettings
          key={`settings-${config.workDuration}-${config.shortBreakDuration}-${config.longBreakDuration}`}
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          config={config}
          onSave={updateConfig}
        />
      )}

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </main>
  );
}
