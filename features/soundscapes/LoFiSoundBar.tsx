'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Coffee,
  CloudRain,
  Disc,
  Music,
  Wind,
  SlidersHorizontal,
  Bell,
} from 'lucide-react';
import { soundEngine } from './soundEngine';
import { LoFiTrackId, LOFI_TRACKS } from './types';

const SOUND_STORAGE_KEY = 'pomodoro_cafe_sound_v1';

function getInitialSoundSettings(): { track: LoFiTrackId; volume: number; isMuted: boolean } {
  if (typeof window === 'undefined') {
    return { track: 'cafe', volume: 0.4, isMuted: false };
  }
  try {
    const saved = localStorage.getItem(SOUND_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        track: parsed.selectedTrack || 'cafe',
        volume: typeof parsed.volume === 'number' ? parsed.volume : 0.4,
        isMuted: !!parsed.isMuted,
      };
    }
  } catch {}
  return { track: 'cafe', volume: 0.4, isMuted: false };
}

export const LoFiSoundBar: React.FC = () => {
  const [initialSettings] = useState(getInitialSoundSettings);
  const [selectedTrack, setSelectedTrack] = useState<LoFiTrackId>(initialSettings.track);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(initialSettings.volume);
  const [isMuted, setIsMuted] = useState<boolean>(initialSettings.isMuted);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [chimeTested, setChimeTested] = useState<boolean>(false);

  // Sync initial soundEngine volume on mount
  useEffect(() => {
    soundEngine.setVolume(initialSettings.volume);
    soundEngine.setMuted(initialSettings.isMuted);
  }, [initialSettings]);

  const saveSoundSettings = (track: LoFiTrackId, vol: number, muted: boolean) => {
    try {
      localStorage.setItem(
        SOUND_STORAGE_KEY,
        JSON.stringify({ selectedTrack: track, volume: vol, isMuted: muted })
      );
    } catch {}
  };

  const handleTogglePlay = () => {
    soundEngine.playTactileClick();
    if (isPlaying) {
      // Instant pause across all soundscapes and chords
      soundEngine.stopAmbient();
      setIsPlaying(false);
    } else {
      soundEngine.playTrack(selectedTrack);
      setIsPlaying(true);
    }
  };

  const handleSelectTrack = (trackId: LoFiTrackId) => {
    soundEngine.playTactileClick();
    setSelectedTrack(trackId);
    saveSoundSettings(trackId, volume, isMuted);
    if (isPlaying) {
      soundEngine.playTrack(trackId);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundEngine.setVolume(newVol);
    if (isMuted && newVol > 0) {
      setIsMuted(false);
      soundEngine.setMuted(false);
    }
    saveSoundSettings(selectedTrack, newVol, isMuted);
  };

  const handleToggleMute = () => {
    soundEngine.playTactileClick();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
    saveSoundSettings(selectedTrack, volume, nextMuted);
  };

  const handleTestChime = () => {
    soundEngine.playCompletionChime();
    setChimeTested(true);
    setTimeout(() => setChimeTested(false), 2400);
  };

  const getTrackIcon = (id: LoFiTrackId) => {
    switch (id) {
      case 'cafe': return <Coffee className="w-4 h-4" />;
      case 'rain': return <CloudRain className="w-4 h-4" />;
      case 'vinyl': return <Disc className="w-4 h-4" />;
      case 'chords': return <Music className="w-4 h-4" />;
      case 'ambience': return <Wind className="w-4 h-4" />;
    }
  };

  const currentTrackMeta = LOFI_TRACKS.find(t => t.id === selectedTrack) || LOFI_TRACKS[0];

  return (
    <div className="w-full max-w-md mx-auto" id="lofi-ambient-bar">
      {/* Mini Bar View */}
      <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-[#FFFDF8] border border-[#E2D8C9] shadow-xs">
        {/* Left: Play/Pause button + Track Info */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleTogglePlay}
            title={isPlaying ? 'Pause ambience immediately (M to mute)' : 'Play ambience'}
            aria-label={isPlaying ? 'Pause ambience' : 'Play ambience'}
            className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 active:scale-95 ${
              isPlaying
                ? 'bg-[#5C3D2E] text-[#FFFDF8] shadow-xs'
                : 'bg-[#EFE8DD] text-[#5C3D2E] hover:bg-[#E5DAC9]'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#332B25]">
                {currentTrackMeta.name}
              </span>
              {isPlaying && (
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BA5835] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#BA5835]"></span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#81766B] line-clamp-1">
              {isPlaying ? 'Playing ambient texture' : 'Optional background sound'}
            </p>
          </div>
        </div>

        {/* Right: Volume & Expand controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mute button */}
          <button
            type="button"
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F4EFE6] text-[#81766B] hover:text-[#332B25] transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-[#BA5835]" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          {/* Inline mini slider (visible on sm+) */}
          <div className="hidden sm:flex items-center w-20">
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={isMuted ? 0 : volume}
              onChange={e => handleVolumeChange(parseFloat(e.target.value))}
              aria-label="Ambience volume"
              className="w-full h-1.5 bg-[#E2D8C9] rounded-lg appearance-none cursor-pointer accent-[#5C3D2E]"
            />
          </div>

          {/* Toggle track picker drawer */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label="Select ambient sound track"
            title="Choose sound"
            className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 ${
              isExpanded
                ? 'bg-[#EAE1D3] text-[#332B25] border-[#D6CBB9]'
                : 'bg-[#F8F4EC] text-[#81766B] hover:text-[#332B25] border-[#E5DAC9]'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Sounds</span>
          </button>
        </div>
      </div>

      {/* Expanded Track Picker Menu & Chime Tester */}
      {isExpanded && (
        <div 
          className="mt-2 p-3 rounded-2xl bg-[#FFFDF8] border border-[#E2D8C9] shadow-xs animate-in fade-in slide-in-from-top-2 duration-150"
          id="lofi-track-picker"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EFE8DC]">
            <span className="text-xs font-semibold text-[#332B25]">Soundscapes</span>
            <div className="flex items-center gap-2 sm:hidden w-28">
              <span className="text-[10px] text-[#81766B]">Vol</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-[#E2D8C9] rounded-lg appearance-none accent-[#5C3D2E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
            {LOFI_TRACKS.map(track => {
              const isSelected = track.id === selectedTrack;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => handleSelectTrack(track.id)}
                  className={`flex items-start gap-2.5 p-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-[#F4EFE6] border border-[#D6CBB9] text-[#332B25]'
                      : 'hover:bg-[#F8F4EC] border border-transparent text-[#81766B]'
                  }`}
                >
                  <div 
                    className={`mt-0.5 p-1.5 rounded-lg ${
                      isSelected ? 'bg-[#5C3D2E] text-[#FFFDF8]' : 'bg-[#EFE8DD] text-[#81766B]'
                    }`}
                  >
                    {getTrackIcon(track.id)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#332B25] truncate">
                      {track.name}
                    </div>
                    <div className="text-[10px] text-[#81766B] line-clamp-1 leading-tight mt-0.5">
                      {track.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Chime Tester Card */}
          <div className="pt-2 border-t border-[#EFE8DC] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#5C3D2E]">
              <Bell className="w-3.5 h-3.5 text-[#BA5835]" />
              <span className="font-medium">Completion Chime</span>
            </div>
            <button
              type="button"
              onClick={handleTestChime}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border border-[#D6CBB9] bg-[#F8F4EC] hover:bg-[#EFE8DD] text-[#332B25] active:scale-95 transition-all"
              title="Test the singing bowl completion sound"
            >
              <span>{chimeTested ? '🔔 Playing Singing Bowl…' : 'Test Sound Chime'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
