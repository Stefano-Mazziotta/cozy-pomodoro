export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';

export type TimerStatus = 'idle' | 'running' | 'paused';

export interface TimerConfig {
  workDuration: number;        // minutes
  shortBreakDuration: number;  // minutes
  longBreakDuration: number;   // minutes
  sessionsUntilLongBreak: number;
  soundChime: boolean;
  autoStartBreaks?: boolean;
  autoStartWork?: boolean;
  ambientSound?: boolean;
}

export interface PomodoroTimerState {
  phase: PomodoroPhase;
  status: TimerStatus;
  currentSession: number;
  completedTotalSessions: number;
  remainingMs: number;
  totalDurationMs: number;
  targetTimestamp: number | null;
  progress: number; // 0 to 1
  config: TimerConfig;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipPhase: () => void;
  updateConfig: (newConfig: Partial<TimerConfig>) => void;
}
