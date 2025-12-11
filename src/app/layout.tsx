import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import AuthProvider from '@/components/AuthProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'FitHood - Personal Fitness Tracker',
  description: 'Track your calories, macros, weight, and workouts',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FitHood',
  },
}

export const viewport: Viewport = {
  themeColor: '#00ff88',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
