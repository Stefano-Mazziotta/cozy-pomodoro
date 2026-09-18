'use client';

import React from 'react';
import { PomodoroPhase } from './types';

interface SessionProgressProps {
  currentSession: number;
  totalSessions: number;
  phase: PomodoroPhase;
  completedCount: number;
}

export const SessionProgress: React.FC<SessionProgressProps> = ({
  currentSession,
  totalSessions,
  phase,
  completedCount,
}) => {
  // Generate dot states for current cycle
  const dots = Array.from({ length: totalSessions }, (_, idx) => {
    const sessionNum = idx + 1;
    const isCompleted = sessionNum < currentSession;
    const isCurrent = sessionNum === currentSession;
    return {
      sessionNum,
      isCompleted,
      isCurrent,
    };
  });

  return (
    <div className="flex flex-col items-center" id="session-progress-container">
      {/* Visual Dot Sequence: ● ● ○ ○ */}
      <div 
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#EFE8DD]/70 border border-[#E2D8C9]/80"
        role="progressbar"
        aria-label={`Cycle progress: session ${currentSession} of ${totalSessions}`}
        aria-valuenow={currentSession}
        aria-valuemin={1}
        aria-valuemax={totalSessions}
      >
        {dots.map(({ sessionNum, isCompleted, isCurrent }) => {
          let dotStyle = 'w-2.5 h-2.5 rounded-full transition-all duration-300 ';
          if (isCompleted) {
            dotStyle += 'bg-[#5C3D2E] scale-100 shadow-xs';
          } else if (isCurrent) {
            if (phase === 'work') {
              dotStyle += 'bg-[#BA5835] ring-2 ring-[#BA5835]/30 ring-offset-1 ring-offset-[#FFFDF8] scale-110 animate-pulse';
            } else {
              dotStyle += 'bg-[#4F6B4F] ring-2 ring-[#4F6B4F]/30 ring-offset-1 ring-offset-[#FFFDF8] scale-110 animate-pulse';
            }
          } else {
            dotStyle += 'bg-[#D6CBB9] border border-[#C5B8A4] scale-95';
          }

          return (
            <span
              key={sessionNum}
              className={dotStyle}
              title={`Session ${sessionNum} of ${totalSessions}`}
            />
          );
        })}
      </div>
    </div>
  );
};
