import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Pomodoro — Minimalist Coffee Shop Companion',
  description: 'A calm, minimalist Pomodoro companion inspired by specialty coffee shops and analog notebooks.',
  openGraph: {
    title: 'Pomodoro — Minimalist Coffee Shop Companion',
    description: 'A calm, minimalist Pomodoro companion inspired by specialty coffee shops and analog notebooks.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pomodoro — Minimalist Coffee Shop Companion',
    description: 'A calm, minimalist Pomodoro companion inspired by specialty coffee shops and analog notebooks.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
