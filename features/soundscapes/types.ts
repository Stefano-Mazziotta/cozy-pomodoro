export type LoFiTrackId = 'cafe' | 'rain' | 'vinyl' | 'chords' | 'ambience';

export interface LoFiTrack {
  id: LoFiTrackId;
  name: string;
  description: string;
  tag: string;
}

export const LOFI_TRACKS: LoFiTrack[] = [
  {
    id: 'cafe',
    name: 'Coffee Shop',
    description: 'Warm low-frequency chatter with gentle ceramic clinks',
    tag: 'Warm Room',
  },
  {
    id: 'rain',
    name: 'Gentle Rain',
    description: 'Soft rhythmic rainfall filtered for concentration',
    tag: 'Soothing',
  },
  {
    id: 'vinyl',
    name: 'Vinyl & Tape',
    description: 'Analog mechanical motor hum, subtle crackle, and tape hiss',
    tag: 'Nostalgic',
  },
  {
    id: 'chords',
    name: 'Lo-Fi Chords',
    description: 'Slow-cycling warm electric piano jazz chords (instant fade on pause)',
    tag: 'Harmonic',
  },
  {
    id: 'ambience',
    name: 'Warm Ambience',
    description: '432Hz deep meditative drone with analog lowpass',
    tag: 'Calm Drone',
  },
];
