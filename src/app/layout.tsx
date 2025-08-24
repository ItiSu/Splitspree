import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from '@/lib/store/context';
import DarkVeil from '@/components/DarkVeil';

export const metadata: Metadata = {
  title: 'SplitSpree',
  description: 'AI-powered bill splitting from receipts.',
  icons: {
    icon: [
      { url: '/favicon_light.ico', media: '(prefers-color-scheme: light)' },
      { url: '/favicon_dark.ico', media: '(prefers-color-scheme: dark)' }
    ],
    shortcut: [
      { url: '/favicon_light.ico', media: '(prefers-color-scheme: light)' },
      { url: '/favicon_dark.ico', media: '(prefers-color-scheme: dark)' }
    ],
    apple: '/ss-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              function updateFavicon() {
                const favicon = document.querySelector('link[rel="icon"]');
                if (favicon) {
                  favicon.href = window.matchMedia('(prefers-color-scheme: dark)').matches 
                    ? '/favicon_dark.ico' 
                    : '/favicon_light.ico';
                }
              }
              const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
              mediaQuery.addEventListener('change', updateFavicon);
              updateFavicon();
            })();
          `
        }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased relative">
        <div className="fixed inset-0 -z-10">
          <DarkVeil 
            hueShift={30}
            noiseIntensity={0.02}
            scanlineIntensity={0.1}
            speed={0.5}
            scanlineFrequency={1}
            warpAmount={0.2}
          />
        </div>
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
