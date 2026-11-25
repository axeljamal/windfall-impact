import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import Link from 'next/link';
import { SampleTag } from '@/components/SampleTag';
import { ThemeToggle } from '@/components/ThemeToggle';
import { themeScript } from '@/lib/theme';
import './globals.css';

// Caprasimo is Windfall's wordmark and Pip's voice only (DESIGN.md, the Pip's Voice Rule). Copied from the
// Windfall app's @expo-google-fonts/caprasimo package, so the build needs no network.
const caprasimo = localFont({ src: '../fonts/Caprasimo_400Regular.ttf', variable: '--font-caprasimo', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Windfall Impact', template: '%s · Windfall Impact' },
  description: 'What the Windfall pilot in Brighton & Hove is doing with surplus food: suppers, chairs, neighbourhoods and where the food comes from. Sample data from the pilot demo.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf7f2' },
    { media: '(prefers-color-scheme: dark)', color: '#141211' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={caprasimo.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:rounded-full focus:border focus:border-accent focus:bg-ground focus:px-4 focus:py-2">
          Skip to the numbers
        </a>
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 pb-16 pt-5 sm:px-5">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <Link href="/" className="inline-flex min-h-11 items-center gap-2" aria-label="Windfall Impact, home">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export, no image optimiser */}
              <img src="/pip-wave.png" alt="" width={44} height={44} className="size-11" />
              <span className="font-pip text-2xl leading-none">Windfall</span>
              <span className="kicker mt-1">Impact</span>
            </Link>
            <nav aria-label="Pages" className="flex flex-wrap items-center gap-2">
              <Link href="/" className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold underline-offset-4 hover:underline">
                Dashboard
              </Link>
              <Link href="/method" className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold underline-offset-4 hover:underline">
                How these numbers are made
              </Link>
              <ThemeToggle />
            </nav>
          </header>
          <main id="main" className="flex flex-col gap-6">
            {children}
          </main>
          <footer className="flex flex-col gap-3 border-t border-rule pt-4 text-sm leading-5">
            <SampleTag />
            <p>
              Windfall turns surplus food into small hosted suppers for three to eight neighbours, piloting in Brighton &amp; Hove. Try it at{' '}
              <a className="font-semibold text-accent-text underline underline-offset-2" href="https://windfall.marea-dvipa.uk">
                windfall.marea-dvipa.uk
              </a>
              , or the demo these numbers come from at{' '}
              <a className="font-semibold text-accent-text underline underline-offset-2" href="https://demo.marea-dvipa.uk">
                demo.marea-dvipa.uk
              </a>
              .
            </p>
          </footer>
        </div>
      </body>
    </html>
  );
}
