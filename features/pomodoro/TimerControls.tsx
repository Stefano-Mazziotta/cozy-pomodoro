'use client';

import React from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { TimerStatus } from './types';

interface TimerControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  status,
  onStart,
  onPause,
  onReset,
  onSkip,
}) => {
  const isRunning = status === 'running';

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 mt-2" id="timer-controls">
      {/* Secondary Reset Button */}
      <button
        id="btn-reset-timer"
        onClick={onReset}
        type="button"
        title="Reset cycle to Work (R)"
        aria-label="Reset cycle to Work"
        className="group relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[#EBE2D5] hover:bg-[#E2D6C5] active:scale-95 text-[#5C3D2E] border border-[#DCD0BE] transition-all duration-150 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5C3D2E]/40"
      >
        <RotateCcw className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-45" />
        <span className="sr-only">Reset</span>
      </button>

      {/* Main Start / Pause Hero Button */}
      <button
        id="btn-toggle-timer"
        onClick={isRunning ? onPause : onStart}
        type="button"
        title={isRunning ? 'Pause timer (Space)' : 'Start timer (Space)'}
        aria-label={isRunning ? 'Pause timer' : 'Start timer'}
        className={`relative flex items-center justify-center gap-2.5 px-8 sm:px-10 h-14 sm:h-15 rounded-2xl font-medium tracking-wide transition-all duration-150 active:scale-98 shadow-sm focus:outline-none focus-visible:ring-3 focus-visible:ring-[#5C3D2E]/40 ${
          isRunning
            ? 'bg-[#E3D7C5] hover:bg-[#D8C9B3] text-[#332B25] border border-[#CBBBA5]'
            : 'bg-[#5C3D2E] hover:bg-[#4E3326] text-[#FFFDF8] border border-[#482F22]'
        }`}
      >
        {isRunning ? (
          <>
            <Pause className="w-5 h-5 fill-current" />
            <span className="text-base sm:text-lg font-semibold tracking-normal">Pause</span>
          </>
        ) : (
          <>
            <Play className="w-5 h-5 fill-current ml-0.5" />
            <span className="text-base sm:text-lg font-semibold tracking-normal">
              {status === 'paused' ? 'Resume' : 'Start'}
            </span>
          </>
        )}
      </button>

      {/* Secondary Skip Button */}
      <button
        id="btn-skip-timer"
        onClick={onSkip}
        type="button"
        title="Skip to next phase (S)"
        aria-label="Skip to next phase"
        className="group relative flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-2xl bg-[#EBE2D5] hover:bg-[#E2D6C5] active:scale-95 text-[#5C3D2E] border border-[#DCD0BE] transition-all duration-150 shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5C3D2E]/40"
      >
        <SkipForward className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
        <span className="sr-only">Skip</span>
      </button>
    </div>
  );
};
