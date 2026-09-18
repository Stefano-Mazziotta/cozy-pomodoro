'use client';

import React, { useState } from 'react';
import { X, Check, Clock, RotateCcw, Bell, Volume2 } from 'lucide-react';
import { TimerConfig } from '@/features/pomodoro/types';
import { soundEngine } from '@/features/soundscapes/soundEngine';

interface IntervalSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  config: TimerConfig;
  onSave: (newConfig: TimerConfig) => void;
}

export const IntervalSettings: React.FC<IntervalSettingsProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [form, setForm] = useState<TimerConfig>(config);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [chimeTesting, setChimeTesting] = useState(false);

  if (!isOpen) return null;

  const handleNumericChange = (key: keyof TimerConfig, val: number, min: number, max: number) => {
    const clamped = Math.max(min, Math.min(max, isNaN(val) ? min : val));
    setForm(prev => ({ ...prev, [key]: clamped }));
  };

  const handleResetDefaults = () => {
    setForm({
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      soundChime: true,
    });
  };

  const handleTestChime = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    soundEngine.playCompletionChime();
    setChimeTesting(true);
    setTimeout(() => {
      setChimeTesting(false);
    }, 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSavedFeedback(true);
    setTimeout(() => {
      onClose();
    }, 350);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#241E1A]/40 backdrop-blur-xs animate-in fade-in duration-200"
      id="interval-settings-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      {/* Settings Modal Card */}
      <div 
        className="w-full max-w-md bg-[#FFFDF8] rounded-3xl border border-[#E2D8C9] p-6 sm:p-7 shadow-xl transform transition-all"
        id="interval-settings-card"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFE8DC] mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[#F4EFE6] text-[#5C3D2E] border border-[#E2D8C9]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 id="settings-title" className="text-lg font-serif font-bold text-[#332B25]">
                Interval Setup
              </h2>
              <p className="text-xs text-[#81766B]">Customize your work & rest rhythm</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#F4EFE6] text-[#81766B] hover:text-[#332B25] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Work Duration */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F4EC] border border-[#EAE1D3]">
            <div>
              <label htmlFor="work-input" className="block text-sm font-semibold text-[#332B25]">
                Work Duration
              </label>
              <span className="text-xs text-[#81766B]">Focus time per session</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 shrink-0">
              <input
                id="work-input"
                type="number"
                min="1"
                max="120"
                value={form.workDuration}
                onChange={e => handleNumericChange('workDuration', parseInt(e.target.value, 10), 1, 120)}
                className="w-16 h-10 px-2 text-center text-base font-mono font-medium rounded-xl bg-[#FFFDF8] border border-[#DCD0BE] text-[#332B25] focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30"
              />
              <span className="w-12 text-xs font-medium text-[#81766B] text-left">min</span>
            </div>
          </div>

          {/* Short Break */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F4EC] border border-[#EAE1D3]">
            <div>
              <label htmlFor="short-break-input" className="block text-sm font-semibold text-[#332B25]">
                Short Break
              </label>
              <span className="text-xs text-[#81766B]">Quick pause to stretch or sip coffee</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 shrink-0">
              <input
                id="short-break-input"
                type="number"
                min="1"
                max="60"
                value={form.shortBreakDuration}
                onChange={e => handleNumericChange('shortBreakDuration', parseInt(e.target.value, 10), 1, 60)}
                className="w-16 h-10 px-2 text-center text-base font-mono font-medium rounded-xl bg-[#FFFDF8] border border-[#DCD0BE] text-[#332B25] focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30"
              />
              <span className="w-12 text-xs font-medium text-[#81766B] text-left">min</span>
            </div>
          </div>

          {/* Long Break */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F4EC] border border-[#EAE1D3]">
            <div>
              <label htmlFor="long-break-input" className="block text-sm font-semibold text-[#332B25]">
                Long Break
              </label>
              <span className="text-xs text-[#81766B]">Extended rest after a full cycle</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 shrink-0">
              <input
                id="long-break-input"
                type="number"
                min="1"
                max="90"
                value={form.longBreakDuration}
                onChange={e => handleNumericChange('longBreakDuration', parseInt(e.target.value, 10), 1, 90)}
                className="w-16 h-10 px-2 text-center text-base font-mono font-medium rounded-xl bg-[#FFFDF8] border border-[#DCD0BE] text-[#332B25] focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30"
              />
              <span className="w-12 text-xs font-medium text-[#81766B] text-left">min</span>
            </div>
          </div>

          {/* Long Break Interval */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F4EC] border border-[#EAE1D3]">
            <div>
              <label htmlFor="sessions-input" className="block text-sm font-semibold text-[#332B25]">
                Long Break After
              </label>
              <span className="text-xs text-[#81766B]">Work sessions before long break</span>
            </div>
            <div className="flex items-center justify-end gap-1.5 shrink-0">
              <input
                id="sessions-input"
                type="number"
                min="2"
                max="12"
                value={form.sessionsUntilLongBreak}
                onChange={e => handleNumericChange('sessionsUntilLongBreak', parseInt(e.target.value, 10), 2, 12)}
                className="w-16 h-10 px-2 text-center text-base font-mono font-medium rounded-xl bg-[#FFFDF8] border border-[#DCD0BE] text-[#332B25] focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/30"
              />
              <span className="w-12 text-xs font-medium text-[#81766B] text-left">rounds</span>
            </div>
          </div>

          {/* Sound Chime & Automatic Schedule Note */}
          <div className="pt-2 border-t border-[#EFE8DC] space-y-2.5">
            {/* Automatic schedule indicator */}
            <div className="px-3 py-2 rounded-xl bg-[#F4EFE6]/70 border border-[#E8DFCFA0] flex items-center justify-between text-xs text-[#81766B]">
              <span className="font-medium text-[#5C3D2E]">Automatic flow</span>
              <span>Intervals transition seamlessly</span>
            </div>

            {/* Sound chime on finish with Test Chime Button */}
            <div className="p-2.5 rounded-xl bg-[#F8F4EC] border border-[#EAE1D3] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Bell className="w-4 h-4 text-[#BA5835] shrink-0" />
                <div className="truncate">
                  <span className="text-xs font-semibold text-[#332B25] block">Sound chime on finish</span>
                  <span className="text-[11px] text-[#81766B] block">Singing bowl bell at 0:00</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Dedicated Test Chime Button */}
                <button
                  type="button"
                  onClick={handleTestChime}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-[#D6CBB9] bg-[#FFFDF8] hover:bg-[#F4EFE6] text-[#332B25] active:scale-95 transition-all shadow-2xs"
                  title="Test the singing bowl completion sound right now"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#BA5835]" />
                  <span>{chimeTesting ? 'Testing…' : 'Test Chime'}</span>
                </button>

                <input
                  type="checkbox"
                  checked={form.soundChime}
                  onChange={e => setForm(p => ({ ...p, soundChime: e.target.checked }))}
                  className="w-4 h-4 accent-[#5C3D2E] rounded cursor-pointer ml-1"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#81766B] hover:text-[#332B25] rounded-xl hover:bg-[#F4EFE6] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset defaults
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-[#5C3D2E] hover:bg-[#4E3326] active:scale-98 text-[#FFFDF8] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#5C3D2E]/40"
            >
              {savedFeedback ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Applied!</span>
                </>
              ) : (
                <span>Apply & Save</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
