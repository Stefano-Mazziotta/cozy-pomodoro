# Pomodoro Companion

A calm, minimalist Pomodoro timer companion inspired by specialty coffee shops and analog notebooks.

## Features

- **Automatic Flow**: Strictly guides you through Work $\to$ Short Break $\to$ Long Break intervals with zero friction and automated progression.
- **Synthesized Ambient Soundscapes**: 100% procedural, offline Web Audio soundscapes including:
  - Cozy Coffee Shop (velvety room resonance, subtle steam, and indistinct ambient murmur)
  - Gentle Rainfall
  - Warm Vinyl Crackle
  - Lo-Fi Rhodes Chords
  - 432 Hz Harmonic Ambience
- **Comfortable Acoustic Chime**: A sweet dual-tone harmonic bell chime ($E_5 \to B_5$) with soft mallet bloom and cozy acoustic decay.
- **Tactile Timer Controls**: Analog-inspired start, pause, skip, and reset controls with audio feedback.
- **Modern Live Clock**: Real-time tabular clock with date display in the footer.
- **Session Progress Tracking**: Visual dot indicators tracking intervals until the long break.
- **Customizable Intervals**: Configurable work sessions, short breaks, long breaks, and intervals cycle target.
- **Keyboard Shortcuts**: Quick control via Space (Start/Pause), R (Reset), S (Skip), C (Settings), and M (Mute).

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Development Server

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm run start
```

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio**: Web Audio API (procedural synthesis)
