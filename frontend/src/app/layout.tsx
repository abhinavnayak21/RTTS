import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { WebSocketProvider } from '../context/WebSocketContext';

export const metadata: Metadata = {
  title: 'RTTS - Real-Time Ticket Support System',
  description: 'Track, manage, and resolve customer support tickets in real-time with Kanban boards and status workflows.',
  icons: {
    icon: '/favicon_512.png',
    shortcut: '/favicon_512.png',
    apple: '/favicon_512.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" type="image/png" href="/favicon_512.png" />
        <link rel="apple-touch-icon" href="/favicon_512.png" />
      </head>
      <body>
        <AuthProvider>
          <WebSocketProvider>{children}</WebSocketProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
