'use client';

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { PomodoroPhase, TimerStatus, TimerConfig } from './types';
import { soundEngine } from '@/features/soundscapes/soundEngine';

export interface StoredTimerState {
  phase: PomodoroPhase;
  status: TimerStatus;
  currentSession: number;
  completedTotalSessions: number;
  remainingMs: number;
  totalDurationMs: number;
  targetTimestamp: number | null;
}

const DEFAULT_CONFIG: TimerConfig = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  soundChime: true,
};

const CONFIG_STORAGE_KEY = 'pomodoro_cafe_config_v1';
const STATE_STORAGE_KEY = 'pomodoro_cafe_state_v1';

// Client-side hydration detector via useSyncExternalStore
const emptySubscribe = () => () => {};
function useIsHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function getStoredConfig(): TimerConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        // Support migration from legacy key names if present
        sessionsUntilLongBreak: parsed.sessionsUntilLongBreak || parsed.sessionsBeforeLongBreak || 4,
        soundChime: typeof parsed.soundChime === 'boolean' ? parsed.soundChime : (typeof parsed.soundAlert === 'boolean' ? parsed.soundAlert : true),
      };
    }
  } catch {}
  return DEFAULT_CONFIG;
}

function getStoredState(initialConfig: TimerConfig): {
  phase: PomodoroPhase;
  status: TimerStatus;
  currentSession: number;
  completedTotalSessions: number;
  remainingMs: number;
  targetTimestamp: number | null;
} {
  const defaultState = {
    phase: 'work' as PomodoroPhase,
    status: 'idle' as TimerStatus,
    currentSession: 1,
    completedTotalSessions: 0,
    remainingMs: initialConfig.workDuration * 60 * 1000,
    targetTimestamp: null,
  };

  if (typeof window === 'undefined') return defaultState;

  try {
    const saved = localStorage.getItem(STATE_STORAGE_KEY);
    if (saved) {
      const parsed: StoredTimerState = JSON.parse(saved);
      const validPhase: PomodoroPhase = (['work', 'shortBreak', 'longBreak'] as PomodoroPhase[]).includes(parsed.phase)
        ? parsed.phase
        : 'work';

      let duration = initialConfig.workDuration * 60 * 1000;
      if (validPhase === 'shortBreak') duration = initialConfig.shortBreakDuration * 60 * 1000;
      if (validPhase === 'longBreak') duration = initialConfig.longBreakDuration * 60 * 1000;

      let rem = typeof parsed.remainingMs === 'number' && parsed.remainingMs > 0
        ? Math.min(parsed.remainingMs, duration)
        : duration;

      let st: TimerStatus = 'idle';
      let target: number | null = null;

      if (parsed.status === 'running' && parsed.targetTimestamp) {
        const remaining = parsed.targetTimestamp - Date.now();
        if (remaining > 0) {
          rem = remaining;
          target = parsed.targetTimestamp;
          st = 'running';
        } else {
          rem = 0;
          st = 'idle';
        }
      }

      // If timer was idle, always start from work phase, session 1
      if (st === 'idle') {
        return {
          phase: 'work',
          status: 'idle',
          currentSession: 1,
          completedTotalSessions: parsed.completedTotalSessions || 0,
          remainingMs: initialConfig.workDuration * 60 * 1000,
          targetTimestamp: null,
        };
      }

      return {
        phase: validPhase,
        status: st,
        currentSession: Math.max(1, parsed.currentSession || 1),
        completedTotalSessions: parsed.completedTotalSessions || 0,
        remainingMs: rem,
        targetTimestamp: target,
      };
    }
  } catch {}

  return defaultState;
}

