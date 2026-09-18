'use client';

import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', description: 'Start or pause timer' },
    { key: 'R', description: 'Reset cycle to Work' },
    { key: 'S', description: 'Skip to next interval' },
    { key: 'C', description: 'Open interval setup / settings' },
    { key: 'M', description: 'Mute / unmute lo-fi ambience' },
    { key: 'Z', description: 'Toggle Zen focus view' },
    { key: '?', description: 'Toggle shortcuts guide' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#241E1A]/40 backdrop-blur-xs animate-in fade-in duration-150"
      id="shortcuts-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="w-full max-w-sm bg-[#FFFDF8] rounded-3xl border border-[#E2D8C9] p-6 shadow-xl"
        id="shortcuts-modal-card"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#EFE8DC] mb-4">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-[#5C3D2E]" />
            <h2 id="shortcuts-title" className="text-base font-serif font-bold text-[#332B25]">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts modal"
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#F4EFE6] text-[#81766B] hover:text-[#332B25] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {shortcuts.map(({ key, description }) => (
            <div
              key={key}
              className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-[#F8F4EC] border border-[#EAE1D3]"
            >
              <span className="text-xs text-[#81766B] font-medium">{description}</span>
              <kbd className="px-2 py-0.5 text-xs font-mono font-semibold text-[#332B25] bg-[#FFFDF8] border border-[#DCD0BE] rounded-md shadow-2xs">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-[#EFE8DC] text-center">
          <p className="text-[11px] text-[#9A8D7F] italic">
            &ldquo;Quiet minds build great things.&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
};
