'use client';

import React from 'react';
import { PomodoroPhase, TimerStatus } from './types';

interface TimerDisplayProps {
  phase: PomodoroPhase;
  status: TimerStatus;
  remainingMs: number;
  totalDurationMs: number;
  currentSession: number;
  sessionsUntilLongBreak: number;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  phase,
  status,
  remainingMs,
  totalDurationMs,
  currentSession,
  sessionsUntilLongBreak,
}) => {
  // Compute minutes and seconds
  const totalRemainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const minutes = Math.floor(totalRemainingSeconds / 60);
  const seconds = totalRemainingSeconds % 60;

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  // Compute progress ratio (0 to 1)
  const progressRatio = totalDurationMs > 0
    ? Math.max(0, Math.min(1, 1 - remainingMs / totalDurationMs))
    : 0;

  // SVG Circular progress constants
  const size = 320;
  const strokeWidth = 7;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Label configuration per phase
  const getPhaseMeta = () => {
    switch (phase) {
      case 'work':
        return {
          title: 'Work Session',
          subtitle: `Session ${currentSession} of ${sessionsUntilLongBreak}`,
          badgeBg: 'bg-[#BA5835]/10 border-[#BA5835]/25 text-[#BA5835]',
          ringColor: '#BA5835', // warm terracotta
        };
      case 'shortBreak':
        return {
          title: 'Short Break',
          subtitle: `Rest before session ${Math.min(currentSession + 1, sessionsUntilLongBreak)}`,
          badgeBg: 'bg-[#4F6B4F]/10 border-[#4F6B4F]/25 text-[#4F6B4F]',
          ringColor: '#4F6B4F', // muted sage
        };
      case 'longBreak':
        return {
          title: 'Long Break',
          subtitle: 'Cycle complete · Deep rest',
          badgeBg: 'bg-[#5C3D2E]/10 border-[#5C3D2E]/25 text-[#5C3D2E]',
          ringColor: '#5C3D2E', // deep espresso
        };
    }
  };

  const meta = getPhaseMeta();

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto" id="timer-display-card">
      {/* Automatic Flow Indicator (Non-interactive; progression is automatic) */}
      <div 
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#EBE2D5]/80 border border-[#DFD3C1] mb-6 shadow-xs select-none"
        id="phase-flow-indicator"
        role="status"
        aria-label={`Current phase: ${meta.title}. Schedule advances automatically.`}
      >
        {/* Step 1: Work */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 ${
            phase === 'work'
              ? 'bg-[#FFFDF8] text-[#BA5835] shadow-xs font-semibold border border-[#BA5835]/25'
              : 'text-[#81766B]/75'
          }`}
        >
          {phase === 'work' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#BA5835] animate-pulse" />
          )}
          <span>Work</span>
        </div>

        {/* Directional flow connector */}
        <span className="text-[#A89C8F] text-xs font-light select-none">→</span>

        {/* Step 2: Short Break */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 ${
            phase === 'shortBreak'
              ? 'bg-[#FFFDF8] text-[#4F6B4F] shadow-xs font-semibold border border-[#4F6B4F]/25'
              : 'text-[#81766B]/75'
          }`}
        >
          {phase === 'shortBreak' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#4F6B4F] animate-pulse" />
          )}
          <span>Short Break</span>
        </div>

        {/* Directional flow connector */}
        <span className="text-[#A89C8F] text-xs font-light select-none">→</span>

        {/* Step 3: Long Break */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 text-xs sm:text-sm font-medium rounded-full transition-all duration-300 ${
            phase === 'longBreak'
              ? 'bg-[#FFFDF8] text-[#5C3D2E] shadow-xs font-semibold border border-[#5C3D2E]/25'
              : 'text-[#81766B]/75'
          }`}
        >
          {phase === 'longBreak' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#5C3D2E] animate-pulse" />
          )}
          <span>Long Break</span>
        </div>
      </div>

      {/* Main Chronometer Stage */}
      <div className="relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80 my-2">
        {/* Analog Ceramic Dial Background Plate */}
        <div className="absolute inset-0 rounded-full bg-[#FFFDF8] border border-[#E5DAC9] shadow-[0_8px_30px_rgb(51,43,37,0.06)]" />

        {/* Circular Progress Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90 transform pointer-events-none"
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EFE8DC"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active progress track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={meta.ringColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Content Centered inside the Ring */}
        <div className="relative z-10 flex flex-col items-center text-center px-4">
          {/* Phase Badge */}
          <span 
            className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs uppercase tracking-widest font-semibold border ${meta.badgeBg} mb-1`}
          >
            {meta.title}
          </span>

          {/* Tabular Monospace Big Digits */}
          <div 
            className="text-6xl sm:text-7xl font-light tracking-tight text-[#332B25] tabular-timer select-none my-1 font-mono"
            aria-live="polite"
            aria-label={`${minutes} minutes and ${seconds} seconds remaining`}
          >
            {formattedMinutes}
            <span className={`inline-block mx-0.5 text-[#5C3D2E]/60 ${status === 'running' ? 'animate-pulse' : ''}`}>
              :
            </span>
            {formattedSeconds}
          </div>

          {/* Subtitle / Session indicator */}
          <p className="text-xs sm:text-sm text-[#81766B] font-medium tracking-wide">
            {meta.subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};
