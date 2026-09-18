'use client';

import React, { useSyncExternalStore } from 'react';
import { Clock } from 'lucide-react';

let cachedTimestamp = typeof window !== 'undefined' ? Date.now() : 0;
const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;

const subscribe = (callback: () => void) => {
  listeners.add(callback);
  if (listeners.size === 1) {
    intervalId = setInterval(() => {
      cachedTimestamp = Date.now();
      listeners.forEach(cb => cb());
    }, 1000);
  }
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
};

const getSnapshot = () => cachedTimestamp;
const getServerSnapshot = () => 0;

export const ModernClock: React.FC = () => {
  const timestamp = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!timestamp) {
    return (
      <div 
        id="footer-datetime-clock"
        className="h-8 flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-[#F4EEE3]/40 border border-[#E5DACB]/50"
      >
        <span className="text-xs text-[#9A8D7F]/60">Loading clock...</span>
      </div>
    );
  }

  const time = new Date(timestamp);
  const hours = time.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: true 
  });

  const dateStr = time.toLocaleDateString([], { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      id="footer-datetime-clock"
      className="flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-[#F4EEE3]/70 border border-[#E5DACB]/80 text-[#5C3D2E] shadow-xs backdrop-blur-xs transition-all"
    >
      {/* Date display */}
      <div className="flex items-center gap-1.5 text-xs text-[#81766B] font-medium tracking-tight">
        <span>{dateStr}</span>
      </div>

      {/* Modern Live Clock */}
      <div className="flex items-center gap-1.5 text-xs font-semibold tracking-tight text-[#332B25] tabular-nums">
        <Clock className="w-3.5 h-3.5 text-[#A08875]" />
        <span>{hours}</span>
      </div>
    </div>
  );
};