export function usePomodoroTimer() {
  const isHydrated = useIsHydrated();

  const [config, setConfig] = useState<TimerConfig>(getStoredConfig);
  const [phase, setPhase] = useState<PomodoroPhase>(() => getStoredState(getStoredConfig()).phase);
  const [status, setStatus] = useState<TimerStatus>(() => getStoredState(getStoredConfig()).status);
  const [currentSession, setCurrentSession] = useState<number>(() => getStoredState(getStoredConfig()).currentSession);
  const [completedTotalSessions, setCompletedTotalSessions] = useState<number>(() => getStoredState(getStoredConfig()).completedTotalSessions);
  const [remainingMs, setRemainingMs] = useState<number>(() => getStoredState(getStoredConfig()).remainingMs);
  const [targetTimestamp, setTargetTimestamp] = useState<number | null>(() => getStoredState(getStoredConfig()).targetTimestamp);

  // References for ticker and background handlers without reading refs during render
  const configRef = useRef(config);
  const phaseRef = useRef(phase);
  const statusRef = useRef(status);
  const currentSessionRef = useRef(currentSession);
  const targetTimestampRef = useRef(targetTimestamp);
  const remainingMsRef = useRef(remainingMs);
  const completedTotalSessionsRef = useRef(completedTotalSessions);

  // Keep refs in sync inside an effect
  useEffect(() => {
    configRef.current = config;
    phaseRef.current = phase;
    statusRef.current = status;
    currentSessionRef.current = currentSession;
    targetTimestampRef.current = targetTimestamp;
    remainingMsRef.current = remainingMs;
    completedTotalSessionsRef.current = completedTotalSessions;
  }, [config, phase, status, currentSession, targetTimestamp, remainingMs, completedTotalSessions]);

  // Phase duration calculation helper
  const getPhaseDurationMs = useCallback((p: PomodoroPhase, cfg: TimerConfig) => {
    switch (p) {
      case 'work':
        return cfg.workDuration * 60 * 1000;
      case 'shortBreak':
        return cfg.shortBreakDuration * 60 * 1000;
      case 'longBreak':
        return cfg.longBreakDuration * 60 * 1000;
    }
  }, []);

  // Save state to localStorage helper
  const saveStateToStorage = useCallback((
    p: PomodoroPhase,
    st: TimerStatus,
    sess: number,
    total: number,
    remMs: number,
    target: number | null
  ) => {
    try {
      const stateObj: StoredTimerState = {
        phase: p,
        status: st,
        currentSession: sess,
        completedTotalSessions: total,
        remainingMs: remMs,
        targetTimestamp: target,
        totalDurationMs: getPhaseDurationMs(p, configRef.current),
      };
      localStorage.setItem(STATE_STORAGE_KEY, JSON.stringify(stateObj));
    } catch {}
  }, [getPhaseDurationMs]);

  // Advance to the next phase in the cycle
  const advanceToNextPhase = useCallback((wasAutomatic = false) => {
    const currentCfg = configRef.current;
    const curPhase = phaseRef.current;
    const curSession = currentSessionRef.current;
    const curCompleted = completedTotalSessionsRef.current;

    let nextPhase: PomodoroPhase = 'work';
    let nextSession = curSession;
    let nextTotalCompleted = curCompleted;

    if (curPhase === 'work') {
      nextTotalCompleted = curCompleted + 1;
      setCompletedTotalSessions(nextTotalCompleted);

      if (curSession >= currentCfg.sessionsUntilLongBreak) {
        nextPhase = 'longBreak';
      } else {
        nextPhase = 'shortBreak';
      }
    } else if (curPhase === 'shortBreak') {
      nextPhase = 'work';
      nextSession = curSession + 1;
    } else if (curPhase === 'longBreak') {
      nextPhase = 'work';
      nextSession = 1;
    }

    const nextDuration = getPhaseDurationMs(nextPhase, currentCfg);
    // Pomodoro schedule is automatic: interval completions or skips while running automatically start the next phase
    const shouldAutoStart = wasAutomatic || statusRef.current === 'running';

    setPhase(nextPhase);
    setCurrentSession(nextSession);

    if (shouldAutoStart) {
      const now = Date.now();
      const newTarget = now + nextDuration;
      setRemainingMs(nextDuration);
      setTargetTimestamp(newTarget);
      setStatus('running');
      saveStateToStorage(nextPhase, 'running', nextSession, nextTotalCompleted, nextDuration, newTarget);
    } else {
      setRemainingMs(nextDuration);
      setTargetTimestamp(null);
      setStatus('idle');
      saveStateToStorage(nextPhase, 'idle', nextSession, nextTotalCompleted, nextDuration, null);
    }
  }, [getPhaseDurationMs, saveStateToStorage]);

  // Interval complete handler
  const handleIntervalComplete = useCallback(() => {
    if (configRef.current.soundChime) {
      soundEngine.playCompletionChime();
    }
    advanceToNextPhase(true);
  }, [advanceToNextPhase]);

  // Main countdown loop: derives remaining time from Date.now() and targetTimestamp
  useEffect(() => {
    if (status !== 'running' || !targetTimestamp) {
      return;
    }

    const intervalId = setInterval(() => {
      const now = Date.now();
      const currentTarget = targetTimestampRef.current;
      if (!currentTarget) return;

      const remaining = currentTarget - now;

      if (remaining <= 0) {
        setRemainingMs(0);
        handleIntervalComplete();
      } else {
        setRemainingMs(remaining);
      }
    }, 150);

    return () => clearInterval(intervalId);
  }, [status, targetTimestamp, handleIntervalComplete]);

  // Visibility change listener: when returning to tab, re-sync immediately
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && statusRef.current === 'running' && targetTimestampRef.current) {
        const remaining = targetTimestampRef.current - Date.now();
        if (remaining <= 0) {
          setRemainingMs(0);
          handleIntervalComplete();
        } else {
          setRemainingMs(remaining);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleIntervalComplete]);

  // Browser Tab Title update
  useEffect(() => {
    if (!isHydrated) return;
    const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    let phaseName = 'Work';
    if (phase === 'shortBreak') phaseName = 'Short Break';
    if (phase === 'longBreak') phaseName = 'Long Break';

    const statusIcon = status === 'running' ? '▶' : status === 'paused' ? '❚❚' : '○';

    document.title = `${statusIcon} ${timeStr} · ${phaseName} | Pomodoro`;
  }, [remainingMs, phase, status, isHydrated]);

  // Public Actions
  const start = useCallback(() => {
    soundEngine.playTactileClick();
    const now = Date.now();
    const currentRemaining = remainingMsRef.current > 0
      ? remainingMsRef.current
      : getPhaseDurationMs(phaseRef.current, configRef.current);

    const newTarget = now + currentRemaining;
    setRemainingMs(currentRemaining);
    setTargetTimestamp(newTarget);
    setStatus('running');

    saveStateToStorage(
      phaseRef.current,
      'running',
      currentSessionRef.current,
      completedTotalSessionsRef.current,
      currentRemaining,
      newTarget
    );
  }, [getPhaseDurationMs, saveStateToStorage]);

  const pause = useCallback(() => {
    soundEngine.playTactileClick();
    if (targetTimestampRef.current) {
      const now = Date.now();
      const calculatedRemaining = Math.max(0, targetTimestampRef.current - now);
      setRemainingMs(calculatedRemaining);
      setTargetTimestamp(null);
      setStatus('paused');

      saveStateToStorage(
        phaseRef.current,
        'paused',
        currentSessionRef.current,
        completedTotalSessionsRef.current,
        calculatedRemaining,
        null
      );
    }
  }, [saveStateToStorage]);

  const reset = useCallback(() => {
    soundEngine.playTactileClick();
    const workDuration = getPhaseDurationMs('work', configRef.current);
    setPhase('work');
    setCurrentSession(1);
    setRemainingMs(workDuration);
    setTargetTimestamp(null);
    setStatus('idle');

    saveStateToStorage(
      'work',
      'idle',
      1,
      completedTotalSessionsRef.current,
      workDuration,
      null
    );
  }, [getPhaseDurationMs, saveStateToStorage]);

  const skip = useCallback(() => {
    soundEngine.playTactileClick();
    advanceToNextPhase(statusRef.current === 'running');
  }, [advanceToNextPhase]);

  const selectPhase = useCallback((newPhase: PomodoroPhase) => {
    soundEngine.playTactileClick();
    const newDuration = getPhaseDurationMs(newPhase, configRef.current);
    setPhase(newPhase);
    setRemainingMs(newDuration);
    setTargetTimestamp(null);
    setStatus('idle');

    saveStateToStorage(
      newPhase,
      'idle',
      currentSessionRef.current,
      completedTotalSessionsRef.current,
      newDuration,
      null
    );
  }, [getPhaseDurationMs, saveStateToStorage]);

  const updateConfig = useCallback((newConfig: Partial<TimerConfig>) => {
    setConfig(prev => {
      const merged = { ...prev, ...newConfig };
      try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(merged));
      } catch {}

      if (statusRef.current === 'idle') {
        const newDuration = getPhaseDurationMs(phaseRef.current, merged);
        setRemainingMs(newDuration);
      }
      return merged;
    });
  }, [getPhaseDurationMs]);

  const totalDurationMs = getPhaseDurationMs(phase, config);

  return {
    phase,
    status,
    currentSession,
    completedTotalSessions,
    remainingMs,
    totalDurationMs,
    config,
    hasHydrated: isHydrated,
    start,
    pause,
    reset,
    skip,
    selectPhase,
    updateConfig,
  };
}
